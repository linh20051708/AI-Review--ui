import type { FeedbackSeverity, Tone } from "@/types"

export const severityTone: Record<FeedbackSeverity, Tone> = { Minor: "amber", Major: "rust", Critical: "danger" }
