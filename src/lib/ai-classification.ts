import * as tf from "@tensorflow/tfjs"
// Turbopack tree-shakes the umbrella package's side-effect-only backend
// registrations - import them explicitly or tf initializes with no backend.
import "@tensorflow/tfjs-backend-cpu"
import "@tensorflow/tfjs-backend-webgl"
import * as mobilenet from "@tensorflow-models/mobilenet"

let modelPromise: Promise<mobilenet.MobileNet> | null = null

export async function loadModel(): Promise<mobilenet.MobileNet> {
  if (!modelPromise) {
    modelPromise = (async () => {
      await tf.ready()
      return mobilenet.load()
    })()
  }
  return modelPromise
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  pothole: ["pothole", "hole", "crack", "asphalt", "road damage", "pavement", "street damage"],
  water_leakage: ["water", "leak", "pipe", "flood", "wet", "puddle", "water main", "burst"],
  streetlight: ["streetlight", "light", "lamp", "pole", "lighting", "dark", "broken light"],
  garbage: ["garbage", "trash", "waste", "bin", "dumpster", "overflowing", "rubbish", "litter"],
  road_hazard: ["hazard", "debris", "obstacle", "dangerous", "unsafe", "barrier", "cone"],
  illegal_dumping: ["dumping", "dumped", "illegal", "furniture", "appliance", "construction waste"],
  sidewalk: ["sidewalk", "footpath", "walkway", "curb", "pedestrian", "paving stone"],
  drainage: ["drain", "sewer", "storm drain", "catch basin", "flooding", "clogged"],
  traffic_signal: ["traffic light", "signal", "stoplight", "intersection", "crosswalk"],
}

const SEVERITY_KEYWORDS: Record<string, string[]> = {
  critical: ["emergency", "dangerous", "urgent", "immediate", "critical", "severe", "collapse", "sinkhole"],
  high: ["major", "significant", "large", "deep", "extensive", "widespread", "blocking"],
  medium: ["moderate", "noticeable", "visible", "concerning", "needs attention"],
  low: ["minor", "small", "slight", "cosmetic", "aesthetic", "low priority"],
}

export async function classifyImage(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{
  category: string
  confidence: number
  severity: "low" | "medium" | "high" | "critical"
  severityConfidence: number
  suggestedTitle: string
}> {
  const mobilenetModel = await loadModel()
  const predictions = await mobilenetModel.classify(imageElement)

  const topPredictions = predictions.slice(0, 5)

  let bestCategory = "other"
  let bestConfidence = 0

  for (const prediction of topPredictions) {
    const className = prediction.className.toLowerCase()
    const confidence = prediction.probability

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (className.includes(keyword) && confidence > bestConfidence) {
          bestCategory = category
          bestConfidence = confidence
        }
      }
    }
  }

  const severity = classifySeverityFromImage(topPredictions)
  const severityConfidence = 0.7

  const suggestedTitle = generateTitle(bestCategory, severity)

  return {
    category: bestCategory,
    confidence: bestConfidence,
    severity,
    severityConfidence,
    suggestedTitle,
  }
}

type ImagePrediction = { className: string; probability: number }

function classifySeverityFromImage(predictions: ImagePrediction[]): "low" | "medium" | "high" | "critical" {
  const classNames = predictions.map(p => p.className.toLowerCase()).join(" ")

  for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (classNames.includes(keyword)) {
        return severity as "low" | "medium" | "high" | "critical"
      }
    }
  }

  const topClass = predictions[0]?.className.toLowerCase() || ""
  if (topClass.includes("severe") || topClass.includes("major") || topClass.includes("extensive")) {
    return "high"
  }
  if (topClass.includes("minor") || topClass.includes("small")) {
    return "low"
  }

  return "medium"
}

export function classifyFromText(description: string, title: string): {
  category: string
  confidence: number
  severity: "low" | "medium" | "high" | "critical"
  severityConfidence: number
} {
  const text = `${title} ${description}`.toLowerCase()

  let bestCategory = "other"
  let bestConfidence = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let matches = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++
      }
    }
    const confidence = matches / keywords.length
    if (confidence > bestConfidence) {
      bestConfidence = confidence
      bestCategory = category
    }
  }

  let bestSeverity: "low" | "medium" | "high" | "critical" = "medium"
  let bestSeverityConfidence = 0

  for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    let matches = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++
      }
    }
    const confidence = matches / keywords.length
    if (confidence > bestSeverityConfidence) {
      bestSeverityConfidence = confidence
      bestSeverity = severity as "low" | "medium" | "high" | "critical"
    }
  }

  return {
    category: bestCategory,
    confidence: Math.max(bestConfidence, 0.3),
    severity: bestSeverity,
    severityConfidence: Math.max(bestSeverityConfidence, 0.5),
  }
}

function generateTitle(category: string, severity: string): string {
  const categoryLabels: Record<string, string> = {
    pothole: "Pothole",
    water_leakage: "Water Leakage",
    streetlight: "Damaged Streetlight",
    garbage: "Overflowing Garbage",
    road_hazard: "Road Hazard",
    illegal_dumping: "Illegal Dumping",
    sidewalk: "Sidewalk Damage",
    drainage: "Drainage Issue",
    traffic_signal: "Traffic Signal Issue",
    other: "Community Issue",
  }

  const severityPrefix: Record<string, string> = {
    critical: "URGENT: ",
    high: "High Priority: ",
    medium: "",
    low: "Minor: ",
  }

  return `${severityPrefix[severity] || ""}${categoryLabels[category] || "Community Issue"} Report`
}

export async function classifyIssue(
  imageElement?: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  description?: string,
  title?: string
): Promise<{
  category: string
  confidence: number
  severity: "low" | "medium" | "high" | "critical"
  severityConfidence: number
  suggestedTitle: string
}> {
  let imageResult: Awaited<ReturnType<typeof classifyImage>> | null = null
  let textResult = classifyFromText(description || "", title || "")

  if (imageElement) {
    try {
      imageResult = await classifyImage(imageElement)
    } catch (error) {
      console.error("Image classification failed:", error)
    }
  }

  if (imageResult && imageResult.confidence > textResult.confidence) {
    return {
      category: imageResult.category,
      confidence: imageResult.confidence,
      severity: imageResult.severity,
      severityConfidence: imageResult.severityConfidence,
      suggestedTitle: imageResult.suggestedTitle,
    }
  }

  return {
    category: textResult.category,
    confidence: textResult.confidence,
    severity: textResult.severity,
    severityConfidence: textResult.severityConfidence,
    suggestedTitle: generateTitle(textResult.category, textResult.severity),
  }
}