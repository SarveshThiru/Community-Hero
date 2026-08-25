"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Image, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "./image-upload"
import { cn } from "@/lib/utils"

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment too long"),
})

type CommentFormData = z.infer<typeof commentSchema>

interface CommentFormProps {
  onSubmit: (data: CommentFormData, images: File[]) => Promise<void>
  isLoading?: boolean
  placeholder?: string
}

export function CommentForm({ onSubmit, isLoading, placeholder = "Add a comment..." }: CommentFormProps) {
  const [images, setImages] = useState<File[]>([])
  const [showImages, setShowImages] = useState(false)

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  })

  const handleSubmit = async (data: CommentFormData) => {
    await onSubmit(data, images)
    form.reset()
    setImages([])
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder={placeholder}
            rows={2}
            className="resize-none"
            error={form.formState.errors.content?.message}
            {...form.register("content")}
          />

          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={3}
            maxSizeMB={5}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={isLoading || !form.getValues("content").trim()}>
              <Send className="mr-1 h-4 w-4" />
              Post Comment
            </Button>
            {images.length > 0 && (
              <span className="text-sm text-gray-500">{images.length} image(s) attached</span>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}