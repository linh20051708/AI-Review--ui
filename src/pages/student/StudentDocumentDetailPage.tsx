import { currentIllustration } from "@/lib/rubric"
import uiLabel from "@/lib/uiLabels"
import "@/styles/student-refinement.css"
import PhaseTwoTabs from "@/components/ui/PhaseTwoTabs"
import SampleDocumentPreview from "@/components/document/SampleDocumentPreview"
import { contentText } from "@/components/ui/contentText"
import { Eye, FileText, History, Upload } from "lucide-react"
import { useState } from "react"
import { useParams } from "react-router-dom"
import AIFindingCard from "@/components/review/AIFindingCard"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import MetaGrid from "@/components/ui/MetaGrid"
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
  const { versions, feedback, audit, evaluations } = useReviewStore()
  const [tab, setTab] = useState("Phản hồi")

  const doc = ctx.docById(documentId)
  if (!doc) return <EmptyState title="Không tìm thấy tài liệu" description={`Tài liệu “${documentId}” không thuộc dự án của bạn.`} />

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
  const savedEvaluation = request ? evaluations.filter(e=>e.reviewId===request.id && e.documentVersion===request.version).at(-1) : undefined
  const evaluation = savedEvaluation && request ? currentIllustration(savedEvaluation, request.documentTitle) : undefined
  const findings = evaluation ? evaluation.findings : request ? findingsFor(request) : []

  const viewerReview: ReviewRequest | null = request ?? null

  const openViewer = () => {
    if (viewerReview) setTab("Tài liệu")
  }

  return (
    <div className="student-refine phase-two flex min-w-0 flex-col gap-4">
      <BackLink label="Tài liệu" fallback="/student/documents" />
      <PageHeading
        eyebrow={doc.labCode ? `${doc.labCode?.toUpperCase()} · ${doc.itemCode}` : "TÀI LIỆU"}
        title={doc.title}

      />
      {status && <StatusBadge status={status} />}
      {decision?.quote && <Notice>{decision.quote}</Notice>}
      {needsRev && !decision?.quote && request?.note && <Notice>{request.note}</Notice>}

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
              Giảng viên đã yêu cầu chỉnh sửa {request?.version ?? doc.latestVersion}. Hãy đọc phản hồi bên dưới rồi nộp phiên bản mới.
            </div>
            <Button to={`/student/documents/${doc.id}/upload`} icon={<Upload size={18} strokeWidth={1.75} />}>
              Nộp phiên bản mới
            </Button>
          </>
        )}
        {!locked && awaiting && request && (
          <Button onClick={openViewer} icon={<Eye size={18} strokeWidth={1.75} />}>
            Xem tài liệu
          </Button>
        )}
        {!locked && approved && request && (
          <Button variant="secondary" onClick={openViewer} icon={<Eye size={18} strokeWidth={1.75} />}>
            Xem tài liệu
          </Button>
        )}
        {!locked && rejected && request && (
          <>
            <div className="flex gap-2.5 rounded-[8px] bg-rust-soft p-3 text-[14px] leading-[1.45] text-rust">
              Tài liệu bị đánh dấu không đạt. {request.note ? `${request.note}.` : "Hãy liên hệ giảng viên để biết lý do."}{" "}
              Không thể nộp lại tự động trong quy trình này.
            </div>
            <Button variant="secondary" onClick={openViewer} icon={<Eye size={18} strokeWidth={1.75} />}>
              Xem tài liệu
            </Button>
          </>
        )}
        {request && (
          <Button variant="secondary" className="justify-start border-0 bg-transparent px-0 text-brand" to={`/student/documents/${doc.id}/versions`} icon={<History size={18} strokeWidth={1.75} />}>
            Lịch sử phiên bản ({versionsList.length})
          </Button>
        )}
      </section>

      <p className="text-[14px] text-muted">{doc.latestVersion ?? "Chưa nộp"}{dl.ts ? ` · Hạn nộp ${fmtDate(dl.ts)}` : ""}</p>
      <PhaseTwoTabs id="student-result" tabs={["Phản hồi","AI đề xuất","Tài liệu"]} active={tab} onChange={setTab}/>
      <section role="tabpanel" id="student-result-panel-0" aria-labelledby="student-result-0" hidden={tab!=="Phản hồi"} className="flex flex-col gap-3">
      {!currentFeedback.length && <EmptyState title="Chưa có phản hồi của giảng viên"/>}
      {/* SUPERVISOR FEEDBACK */}
      {currentFeedback.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Phản hồi của giảng viên" meta={`${currentFeedback.length} phản hồi · ${request?.version}`} />
          <Card className="gap-0 py-1">
            <ul className="divide-y divide-line">
              {currentFeedback.map((f) => (
                <li key={f.id} className="flex flex-col gap-1.5 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={severityTone[f.severity]}>{uiLabel(f.severity)}</Badge>
                    <Badge>{uiLabel(f.category)}</Badge>
                    {f.pageRef && <Badge tone="brand">{f.pageRef}</Badge>}
                  </div>
                  <p className="text-[14px] leading-[1.45] text-ink">“{f.message}”</p>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      </section>
      <section role="tabpanel" id="student-result-panel-1" aria-labelledby="student-result-1" hidden={tab!=="AI đề xuất"} className="flex flex-col gap-3">
      {evaluation?.evaluationStatus==="loading" && <p role="status">AI đang tạo đề xuất…</p>}
      {evaluation?.evaluationStatus==="error" && <p role="alert" className="text-danger">Không có kết quả AI khả dụng. Liên hệ giảng viên để kiểm tra.</p>}
      {evaluation?.evaluationStatus==="completed" && <>
        <p className="text-[20px] font-semibold">Điểm tham khảo: {evaluation.overallScore ?? "—"}/{evaluation.maxScore}</p><p className="text-muted">Kết quả minh họa · Quyết định do giảng viên ghi nhận.</p>
        <p>{evaluation.criterionResults.filter(c=>c.score===c.maxScore).length} đạt · {evaluation.criterionResults.filter(c=>c.score!==null && c.score<c.maxScore).length} cần cải thiện · {evaluation.criterionResults.filter(c=>c.score===null).length} chưa chấm</p>
        <details><summary>Chi tiết tiêu chí ({evaluation.criterionResults.length})</summary>{evaluation.criterionResults.map(c=><details key={c.criterionId} className="border-b border-line pb-3"><summary>{c.criterionId} · {c.score ?? "—"}/{c.maxScore}</summary><p>{c.name}</p><p>{c.comment}</p><p>{c.issue}</p><p>{contentText(c.evidence)}</p><p>{c.suggestions.map((suggestion,index)=><span className="block" key={index}>{contentText(suggestion)}</span>)}</p></details>)}</details>
      </>}
      {!findings.length && !evaluation && <EmptyState title="Chưa có đề xuất AI"/>}
      {/* AI FINDINGS */}
      {findings.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title={evaluation ? "Vấn đề cần chú ý" : "Kết quả minh họa"} meta={`${findings.length} phát hiện`} />
          <div className="reading-list">{findings.slice(0,3).map((f) => <AIFindingCard key={f.id} finding={f} />)}</div>{findings.length > 3 && <details><summary>Xem thêm ({findings.length - 3})</summary><div className="reading-list">{findings.slice(3).map(f=><AIFindingCard key={f.id} finding={f}/>)}</div></details>}
        </section>
      )}

      </section>
      <section role="tabpanel" id="student-result-panel-2" aria-labelledby="student-result-2" hidden={tab!=="Tài liệu"} className="flex flex-col gap-3">
      {viewerReview ? <SampleDocumentPreview key={`${viewerReview.id}:${viewerReview.documentId}:${viewerReview.version}`} review={viewerReview}/> : <EmptyState title="Chưa có bản nộp"/>}
      <details><summary>Thông tin bản nộp</summary>      <Card>
        <MetaGrid
          items={[
            { label: "Lab", value: doc.labTitle ?? "—" },
            { label: "Mục Lab", value: `${doc.itemCode ?? ""} · ${doc.title}` },
            { label: "Phiên bản mới nhất", value: doc.latestVersion ?? "Chưa nộp" },
            { label: "Người nộp", value: doc.submitter ?? "—" },
            { label: "Cập nhật", value: doc.updatedAt ?? "—" },
            { label: "Hạn nộp", value: dl.ts ? fmtDate(dl.ts) : "—" },
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

</details>
      {/* VERSIONS PREVIEW */}
      {versionsList.length > 0 && (
        <section className="flex flex-col gap-3">
          <details><summary>Phiên bản đã nộp ({versionsList.length})</summary><SectionHeader title="Phiên bản đã nộp" meta={`${versionsList.length} phiên bản`} />
          <Card className="gap-0 py-1">
            <ul>
              {[...versionsList].sort((a,b)=>Number(b.version.slice(1))-Number(a.version.slice(1))).map((v) => (
                <li key={v.id} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
                  <div className="min-w-0 flex-1 leading-[1.45]">
                    <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-ink">
                      {v.version}
                      {v.isCurrent && <Badge tone="brand">Phiên bản mới nhất</Badge>}
                    </p>
                    <p className="truncate text-[14px] text-muted">{v.fileName}</p>
                  </div>
                  <StatusBadge status={v.supervisorStatus} />
                </li>
              ))}
            </ul>
          </Card></details>
        </section>
      )}
      </section>


    </div>
  )
}
