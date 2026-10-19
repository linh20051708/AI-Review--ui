import { currentIllustration } from "@/lib/rubric"
import type { AIEvaluation, ReviewRequest } from "@/types"

/** Read-only projection. Request counters are historical metadata, not an evaluation. */
export function evaluationForReview(review: ReviewRequest, evaluations: AIEvaluation[]) {
  return evaluations.filter(e => e.reviewId === review.id && e.documentVersion === review.version &&
    (!review.documentId || e.documentId === review.documentId)).at(-1)
}

export function reviewAI(review: ReviewRequest, evaluations: AIEvaluation[]) {
  const run = evaluationForReview(review, evaluations)
  if (!run || run.evaluationStatus !== "completed") return { status: run?.evaluationStatus ?? "notRun", counts: undefined }
  // Match the existing AI Result presentation without creating or persisting a run.
  const result = currentIllustration(run, review.documentTitle)
  return { status: "completed" as const, counts: {
    errors: result.findings.filter(f => f.level === "error").length,
    warnings: result.findings.filter(f => f.level === "warning").length,
    suggestions: result.criterionResults.reduce((n, c) => n + c.suggestions.length, 0),
  } }
}

export function compareReviewAI(a: ReviewRequest, b: ReviewRequest, evaluations: AIEvaluation[]) {
  const first = reviewAI(a, evaluations).counts, second = reviewAI(b, evaluations).counts
  return (second?.errors ?? -1) - (first?.errors ?? -1) || (second?.warnings ?? -1) - (first?.warnings ?? -1)
}
