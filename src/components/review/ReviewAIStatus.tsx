import { useReviewStore } from "@/data/reviewStore"
import { aiSummary } from "@/data/mockData"
import { reviewAI } from "@/lib/reviewPresentation"
import type { ReviewRequest } from "@/types"

export default function ReviewAIStatus({ review }: { review?: ReviewRequest }) {
  const { evaluations } = useReviewStore()
  const ai = review ? reviewAI(review, evaluations) : undefined
  return <span className="text-[14px] text-muted">{ai?.counts ? `AI đề xuất: ${aiSummary(ai.counts)}` :
    ai?.status === "loading" ? "AI đang xử lý" : ai?.status === "error" ? "AI chưa hoàn tất · Cần thử lại" : "AI chưa có kết quả"}</span>
}
