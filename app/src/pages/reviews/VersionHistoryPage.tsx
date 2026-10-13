import { History } from "lucide-react"
import { useState } from "react"
import DocumentViewer from "@/components/document/DocumentViewer"
import ReviewContextCard from "@/components/review/ReviewContextCard"
import VersionCard from "@/components/review/VersionCard"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import Modal from "@/components/ui/Modal"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import { versionChanges } from "@/data/mockData"
import { versionsFor } from "@/data/selectors"
import type { DocumentVersion } from "@/types"
import useReviewFromParams from "./useReviewFromParams"

export default function VersionHistoryPage() {
  const { review } = useReviewFromParams()
  const [viewing, setViewing] = useState<DocumentVersion | null>(null)
  const [compareIndex, setCompareIndex] = useState<number | null>(null)
  if (!review) return <EmptyState title="Không tìm thấy yêu cầu review" />
  const versions = versionsFor(review)
  const cmp = compareIndex ?? (versions.length > 1 ? versions.length - 1 : null)

  return (
    <>
      <BackLink label="Không gian review" fallback={`/reviews/${review.id}`} />
      <PageHeading title="Lịch sử version" description={`Tài liệu: ${review.documentTitle}`} />
      <ReviewContextCard review={review} />
      <Notice>Mỗi version đã nộp là bất biến. Giảng viên có thể xem và so sánh; không thể sửa, thay thế hoặc xóa version.</Notice>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Các version" meta={`${versions.length} version`} />
        {versions.map((v, i) => (
          <VersionCard key={v.id} version={v} selected={cmp === i} onView={() => setViewing(v)} onCompare={i > 0 ? () => setCompareIndex(i) : undefined} />
        ))}
      </section>

      {cmp !== null && cmp > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="So sánh version" />
          <Card>
            <div className="flex flex-wrap gap-2">
              <Badge>Trước: {versions[cmp - 1].version}</Badge>
              <Badge tone="brand">Sau: {versions[cmp].version}</Badge>
            </div>
            {versionChanges.map((c) => (
              <div key={c.title} className="flex flex-col gap-2 border-t border-line pt-3">
                <p className="text-[13px] font-semibold text-ink">{c.title}</p>
                {c.before && (
                  <div className="rounded-[8px] bg-danger-soft p-2.5 text-[12px] leading-[1.45]">
                    <p className="text-[10px] font-semibold text-danger">TRƯỚC · {versions[cmp - 1].version}</p>
                    <p className="text-ink">{c.before}</p>
                  </div>
                )}
                <div className="rounded-[8px] bg-brand-soft p-2.5 text-[12px] leading-[1.45]">
                  <p className="text-[10px] font-semibold text-brand">SAU · {versions[cmp].version}</p>
                  <p className="text-ink">{c.after}</p>
                </div>
              </div>
            ))}
          </Card>
        </section>
      )}
      <Button variant="secondary" to={`/reviews/${review.id}/history`} icon={<History size={18} strokeWidth={1.75} />}>Xem lịch sử review</Button>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={`${review.documentTitle} · ${viewing?.version ?? ""}`} description={`Chỉ xem · ${viewing?.fileName ?? ""}`}>
        {viewing && <DocumentViewer review={{ ...review, version: viewing.version, fileName: viewing.fileName, submittedAt: viewing.submittedAt }} className="h-[60dvh]" />}
      </Modal>
    </>
  )
}
