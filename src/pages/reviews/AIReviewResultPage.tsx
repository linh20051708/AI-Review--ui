import AIReviewSection from "@/components/review/AIReviewSection"

import BackLink from "@/components/ui/BackLink"

import EmptyState from "@/components/ui/EmptyState"

import PageHeading from "@/components/ui/PageHeading"

import useReviewFromParams from "./useReviewFromParams"

import "@/styles/review-refinement.css"

export default function AIReviewResultPage() {
  const { review } = useReviewFromParams()

  if (!review) return <EmptyState title="Không tìm thấy yêu cầu review" />

  return (
    <div className="phase-one flex min-w-0 flex-col gap-3 text-[14px]">
      <BackLink label="Không gian review" fallback={"/reviews/" + review.id} />
      <PageHeading
        title="Kết quả AI"
        description={review.documentTitle + " · " + review.version}
      />
      <AIReviewSection
        key={review.id + review.version}
        review={review}
        detailed
      />
    </div>
  )
}
