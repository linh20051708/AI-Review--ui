import SampleDocumentPreview from "@/components/document/SampleDocumentPreview"
import Modal from "@/components/ui/Modal"

import "@/styles/review-refinement.css"

import { Check, ClipboardCheck, Play, XCircle } from "lucide-react"

import { useRef, useState } from "react"

import { Link } from "react-router-dom"




import AIReviewSection from "@/components/review/AIReviewSection"

import DecisionModals, {
  type Decision,
} from "@/components/review/DecisionModals"

import FeedbackComposer, {
  type FeedbackDraft,
} from "@/components/review/FeedbackComposer"

import FeedbackItem from "@/components/review/FeedbackItem"

import StatusTracks from "@/components/review/StatusTracks"
import ReviewAIStatus from "@/components/review/ReviewAIStatus"

import TimelineItem from "@/components/review/TimelineItem"

import BackLink from "@/components/ui/BackLink"

import Badge from "@/components/ui/Badge"

import Button from "@/components/ui/Button"

import EmptyState from "@/components/ui/EmptyState"

import MoreMenu from "@/components/ui/MoreMenu"

import Notice from "@/components/ui/Notice"

import StatusBadge from "@/components/ui/StatusBadge"

import { toast } from "@/components/ui/Toast"

import {
  reviewActions,
  supervisorBlock,
  useReviewStore,
} from "@/data/reviewStore"

import { resolveReviewRule } from "@/lib/rubric"

import { isCompleted } from "@/data/selectors"

import type { AIFinding, ReviewRequest } from "@/types"

import { useManagement } from "@/data/managementStore"

import {
  resolveDocumentLabContext,
  resolveProjectAcademicContext,
} from "@/lib/config"

import { courseLabel } from "@/lib/academic"

import { fmtRelative } from "@/lib/time"

import useReviewFromParams from "./useReviewFromParams"

type Panel = "document" | "ai" | "feedback" | "history"

export default function ReviewWorkspacePage() {
  const { review } = useReviewFromParams()

  const store = useReviewStore()

  const mgmt = useManagement()

  const { projects } = mgmt

  const [panel, setPanel] = useState<Panel>("document")

  const [contextOpen, setContextOpen] = useState(false)

  const [decision, setDecision] = useState<Decision | null>(null)

  const [added, setAdded] = useState<string[]>([])

  const viewerRef = useRef<HTMLDivElement>(null)

  const panelRef = useRef<HTMLDivElement>(null)

  if (!review) return <EmptyState title="Không tìm thấy yêu cầu review" />

  const status = review.supervisorStatus

  const completed = isCompleted(status)

  const evaluation = store.evaluations

    .filter(
      (e) => e.reviewId === review.id && e.documentVersion === review.version,
    )

    .at(-1)

  const aiStatus =
    evaluation?.evaluationStatus === "loading"
      ? "aiReviewing"
      : evaluation?.evaluationStatus === "completed"
        ? "aiReviewed"
        : "notRun"

  const feedback = store.feedback.filter((f) => f.reviewId === review.id)

  const current = feedback.filter((f) => f.version === review.version)

  const previous = feedback.filter((f) => f.version !== review.version)

  const audit = store.audit.filter((e) => e.reviewId === review.id)

  const ensureStarted = () =>
    status === "waiting" && reviewActions.startReview(review.id)

  const addFeedback = (d: FeedbackDraft) => {
    const block = supervisorBlock(review)

    if (block) {
      toast(block)

      return
    }

    ensureStarted()

    reviewActions.addFeedback({
      reviewId: review.id,

      version: review.version,

      severity: d.severity,

      category: d.category,

      pageRef: d.pageRef || undefined,

      message: d.message,
    })

    toast("Đã thêm feedback")
  }

  const addFinding = (f: AIFinding) => {
    const block = supervisorBlock(review)

    if (block) {
      toast(block)

      return
    }

    ensureStarted()

    reviewActions.addFeedback({
      reviewId: review.id,

      version: review.version,

      severity: f.level === "error" ? "Major" : "Minor",

      category: f.category,

      pageRef: f.pageRef,

      message: f.message,
    })

    setAdded((a) => [...a, f.id])

    toast("Đã thêm vào feedback · có thể sửa trước khi ra quyết định")
  }

  const openPanel = (p: Panel) => {
    setPanel(p)

    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Project → Group → Class → Course Offering → Lab Structure

  const project = projects.find((x) => x.id === review.projectId)

  const ctx = project ? resolveProjectAcademicContext(project, mgmt) : undefined

  const labCtx = ctx
    ? resolveDocumentLabContext(review.documentTitle, ctx)
    : undefined

  const contextRows = [
    { label: "Học kỳ", value: ctx?.semester?.name ?? "—" },

    { label: "Môn học", value: courseLabel(ctx?.course) },

    { label: "Lớp", value: ctx?.cls?.code ?? "—" },

    { label: "Nhóm", value: ctx?.group?.name ?? "—" },

    { label: "Project", value: project?.name ?? "—" },

    {
      label: "Lab",

      value: labCtx
        ? `${labCtx.lab.code} · ${labCtx.lab.title}`
        : "Không thuộc Lab nào",
    },

    {
      label: "Mục Lab",

      value: labCtx ? `${labCtx.item.code} · ${labCtx.item.title}` : "—",
    },

    { label: "Tài liệu", value: review.documentTitle },

    { label: "Tên file", value: review.fileName },

    {
      label: "Loại file",

      value: review.fileType === "PDF" ? "PDF" : "Word (DOCX)",
    },

    { label: "Version", value: review.version },

    { label: "Người nộp", value: review.submitter },

    { label: "Ngày nộp", value: review.submittedAt },

    {
      label: "Yêu cầu review",

      value: `${review.requestedAt} · ${fmtRelative(review.requestedTs)}`,
    },

    { label: "Phương pháp dạy", value: ctx?.teachingMethod.value ?? "—" },

    {
      label: "Bộ quy tắc",

      value: resolveReviewRule(review, mgmt)?.name ?? "Chưa gán",
    },
  ]

  const tabs: {
    id: Panel
    label: string
  }[] = [
    { id: "document", label: "Tài liệu" },
    { id: "ai", label: "AI" },
    { id: "feedback", label: `Góp ý (${current.length})` },
    { id: "history", label: "Lịch sử" },
  ]

  return (
    <div className="phase-one mx-auto flex w-full min-w-0 max-w-[960px] flex-col gap-4 text-[14px]">
      <BackLink label="Yêu cầu review" fallback="/reviews" />
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[26px] font-semibold leading-tight">
            {review.documentTitle}
          </h1>
          <Badge>{review.version}</Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-muted">
            {ctx?.cls?.code ?? review.classCode} ·{" "}
            {ctx?.group?.name ?? review.groupName}
          </p>
          <button
            type="button"
            onClick={() => setContextOpen(true)}
            className="min-h-12 px-2 font-semibold text-brand"
          >
            Thông tin
          </button>
        </div>
        <div>
          <StatusBadge status={status} />
        </div>
      </header>

      <div ref={panelRef} className="scroll-mt-3">
        <div
          role="tablist"
          aria-label="Tác vụ review"
          className="grid grid-cols-4 gap-1 rounded-lg bg-subtle p-1"
        >
          {tabs.map((t, index) => (
            <button
              key={t.id}
              id={`review-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={panel === t.id}
              aria-controls={`review-panel-${t.id}`}
              tabIndex={panel === t.id ? 0 : -1}
              onClick={() => openPanel(t.id)}
              onKeyDown={(event) => {
                let next = index
                if (event.key === "ArrowRight") next = (index + 1) % tabs.length
                else if (event.key === "ArrowLeft")
                  next = (index + tabs.length - 1) % tabs.length
                else if (event.key === "Home") next = 0
                else if (event.key === "End") next = tabs.length - 1
                else return
                event.preventDefault()
                setPanel(tabs[next].id)
                document.getElementById(`review-tab-${tabs[next].id}`)?.focus()
              }}
              className={`min-h-12 min-w-12 rounded-md border-b-2 px-1 py-2 text-[14px] ${
                panel === t.id
                  ? "border-brand bg-white font-semibold text-brand shadow-sm"
                  : "border-transparent text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section
        id="review-panel-document"
        role="tabpanel"
        aria-labelledby="review-tab-document"
        hidden={panel !== "document"}
        className="flex min-w-0 flex-col gap-4"
      >
        <div ref={viewerRef}>
          <SampleDocumentPreview key={`${review.id}:${review.documentId ?? ""}:${review.version}`} review={review} />
        </div>
        <p className="text-muted">
          Chỉ xem · Sinh viên nộp phiên bản mới để sửa.
        </p>
      </section>

      <section
        id="review-panel-ai"
        role="tabpanel"
        aria-labelledby="review-tab-ai"
        hidden={panel !== "ai"}
        className="min-w-0"
      >
        <AIReviewSection
          key={review.id + review.version}
          review={review}
          added={added}
          onAddFinding={completed ? undefined : addFinding}
          onViewDocument={() => openPanel("document")}
        />
      </section>

      <section
        id="review-panel-feedback"
        role="tabpanel"
        aria-labelledby="review-tab-feedback"
        hidden={panel !== "feedback"}
        className="flex min-w-0 flex-col gap-4"
      >
        <h2 className="text-[16px] font-semibold">
          Feedback · {review.version}
        </h2>
        {current.length ? (
          current.map((f) => <FeedbackItem key={f.id} feedback={f} />)
        ) : (
          <EmptyState title="Chưa có feedback" />
        )}
        {completed ? (
          <Notice>
            Review đã hoàn tất. Feedback được chọn đã khóa; feedback bỏ chọn vẫn
            là nháp riêng.
          </Notice>
        ) : (
          <FeedbackComposer onSubmit={addFeedback} compact />
        )}
        {previous.length > 0 && (
          <details className="refinement-details">
            <summary>Phiên bản trước ({previous.length} feedback)</summary>
            <div className="flex flex-col gap-3 py-3">
              {previous.map((f) => (
                <FeedbackItem key={f.id} feedback={f} />
              ))}
            </div>
          </details>
        )}
      </section>

      <section
        id="review-panel-history"
        role="tabpanel"
        aria-labelledby="review-tab-history"
        hidden={panel !== "history"}
        className="flex min-w-0 flex-col gap-4"
      >
        <h2 className="text-[16px] font-semibold">Lịch sử review</h2>
        {audit.length ? (
          <ol>
            {audit.map((e, i) => (
              <TimelineItem
                key={e.id}
                event={e}
                last={i === audit.length - 1}
              />
            ))}
          </ol>
        ) : (
          <EmptyState title="Chưa có hoạt động review" />
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="secondary" to={`/reviews/${review.id}/versions`}>
            Lịch sử phiên bản
          </Button>
          <Button variant="secondary" to={`/reviews/${review.id}/history`}>
            Lịch sử quyết định
          </Button>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 -mx-5 mt-auto border-t border-line bg-white px-5 py-3">
        <DecisionBar review={review} onDecide={setDecision} mobile />
      </div>

      <Modal
        open={contextOpen}
        title="Thông tin bản nộp"
        onClose={() => setContextOpen(false)}
      >
        <StatusTracks
          documentStatus={review.documentStatus}
          aiContent={<ReviewAIStatus review={review} />}
          supervisorStatus={status}
          compact
        />
        <dl className="flex flex-col gap-3">
          {contextRows.map((row) => (
            <div key={row.label} className="border-b border-line pb-2">
              <dt className="text-muted">{row.label}</dt>
              <dd className="font-semibold">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Modal>
      <DecisionModals
        review={review}
        open={decision}
        currentFeedback={current}
        onClose={() => setDecision(null)}
      />
    </div>
  )
}

function DecisionBar({
  review,

  onDecide,

  mobile,
}: {
  review: ReviewRequest

  onDecide: (d: Decision) => void

  mobile?: boolean
}) {
  const status = review.supervisorStatus

  const blocked = supervisorBlock(review)

  if (!isCompleted(status) && blocked) return <Notice>{blocked}</Notice>

  if (status === "waiting")
    return (
      <div className="flex flex-col gap-2">
        <Button
          icon={<Play size={16} strokeWidth={1.75} />}
          onClick={() => reviewActions.startReview(review.id)}
        >
          Bắt đầu review
        </Button>
        {!mobile && (
          <p className="text-center text-[11px] text-muted">
            Bắt đầu review để ghi nhận quyết định cho {review.documentTitle}{" "}
            {review.version}.
          </p>
        )}
      </div>
    )

  if (isCompleted(status))
    return (
      <div className="flex items-center gap-3">
        <ClipboardCheck
          size={20}
          strokeWidth={1.75}
          className="shrink-0 text-brand"
        />
        <div className="min-w-0 flex-1 leading-[1.45]">
          <p className="text-[12px] text-muted">Quyết định đã ghi nhận</p>
          <StatusBadge status={status} />
        </div>
        <Link
          to={`/reviews/${review.id}/history`}
          className="shrink-0 text-[12px] font-semibold text-brand"
        >
          Lịch sử review
        </Link>
      </div>
    )

  if (mobile)
    return (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => onDecide("revise")}
          className="flex-1 px-2"
        >
          Yêu cầu sửa
        </Button>
        <Button
          onClick={() => onDecide("approve")}
          className="flex-1 px-2"
        >
          Phê duyệt
        </Button>
        <MoreMenu
          up
          label="Quyết định khác"
          items={[
            {
              label: "Không đạt",

              danger: true,

              icon: <XCircle size={16} strokeWidth={1.75} />,

              onSelect: () => onDecide("reject"),
            },
          ]}
        />
      </div>
    )

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => onDecide("approve")}
        icon={<Check size={16} strokeWidth={2} />}
      >
        Phê duyệt
      </Button>
      <Button variant="secondary" onClick={() => onDecide("revise")}>
        Yêu cầu chỉnh sửa
      </Button>
      <button
        type="button"
        onClick={() => onDecide("reject")}
        className="py-1.5 text-[12px] font-semibold text-danger"
      >
        Không đạt · chỉ cho bài nộp không hợp lệ
      </button>
    </div>
  )
}
