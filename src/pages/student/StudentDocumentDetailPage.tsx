import { Eye, FileText, History, Upload } from "lucide-react"
import { useState } from "react"
import { useParams } from "react-router-dom"
import DocumentViewer from "@/components/document/DocumentViewer"
import AIFindingCard from "@/components/review/AIFindingCard"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import MetaGrid from "@/components/ui/MetaGrid"
import Modal from "@/components/ui/Modal"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import { useReviewStore } from "@/data/reviewStore"
import { findingsFor, versionsFor } from "@/data/selectors"
import { fmtDate } from "@/lib/time"
import { severityTone } from "@/components/review/severity"
import type { ReviewRequest } from "@/types"
import { useStudentContext } from "./useStudentContext"

export default function StudentDocumentDetailPage() {
  const { documentId } = useParams()
  const ctx = useStudentContext()
  const { versions, feedback, audit } = useReviewStore()
  const [viewing, setViewing] = useState(false)

  const doc = ctx.docById(documentId)
  if (!doc) return <EmptyState title="Không tìm thấy tài liệu" description={`Tài liệu “${documentId}” không thuộc project của bạn.`} />

  const request = ctx.requestFor(doc.reviewId)
  const status = doc.supervisorStatus
  const neverSubmitted = !doc.latestVersion && !doc.submissionLocked
  const needsRev = status === "needsRevision"
  const awaiting = status === "waiting" || status === "inReview"
  const approved = status === "approved"
  const rejected = status === "notAccepted"
  const locked = Boolean(doc.submissionLocked)
  const dl = ctx.deadlineFor(doc.id)
  const versionsList = request ? versionsFor(request, versions) : []
  const currentFeedback = request ? feedback.filter((f) => f.reviewId === request.id && f.version === request.version && f.official) : []
  const decision = request ? audit.filter((e) => e.reviewId === request.id && e.title.includes(`${request.documentTitle} ${request.version}`) && ["brand", "rust", "danger"].includes(e.tone)).at(-1) : undefined
  const findings = request ? findingsFor(request) : []

  const viewerReview: ReviewRequest | null = request ?? null

  const openViewer = () => {
    if (viewerReview) setViewing(true)
  }

  return (
    <>
      <BackLink label="Tài liệu" fallback="/student/documents" />
      <PageHeading
        eyebrow={doc.labCode ? `${doc.labCode?.toUpperCase()} · ${doc.itemCode}` : "TÀI LIỆU"}
        title={doc.title}
        description={`Project ${ctx.project?.name ?? ""}`}
      />
      {status && <StatusBadge status={status} />}
      {decision?.quote && <Notice>{decision.quote}</Notice>}
      {needsRev && !decision?.quote && request?.note && <Notice>{request.note}</Notice>}
      {request && <Notice>Nội dung xem trước và AI là mô phỏng; file chỉ lưu metadata trên trình duyệt.</Notice>}

      <Card>
        <MetaGrid
          items={[
            { label: "Lab", value: doc.labTitle ?? "—" },
            { label: "Mục Lab", value: `${doc.itemCode ?? ""} · ${doc.title}` },
            { label: "Version mới nhất", value: doc.latestVersion ?? "Chưa nộp" },
            { label: "Người nộp", value: doc.submitter ?? "—" },
            { label: "Cập nhật", value: doc.updatedAt ?? "—" },
            { label: "Deadline", value: dl.ts ? fmtDate(dl.ts) : "—" },
          ]}
        />
        {request && (
          <div className="flex items-center gap-2 rounded-[8px] bg-subtle p-2.5 text-[14px]">
            <FileText size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate">{request.fileName}</span>
            <Badge>{request.fileType === "PDF" ? "PDF" : "Word"}</Badge>
            <Badge>{request.version}</Badge>
          </div>
        )}
      </Card>

      {/* ACTION */}
      <section className="flex flex-col gap-3">
        {locked && (
          <div className="flex gap-2.5 rounded-[8px] bg-rust-soft p-3 text-[14px] leading-[1.45] text-rust">
            Bạn cần hoàn thành tài liệu trước đó để tiếp tục:
            {doc.dependsOn ? ` ${doc.dependsOn}.` : " Tài liệu phụ thuộc chưa được phê duyệt."}
          </div>
        )}
        {!locked && neverSubmitted && (
          <Button to={`/student/documents/${doc.id}/upload`} icon={<Upload size={18} strokeWidth={1.75} />}>
            Nộp tài liệu
          </Button>
        )}
        {!locked && needsRev && (
          <>
            <div className="flex gap-2.5 rounded-[8px] bg-amber-soft p-3 text-[14px] leading-[1.45] text-amber">
              Giảng viên đã yêu cầu chỉnh sửa {request?.version ?? doc.latestVersion}. Hãy đọc feedback bên dưới rồi nộp version mới.
            </div>
            <Button to={`/student/documents/${doc.id}/upload`} icon={<Upload size={18} strokeWidth={1.75} />}>
              Nộp version mới
            </Button>
          </>
        )}
        {!locked && awaiting && request && (
          <Button variant="secondary" onClick={openViewer} icon={<Eye size={18} strokeWidth={1.75} />}>
            Xem bài nộp đã gửi
          </Button>
        )}
        {!locked && approved && request && (
          <Button variant="secondary" onClick={openViewer} icon={<Eye size={18} strokeWidth={1.75} />}>
            Xem version đã duyệt
          </Button>
        )}
        {!locked && rejected && request && (
          <>
            <div className="flex gap-2.5 rounded-[8px] bg-rust-soft p-3 text-[14px] leading-[1.45] text-rust">
              Tài liệu bị đánh dấu không đạt. {request.note ? `${request.note}.` : "Hãy liên hệ giảng viên để biết lý do."}{" "}
              Không thể nộp lại tự động trong quy trình này.
            </div>
            <Button variant="secondary" onClick={openViewer} icon={<Eye size={18} strokeWidth={1.75} />}>
              Xem lý do
            </Button>
          </>
        )}
        {request && (
          <Button variant="secondary" to={`/student/documents/${doc.id}/versions`} icon={<History size={18} strokeWidth={1.75} />}>
            Lịch sử version ({versionsList.length})
          </Button>
        )}
      </section>

      {/* SUPERVISOR FEEDBACK */}
      {currentFeedback.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Feedback của giảng viên" meta={`${currentFeedback.length} feedback · ${request?.version}`} />
          <Card className="gap-0 py-1">
            <ul className="divide-y divide-line">
              {currentFeedback.map((f) => (
                <li key={f.id} className="flex flex-col gap-1.5 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={severityTone[f.severity]}>{f.severity}</Badge>
                    <Badge>{f.category}</Badge>
                    {f.pageRef && <Badge tone="brand">{f.pageRef}</Badge>}
                  </div>
                  <p className="text-[14px] leading-[1.45] text-ink">“{f.message}”</p>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* AI FINDINGS */}
      {findings.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Kết quả AI Review" meta={`${findings.length} phát hiện`} />
          {findings.map((f) => <AIFindingCard key={f.id} finding={f} />)}
        </section>
      )}

      {/* VERSIONS PREVIEW */}
      {versionsList.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Phiên bản đã nộp" meta={`${versionsList.length} version`} />
          <Card className="gap-0 py-1">
            <ul>
              {versionsList.map((v) => (
                <li key={v.id} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
                  <div className="min-w-0 flex-1 leading-[1.45]">
                    <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-ink">
                      {v.version}
                      {v.isCurrent && <Badge tone="brand">Version mới nhất</Badge>}
                    </p>
                    <p className="truncate text-[14px] text-muted">{v.fileName}</p>
                  </div>
                  <StatusBadge status={v.supervisorStatus} />
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {viewerReview && (
        <Modal open={viewing} onClose={() => setViewing(false)} title={`${doc.title} · ${viewerReview.version}`} description={`Chỉ xem · ${viewerReview.fileName}`}>
          <DocumentViewer review={viewerReview} className="h-[60dvh]" />
        </Modal>
      )}
    </>
  )
}
