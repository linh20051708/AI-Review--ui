import { useReviewStore } from "@/data/reviewStore"
import type { ProjectDocument } from "@/types"

/** Merges the live supervisor decision from the review workflow into a logical document. */
export default function useDocumentState(doc: ProjectDocument) {
  const { requests } = useReviewStore()
  const req = doc.reviewId ? requests.find((r) => r.id === doc.reviewId) : undefined
  return { ...doc, supervisorStatus: req?.supervisorStatus ?? doc.supervisorStatus }
}
