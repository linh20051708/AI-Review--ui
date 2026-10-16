import { useState } from "react"
import { useParams } from "react-router-dom"
import DocumentViewer from "@/components/document/DocumentViewer"
import VersionCard from "@/components/review/VersionCard"
import TimelineItem from "@/components/review/TimelineItem"
import Card from "@/components/ui/Card"
import BackLink from "@/components/ui/BackLink"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Modal from "@/components/ui/Modal"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import { useReviewStore } from "@/data/reviewStore"
import { versionsFor } from "@/data/selectors"
import type { DocumentVersion, ReviewRequest } from "@/types"
import { useStudentContext } from "./useStudentContext"

export default function StudentVersionsPage() {
  const { documentId } = useParams()
  const ctx = useStudentContext()
  const { versions, audit, feedback } = useReviewStore()
  const [viewing, setViewing] = useState<DocumentVersion | null>(null)
  const [compareIndex, setCompareIndex] = useState<number | null>(null)

  const doc = ctx.docById(documentId)
  if (!doc) return <EmptyState title="Không tìm thấy tài liệu" />

  const request = ctx.requestFor(doc.reviewId)
  if (!request) return <EmptyState title="Chưa có phiên bản" description="Tài liệu này chưa có bản nộp nào." />

  const list = versionsFor(request, versions)
  const cmp = compareIndex ?? (list.length > 1 ? list.length - 1 : null)
  const viewerReview: ReviewRequest = {
    ...request,
    version: viewing?.version ?? request.version,
    fileName: viewing?.fileName ?? request.fileName,
    submittedAt: viewing?.submittedAt ?? request.submittedAt,
    fileType: viewing?.fileType ?? (viewing?.fileName.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF"),
    fileSize: viewing?.fileSize,
    submitter: viewing?.submitter ?? request.submitter,
    pageCount: viewing?.pageCount ?? request.pageCount,
  }

  return (
    <>
      <BackLink label={doc.title} fallback={`/student/documents/${doc.id}`} />
      <PageHeading title="Lịch sử version" description={`${doc.title} · ${request.projectName}`} />
      <Notice>Mỗi version đã nộp là bất biến. Bạn không thể sửa, thay thế hoặc xóa version.</Notice>
      <section className="flex flex-col gap-3">
        <SectionHeader title="Các version" meta={`${list.length} version`} />
        {list.map((v, i) => (
          <VersionCard
            key={v.id}
            version={v}
            selected={cmp === i}
            onView={() => setViewing(v)}
            onCompare={i > 0 ? () => setCompareIndex(i) : undefined}
          />
        ))}
      </section>
      {cmp !== null && cmp > 0 && list[cmp] && (
        <Card>
          <SectionHeader title={`So sánh ${list[cmp - 1].version} → ${list[cmp].version}`} />
          <p className="break-all text-[14px]">Trước: {list[cmp - 1].fileName} · {list[cmp - 1].submittedAt}</p>
          <p className="break-all text-[14px]">Sau: {list[cmp].fileName} · {list[cmp].submittedAt}</p>
          <Notice>Prototype chỉ so sánh metadata, không phân tích khác biệt nội dung file.</Notice>
        </Card>
      )}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Lịch sử feedback" />
        {feedback.filter((f) => f.reviewId === request.id && f.official).map((f) => (
          <Card key={f.id}><p className="text-[14px] font-semibold">{f.version} · {f.author} · {f.createdAt}</p><p className="text-[14px]">{f.message}</p></Card>
        ))}
        <SectionHeader title="Lịch sử review" />
        <ol>{audit.filter((e) => e.reviewId === request.id && e.title !== "Giảng viên thêm feedback.").map((e) => <TimelineItem key={e.id} event={e} />)}</ol>
      </section>
      <Button variant="secondary" to={`/student/documents/${doc.id}`}>Quay lại tài liệu</Button>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={`${doc.title} · ${viewing?.version ?? ""}`}
        description={`Chỉ xem · ${viewing?.fileName ?? ""}`}
      >
        {viewing && <DocumentViewer review={viewerReview} className="h-[60dvh]" />}
      </Modal>
    </>
  )
}
