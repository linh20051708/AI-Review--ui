import { FileText, Lock } from "lucide-react"
import { useReviewStore } from "@/data/reviewStore"
import ReviewAIStatus from "@/components/review/ReviewAIStatus"
import StatusBadge from "@/components/ui/StatusBadge"
import StatusTracks from "@/components/review/StatusTracks"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import MetaGrid from "@/components/ui/MetaGrid"
import { lockReason } from "@/data/mockData"
import type { ProjectDocument } from "@/types"
import useDocumentState from "./useDocumentState"

/** Logical document card. Versions are listed on the version history page; supervisors only read and review. */
export default function DocumentCard({ doc: raw, compact = false }: { doc: ProjectDocument; compact?: boolean }) {
  const doc = useDocumentState(raw)
  const { requests } = useReviewStore()
  const review = requests.find(r => r.id === doc.reviewId && r.version === doc.latestVersion)
  const reviewable = doc.supervisorStatus === "waiting" || doc.supervisorStatus === "inReview"
  if (compact) return <li className="flex min-w-0 flex-col gap-2 px-4 py-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <h2 className="min-w-0 text-[16px] font-semibold">{doc.title} {doc.latestVersion && <span className="text-[14px] font-normal text-muted">· {doc.latestVersion}</span>}</h2>
      <StatusBadge status={doc.supervisorStatus ?? doc.documentStatus} />
    </div>
    {doc.submissionLocked && <p className="flex items-start gap-2 text-[14px] text-muted"><Lock size={16} className="mt-0.5 shrink-0" />{doc.dependsOn ? `Cần duyệt ${doc.dependsOn} trước khi gửi đánh giá.` : "Đang khóa gửi đánh giá."}</p>}
    <div className="flex flex-wrap items-start justify-between gap-2">
      <details className="min-w-0 flex-1 basis-36">
        <summary className="flex min-h-12 cursor-pointer items-center text-[14px] font-medium text-muted">Chi tiết tài liệu</summary>
        <div className="flex flex-col gap-3 pb-2 text-[14px]">
          <StatusTracks documentStatus={doc.documentStatus} aiContent={<ReviewAIStatus review={review} />} supervisorStatus={doc.supervisorStatus} compact />
          <p className="text-muted">{doc.versionCount} phiên bản · {doc.submitter ?? "Chưa có người nộp"}</p>
          {doc.updatedAt && <p className="text-muted">Cập nhật: {doc.updatedAt}</p>}
          {doc.note && <p>{doc.note}</p>}
          {doc.submissionLocked && doc.dependsOn && <p className="text-muted">{lockReason(doc.dependsOn)}</p>}
          {doc.reviewId && <Button variant="secondary" to={`/reviews/${doc.reviewId}/versions`}>Lịch sử phiên bản</Button>}
          {!doc.reviewId && doc.latestVersion && <p>Không có yêu cầu đánh giá đang mở cho phiên bản này.</p>}
        </div>
      </details>
      {doc.reviewId && <Button className="w-auto px-4" variant={reviewable ? "primary" : "secondary"} to={`/reviews/${doc.reviewId}`}>{reviewable ? "Đánh giá" : "Xem"}</Button>}
    </div>
  </li>
  return (
    <Card>
      <div className="flex items-center gap-2">
        <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 text-[17px] font-semibold text-ink">{doc.title}</span>
        <Badge>{doc.versionCount ? `${doc.versionCount} phiên bản` : "Chưa có phiên bản"}</Badge>
      </div>
      <div className="rounded-[8px] bg-subtle p-2.5">
        <StatusTracks documentStatus={doc.documentStatus} aiContent={<ReviewAIStatus review={review} />} supervisorStatus={doc.supervisorStatus} compact />
      </div>
      {doc.latestVersion && <MetaGrid items={[{ label: "Phiên bản mới nhất", value: doc.latestVersion }, { label: "Người nộp", value: doc.submitter ?? "—" }, { label: "Cập nhật", value: doc.updatedAt ?? "—" }]} />}
      {doc.submissionLocked && doc.dependsOn && (
        <div className="flex gap-2 rounded-[8px] border border-line p-2.5 text-[12px] leading-[1.45]">
          <Lock size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-muted" />
          <p className="text-muted">
            <span className="font-semibold text-ink">Khóa gửi đánh giá</span> · Phụ thuộc: {doc.dependsOn}. {lockReason(doc.dependsOn)}
          </p>
        </div>
      )}
      {doc.note && <p className="text-[12px] leading-[1.45] text-muted">{doc.note}</p>}
      {doc.reviewId && (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" to={`/reviews/${doc.reviewId}/versions`}>Lịch sử phiên bản</Button>
          <Button variant={reviewable ? "primary" : "secondary"} to={`/reviews/${doc.reviewId}`}>{reviewable ? "Đánh giá" : "Xem"}</Button>
        </div>
      )}
      {!doc.reviewId && doc.latestVersion && (
        <p className="text-[12px] text-muted">Không có yêu cầu đánh giá đang mở cho phiên bản này.</p>
      )}
    </Card>
  )
}
