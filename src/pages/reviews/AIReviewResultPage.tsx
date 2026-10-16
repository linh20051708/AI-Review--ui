import AIReviewSection from "@/components/review/AIReviewSection"
import BackLink from "@/components/ui/BackLink"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import useReviewFromParams from "./useReviewFromParams"
export default function AIReviewResultPage() {
  const { review } = useReviewFromParams()
  if (!review) return <EmptyState title="Không tìm thấy yêu cầu review" />
  return (
    <>
      <BackLink label="Không gian review" fallback={"/reviews/" + review.id} />
      <PageHeading
        title="Kết quả AI Evaluation"
        description={review.documentTitle + " · " + review.version}
      />
      <AIReviewSection
        key={review.id + review.version}
        review={review}
        detailed
      />
    </>
  )
}
