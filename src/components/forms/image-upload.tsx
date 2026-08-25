"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Image, X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
  maxSizeMB?: number
}

export function ImageUpload({ images, onImagesChange, maxImages = 5, maxSizeMB = 10 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        alert(`File ${file.name} exceeds ${maxSizeMB}MB limit`)
        return false
      }
      return true
    })

    const remainingSlots = maxImages - images.length
    const filesToAdd = validFiles.slice(0, remainingSlots)
    
    const newImages = [...images, ...filesToAdd]
    onImagesChange(newImages)

    filesToAdd.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [images, maxImages, maxSizeMB, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages,
  })

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).click()
          }
        }}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-gray-400" />
        <p className="mt-3 text-sm text-gray-600">
          {isDragActive
            ? "Drop images here..."
            : `Drag & drop images here, or click to select (max ${maxImages} images, ${maxSizeMB}MB each)`}
        </p>
        <p className="mt-1 text-xs text-gray-400">Supports: JPG, PNG, WebP</p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img
                src={preview}
                alt={`Upload preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 rounded-full bg-red-500/90 p-1 text-white hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-amber-600">Maximum number of images reached</p>
      )}
    </div>
  )
}