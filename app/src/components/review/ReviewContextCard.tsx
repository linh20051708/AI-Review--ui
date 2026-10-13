import { FileText } from "lucide-react"
import type { ReactNode } from "react"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import type { ReviewRequest } from "@/types"
import StatusTracks from "./StatusTracks"

export default function ReviewContextCard({ review, children }: { review: ReviewRequest; children?: ReactNode }) {
  return (
    <Card>
      <span className="text-[12px] text-muted">{review.classCode} · {review.groupName}</span>
      <p className="text-[17px] leading-[1.45] font-semibold text-ink">{review.projectName}</p>
      <div className="flex items-center gap-2">
        <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{review.documentTitle}</span>
        <Badge>{review.version}</Badge>
      </div>
      <StatusTracks documentStatus={review.documentStatus} aiStatus={review.aiStatus} ai={review.ai} supervisorStatus={review.supervisorStatus} compact />
      {children}
    </Card>
  )
}
