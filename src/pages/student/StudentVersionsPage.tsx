import "@/styles/student-refinement.css"
import SampleDocumentPreview from "@/components/document/SampleDocumentPreview"
import Badge from "@/components/ui/Badge"
import StatusBadge from "@/components/ui/StatusBadge"
import { aiSummary } from "@/data/mockData"
import { useState } from "react"
import { useParams } from "react-router-dom"
import TimelineItem from "@/components/review/TimelineItem"
import Card from "@/components/ui/Card"
import BackLink from "@/components/ui/BackLink"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Modal from "@/components/ui/Modal"
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

  const list = versionsFor(request, versions).sort((a,b)=>Number(a.version.slice(1))-Number(b.version.slice(1)))
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
    <div className="student-refine phase-two flex min-w-0 flex-col gap-4">
      <BackLink label={doc.title} fallback={`/student/documents/${doc.id}`} />
      <PageHeading title="Lịch sử version" description={doc.title} />
      <p className="text-[14px] text-muted">Phiên bản mới nhất ở đầu · Bản đã nộp không thể sửa/xóa.</p>
      <section className="flex flex-col gap-3">
        <SectionHeader title="Các version" meta={`${list.length} version`} />
        <div className="rounded-xl border border-line bg-white px-4">{list.map((v,i)=>({v,i})).reverse().map(({v,i})=>(
          <article key={v.id} className="flex flex-col gap-3 border-b border-line py-4 last:border-b-0">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-semibold">{v.version}{v.isCurrent && <Badge tone="brand">Mới nhất</Badge>}</h2><StatusBadge status={v.supervisorStatus}/></div>
            <p className="break-all text-[14px]">{v.fileName}</p><p className="text-[14px] text-muted">{v.submittedAt}</p>
            <details><summary>Chi tiết bản nộp</summary><p>AI đề xuất · Chưa xác minh: {aiSummary(v.ai)}</p><p>{v.submitter} · {v.feedbackCount} feedback</p><StatusBadge status={v.documentStatus}/>{v.summary && <p>Ghi chú phiên bản: {v.summary}</p>}</details>
            <div className="flex flex-wrap gap-3"><Button variant={v.isCurrent ? "primary" : "secondary"} onClick={()=>setViewing(v)}>Xem tài liệu</Button>{i>0 && <Button variant="secondary" aria-pressed={cmp===i} className={cmp===i ? "border-brand" : ""} onClick={()=>setCompareIndex(i)}>So sánh bản trước</Button>}</div>
          </article>
        ))}</div>
      </section>
      {cmp !== null && cmp > 0 && list[cmp] && (
        <Card>
          <SectionHeader title={`Thông tin ${list[cmp - 1].version} → ${list[cmp].version}`} />
          <p className="break-all text-[14px]">Trước: {list[cmp - 1].fileName} · {list[cmp - 1].submittedAt}</p>
          <p className="break-all text-[14px]">Sau: {list[cmp].fileName} · {list[cmp].submittedAt}</p>
        </Card>
      )}
      <details><summary>Feedback &amp; lịch sử review</summary><section className="flex flex-col gap-3">
        <SectionHeader title="Lịch sử feedback" />
        {feedback.filter((f) => f.reviewId === request.id && f.official).map((f) => (
          <Card key={f.id}><p className="text-[14px] font-semibold">{f.version} · {f.author} · {f.createdAt}</p><p className="text-[14px]">{f.message}</p></Card>
        ))}
        <SectionHeader title="Lịch sử review" />
        <ol>{audit.filter((e) => e.reviewId === request.id && e.title !== "Giảng viên thêm feedback.").map((e) => <TimelineItem key={e.id} event={e} />)}</ol>
      </section></details>
      <Button variant="secondary" to={`/student/documents/${doc.id}`}>Quay lại tài liệu</Button>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={`${doc.title} · ${viewing?.version ?? ""}`}
        description={`Chỉ xem · ${viewing?.fileName ?? ""}`}
      >
        {viewing && <SampleDocumentPreview key={`${viewerReview.id}:${viewerReview.version}`} review={viewerReview} />}
      </Modal>
    </div>
  )
}
