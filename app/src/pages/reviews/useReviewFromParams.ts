import { useParams } from "react-router-dom"
import { useReview } from "@/data/reviewStore"

export default function useReviewFromParams() {
  const { reviewId } = useParams()
  return { reviewId, review: useReview(reviewId) }
}
