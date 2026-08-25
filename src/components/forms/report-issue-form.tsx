"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MapPin, Loader2, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "./image-upload"
import { useGeolocation } from "@/hooks/use-map"
import { classifyIssue } from "@/lib/ai-classification"
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from "@/lib/utils"
import type { AIClassificationResult } from "@/types"

const reportIssueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description too long"),
  category: z.string().min(1, "Please select a category"),
  severity: z.string().min(1, "Please select severity"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(5, "Please provide a location"),
})

type ReportIssueFormData = z.infer<typeof reportIssueSchema>

interface ReportIssueFormProps {
  onSubmit: (data: ReportIssueFormData, images: File[]) => Promise<void>
  initialData?: Partial<ReportIssueFormData>
  isLoading?: boolean
}

export function ReportIssueForm({ onSubmit, initialData, isLoading }: ReportIssueFormProps) {
  const [images, setImages] = useState<File[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState("")
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null)
  const [showAiSuggestion, setShowAiSuggestion] = useState(false)
  const imageInputRef = useRef<HTMLImageElement>(null)

  const { position, loading: geoLoading, error: geoError, getCurrentPosition } = useGeolocation()

  const form = useForm<ReportIssueFormData>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      severity: "medium",
      latitude: 0,
      longitude: 0,
      address: "",
      ...initialData,
    },
  })

  const watchedLatitude = form.watch("latitude")
  const watchedLongitude = form.watch("longitude")

  const handleLocationDetect = useCallback(() => {
    getCurrentPosition()
  }, [getCurrentPosition])

  useEffect(() => {
    if (!position) return
    setLocation(position)
    form.setValue("latitude", position.lat)
    form.setValue("longitude", position.lng)
  }, [position, form])

  useEffect(() => {
    if (initialData?.latitude && initialData?.longitude) {
      setLocation({ lat: initialData.latitude, lng: initialData.longitude })
      form.setValue("latitude", initialData.latitude)
      form.setValue("longitude", initialData.longitude)
    }
    if (initialData?.address) {
      setAddress(initialData.address)
      form.setValue("address", initialData.address)
    }
  }, [initialData, form])

  const handleImageAnalysis = async () => {
    if (images.length === 0) return

    setClassifying(true)
    try {
      const img = new Image()
      img.src = URL.createObjectURL(images[0])
      await new Promise(resolve => { img.onload = resolve })

      const result = await classifyIssue(img, form.getValues("description"), form.getValues("title"))
      setAiResult(result)
      setShowAiSuggestion(true)
    } catch (error) {
      console.error("AI classification failed:", error)
    } finally {
      setClassifying(false)
    }
  }

  const applyAiSuggestion = () => {
    if (!aiResult) return

    form.setValue("category", aiResult.category)
    form.setValue("severity", aiResult.severity)
    if (!form.getValues("title")) {
      form.setValue("title", aiResult.suggestedTitle)
    }
    setShowAiSuggestion(false)
  }

  const handleSubmit = async (data: ReportIssueFormData) => {
    await onSubmit(data, images)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Issue Details
            {aiResult && (
              <Badge variant="info" className="ml-2">
                <Sparkles className="mr-1 h-3 w-3" /> AI Suggestions Available
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            placeholder="Brief, descriptive title (e.g., Large pothole on Main St)"
            error={form.formState.errors.title?.message}
            {...form.register("title")}
          />

          <Textarea
            label="Description"
            placeholder="Describe the issue in detail: what you see, when you noticed it, any safety concerns..."
            rows={4}
            error={form.formState.errors.description?.message}
            {...form.register("description")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              value={form.getValues("category")}
              onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={form.getValues("severity")}
              onValueChange={(v) => form.setValue("severity", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map(sev => (
                  <SelectItem key={sev.value} value={sev.value}>
                    <span className="flex items-center gap-2">
                      <Badge variant={sev.color as any} className="mr-2">
                        {sev.label}
                      </Badge>
                      {sev.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showAiSuggestion && aiResult && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">AI Analysis Suggestion</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Category: <strong>{ISSUE_CATEGORIES.find(c => c.value === aiResult.category)?.label || aiResult.category}</strong>
                    ({(aiResult.confidence * 100).toFixed(0)}% confidence)
                  </p>
                  <p className="text-sm text-blue-700">
                    Severity: <strong>{aiResult.severity}</strong>
                    ({(aiResult.severityConfidence * 100).toFixed(0)}% confidence)
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button type="button" variant="default" size="sm" onClick={applyAiSuggestion}>
                      Apply Suggestion
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAiSuggestion(false)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ImageUpload images={images} onImagesChange={setImages} />

          {images.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleImageAnalysis}
              disabled={classifying}
              className="w-full"
            >
              {classifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Images...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleLocationDetect}
              disabled={geoLoading}
              className="flex-1"
            >
              {geoLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use Current Location
                </>
              )}
            </Button>
          </div>

          {geoError && (
            <p className="text-sm text-red-600" role="alert">{geoError}</p>
          )}

          <Input
            label="Address / Location"
            placeholder="Enter address, landmark, or intersection"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              form.setValue("address", e.target.value)
            }}
            error={form.formState.errors.address?.message}
            readOnly={detectingLocation}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              placeholder="Latitude"
              value={watchedLatitude || ""}
              onChange={(e) => form.setValue("latitude", parseFloat(e.target.value) || 0)}
              readOnly
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              placeholder="Longitude"
              value={watchedLongitude || ""}
              onChange={(e) => form.setValue("longitude", parseFloat(e.target.value) || 0)}
              readOnly
            />
          </div>

          {location && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">
                <CheckCircle className="inline h-4 w-4 mr-1" /> Location detected:{' '}
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 pt-4">
        <Button type="submit" size="lg" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => form.reset()}>
          Clear Form
        </Button>
      </div>
    </form>
  )
}

import { useRef } from "react"