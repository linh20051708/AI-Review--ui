import { Eye, FilePenLine, FileText } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { isCompleted } from "@/data/selectors"
import { useManagement } from "@/data/managementStore"
import { fmtRelative } from "@/lib/time"
import type { ReviewRequest } from "@/types"
import StatusTracks from "./StatusTracks"

export default function ReviewRequestCard({ review }: { review: ReviewRequest }) {
  const { courses } = useManagement()
  const done = isCompleted(review.supervisorStatus)
  const cta = review.supervisorStatus === "inReview" ? "Tiếp tục review" : "Review ngay"
  return (
    <Card>
      <div className="flex justify-between gap-3 text-[12px] leading-[1.45] text-muted">
        <span className="min-w-0">{courses.find((c) => c.id === review.courseId)?.code} · {review.classCode} · {review.groupName}</span>
        <span className="shrink-0" title={review.requestedAt}>{fmtRelative(review.requestedTs)}</span>
      </div>
      <p className="text-[17px] leading-[1.45] font-semibold text-ink">{review.projectName}</p>
      <div className="flex items-center gap-2">
        <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{review.documentTitle}</span>
        <Badge>{review.version}</Badge>
        <Badge>{review.fileType === "PDF" ? "PDF" : "Word"}</Badge>
      </div>
      <div className="rounded-[8px] bg-subtle p-2.5">
        <StatusTracks documentStatus={review.documentStatus} aiStatus={review.aiStatus} ai={review.ai} supervisorStatus={review.supervisorStatus} compact />
      </div>
      {review.note && <p className="text-[12px] leading-[1.45] text-muted">{review.note}</p>}
      {done ? (
        <Button variant="secondary" to={`/reviews/${review.id}`} icon={<Eye size={18} strokeWidth={1.75} />}>Xem</Button>
      ) : (
        <Button to={`/reviews/${review.id}`} icon={<FilePenLine size={18} strokeWidth={1.75} />}>{cta}</Button>
      )}
    </Card>
  )
}
