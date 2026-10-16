import { Lock } from "lucide-react"
import { Link } from "react-router-dom"
import ReviewContextCard from "@/components/review/ReviewContextCard"
import TimelineItem from "@/components/review/TimelineItem"
import BackLink from "@/components/ui/BackLink"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import { useReviewStore } from "@/data/reviewStore"
import useReviewFromParams from "./useReviewFromParams"

export default function ReviewHistoryPage() {
  const { review } = useReviewFromParams()
  const { audit, feedback } = useReviewStore()
  if (!review) return <EmptyState title="Không tìm thấy yêu cầu review" />
  const events = audit.filter((e) => e.reviewId === review.id)

  return (
    <>
      <BackLink label="Không gian review" fallback={`/reviews/${review.id}`} />
      <PageHeading
        title="Lịch sử review"
        description="Nhật ký đầy đủ: upload, yêu cầu review, AI Review, feedback và quyết định của giảng viên."
      />
      <ReviewContextCard review={review} />
      <section className="flex flex-col gap-3">
        <SectionHeader title="Audit trail" meta={`${events.length} sự kiện`} />
        {events.length ? (
          <Card>
            <ol>
              {events.map((e, i) => (
                <TimelineItem
                  key={e.id}
                  event={e}
                  last={i === events.length - 1}
                />
              ))}
            </ol>
          </Card>
        ) : (
          <EmptyState
            title="Chưa có sự kiện"
            description="Các sự kiện sẽ được ghi lại khi sinh viên nộp và giảng viên review."
          />
        )}
        <p className="inline-flex items-center gap-1.5 text-[12px] text-muted">
          <Lock size={13} strokeWidth={1.75} />
          Chỉ đọc · Sự kiện không thể chỉnh sửa hoặc xóa.
        </p>
        <Notice>
          AI Review không đưa ra quyết định phê duyệt. Mọi quyết định được ghi
          nhận từ giảng viên.
        </Notice>
        {events
          .filter((e) => e.selectedFeedbackIds)
          .map((e) => (
            <Card key={e.id}>
              <h3 className="text-[14px] font-semibold">
                Feedback chính thức · {e.documentVersion}
              </h3>
              {e.selectedFeedbackIds!.length ? (
                e.selectedFeedbackIds!.map((id) => (
                  <p key={id} className="text-[14px]">
                    {feedback.find((f) => f.id === id)?.message ??
                      "Feedback không còn khả dụng"}
                  </p>
                ))
              ) : (
                <p>Không đính kèm feedback.</p>
              )}
            </Card>
          ))}
      </section>
      <Link
        to={`/reviews/${review.id}/versions`}
        className="self-start text-[13px] font-semibold text-brand"
      >
        Xem lịch sử version →
      </Link>
      <Link
        to={`/reviews/${review.id}/ai-result`}
        className="inline-flex min-h-12 items-center text-[14px] font-semibold text-brand"
      >
        Kết quả và lịch sử AI →
      </Link>
    </>
  )
}
