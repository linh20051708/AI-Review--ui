import SampleDocumentPreview from "@/components/document/SampleDocumentPreview"
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

import { useReviewStore } from "@/data/reviewStore"
import { versionsFor } from "@/data/selectors"
import type { DocumentVersion } from "@/types"
import useReviewFromParams from "./useReviewFromParams"

export default function VersionHistoryPage() {
  const { review } = useReviewFromParams()
  const { versions } = useReviewStore()
  const [viewing, setViewing] = useState<DocumentVersion | null>(null)
  const [compareIndex, setCompareIndex] = useState<number | null>(null)
  if (!review) return <EmptyState title="Không tìm thấy yêu cầu đánh giá" />
  const versionsList = versionsFor(review, versions)
  const cmp = compareIndex ?? (versionsList.length > 1 ? versionsList.length - 1 : null)

  return (
    <>
      <BackLink label="Không gian đánh giá" fallback={`/reviews/${review.id}`} />
      <PageHeading title="Lịch sử phiên bản" description={`Tài liệu: ${review.documentTitle}`} />
      <ReviewContextCard review={review} />
      <Notice>Mỗi phiên bản đã nộp là bất biến. Giảng viên có thể xem và so sánh; không thể sửa, thay thế hoặc xóa phiên bản.</Notice>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Các phiên bản" meta={`${versionsList.length} phiên bản`} />
        {versionsList.map((v, i) => ({v, i})).reverse().map(({v, i}) => (
          <VersionCard key={v.id} version={v} selected={cmp === i} onView={() => setViewing(v)} onCompare={i > 0 ? () => setCompareIndex(i) : undefined} />
        ))}
      </section>

      {cmp !== null && cmp > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="So sánh thông tin phiên bản" />
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[versionsList[cmp - 1], versionsList[cmp]].map(version => <div key={version.id} className="flex min-w-0 flex-col gap-2 text-[14px]">
                <strong>{version.version}</strong><p className="break-all">{version.fileName}</p><p className="text-muted">{version.submittedAt}</p><p>{version.submitter}</p>
              </div>)}
            </div>
          </Card>
        </section>
      )}
      <Button variant="secondary" to={`/reviews/${review.id}/history`} icon={<History size={18} strokeWidth={1.75} />}>Xem lịch sử đánh giá</Button>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={`${review.documentTitle} · ${viewing?.version ?? ""}`} description={`Chỉ xem · ${viewing?.fileName ?? ""}`}>
        {viewing && <DocumentViewer review={{ ...review, version: viewing.version, fileName: viewing.fileName, fileType: viewing.fileType ?? (viewing.fileName.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF"), fileSize: viewing.fileSize, pageCount: viewing.pageCount ?? review.pageCount, submittedAt: viewing.submittedAt, submitter: viewing.submitter }}  />}
        {viewing && <SampleDocumentPreview key={`${review.id}:${viewing.id}`} review={{ ...review, version: viewing.version, fileName: viewing.fileName, fileType: viewing.fileType ?? (viewing.fileName.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF"), fileSize: viewing.fileSize, pageCount: viewing.pageCount ?? review.pageCount, submittedAt: viewing.submittedAt, submitter: viewing.submitter }}  />}
      </Modal>
    </>
  )
}
