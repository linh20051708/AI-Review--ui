import { FileText, Lock } from "lucide-react"
import StatusTracks from "@/components/review/StatusTracks"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import MetaGrid from "@/components/ui/MetaGrid"
import { lockReason } from "@/data/mockData"
import type { ProjectDocument } from "@/types"
import useDocumentState from "./useDocumentState"

/** Logical document card. Versions are listed on the version history page; supervisors only read and review. */
export default function DocumentCard({ doc: raw }: { doc: ProjectDocument }) {
  const doc = useDocumentState(raw)
  const reviewable = doc.supervisorStatus === "waiting" || doc.supervisorStatus === "inReview"
  return (
    <Card>
      <div className="flex items-center gap-2">
        <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 text-[17px] font-semibold text-ink">{doc.title}</span>
        <Badge>{doc.versionCount ? `${doc.versionCount} version` : "Chưa có version"}</Badge>
      </div>
      <div className="rounded-[8px] bg-subtle p-2.5">
        <StatusTracks documentStatus={doc.documentStatus} aiStatus={doc.ai ? "aiReviewed" : "notRun"} ai={doc.ai} supervisorStatus={doc.supervisorStatus} compact />
      </div>
      {doc.latestVersion && <MetaGrid items={[{ label: "Version mới nhất", value: doc.latestVersion }, { label: "Người nộp", value: doc.submitter ?? "—" }, { label: "Cập nhật", value: doc.updatedAt ?? "—" }]} />}
      {doc.submissionLocked && doc.dependsOn && (
        <div className="flex gap-2 rounded-[8px] border border-line p-2.5 text-[12px] leading-[1.45]">
          <Lock size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-muted" />
          <p className="text-muted">
            <span className="font-semibold text-ink">Khóa gửi review</span> · Phụ thuộc: {doc.dependsOn}. {lockReason(doc.dependsOn)}
          </p>
        </div>
      )}
      {doc.note && <p className="text-[12px] leading-[1.45] text-muted">{doc.note}</p>}
      {doc.reviewId && (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" to={`/reviews/${doc.reviewId}/versions`}>Lịch sử version</Button>
          <Button variant={reviewable ? "primary" : "secondary"} to={`/reviews/${doc.reviewId}`}>{reviewable ? "Review" : "Xem"}</Button>
        </div>
      )}
      {!doc.reviewId && doc.latestVersion && (
        <p className="text-[12px] text-muted">Không có yêu cầu review đang mở cho version này.</p>
      )}
    </Card>
  )
}
