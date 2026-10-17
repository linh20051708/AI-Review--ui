import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Check,
  ClipboardCheck,
  FileClock,
  History,
  MessageSquareText,
  Play,
  Sparkles,
  XCircle,
} from "lucide-react"
import { useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import DocumentViewer from "@/components/document/DocumentViewer"
import OriginalDocumentPanel from "@/components/document/OriginalDocumentPanel"
import AIFindingCard from "@/components/review/AIFindingCard"
import AIReviewSection from "@/components/review/AIReviewSection"
import DecisionModals, {
  type Decision,
} from "@/components/review/DecisionModals"
import FeedbackComposer, {
  type FeedbackDraft,
} from "@/components/review/FeedbackComposer"
import FeedbackItem from "@/components/review/FeedbackItem"
import StatusTracks from "@/components/review/StatusTracks"
import TimelineItem from "@/components/review/TimelineItem"
import BackLink from "@/components/ui/BackLink"
import Badge, { toneClasses } from "@/components/ui/Badge"
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
import { findingsFor, isCompleted } from "@/data/selectors"
import type { AIFinding, ReviewRequest } from "@/types"
import { useManagement } from "@/data/managementStore"
import {
  resolveDocumentLabContext,
  resolveProjectAcademicContext,
} from "@/lib/config"
import { courseLabel } from "@/lib/academic"
import { fmtRelative } from "@/lib/time"
import useReviewFromParams from "./useReviewFromParams"

type Panel = "ai" | "feedback" | "history"

export default function ReviewWorkspacePage() {
  const { review } = useReviewFromParams()
  const store = useReviewStore()
  const mgmt = useManagement()
  const { projects } = mgmt
  const [panel, setPanel] = useState<Panel>("ai")
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
  const findings = findingsFor(review)

  const ensureStarted = () =>
    status === "waiting" && reviewActions.startReview(review.id)
  const addFeedback = (d: FeedbackDraft) => {
    const block = supervisorBlock(review)
    if (block) {
      toast(block, "error")
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
      toast(block, "error")
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
  const hierarchy = [
    ctx?.semester?.name,
    ctx?.course?.code,
    ctx?.cls?.code,
    ctx?.group?.name,
    project?.name,
    labCtx?.lab.code,
  ]
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

  const tabs: { id: Panel; label: string }[] = [
    { id: "ai", label: "AI Review" },
    { id: "feedback", label: `Feedback (${current.length})` },
    { id: "history", label: "Lịch sử" },
  ]

  return (
    <>
      <div className="flex flex-col gap-4 lg:grid lg:h-[calc(100dvh-84px)] lg:grid-cols-[264px_minmax(0,1fr)_384px] lg:gap-5 lg:pb-5">
        {/* LEFT — document context */}
        <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto lg:flex">
          <BackLink label="Yêu cầu review" fallback="/reviews" />
          <div className="flex flex-col gap-3 rounded-[12px] border border-line bg-white p-4">
            <p className="text-[10px] font-semibold tracking-wide text-brand">
              NGỮ CẢNH TÀI LIỆU
            </p>
            <dl className="flex flex-col gap-2.5 text-[12px] leading-[1.45]">
              {contextRows.map((r) => (
                <div key={r.label}>
                  <dt className="text-muted">{r.label}</dt>
                  <dd className="font-semibold text-ink">{r.value}</dd>
                </div>
              ))}
              <div>
                <dt className="mb-1 text-muted">Trạng thái hiện tại</dt>
                <dd>
                  <StatusBadge status={status} />
                </dd>
              </div>
            </dl>
          </div>
          <nav
            aria-label="Điều hướng review"
            className="flex flex-col gap-0.5 rounded-[12px] border border-line bg-white p-2"
          >
            <NavItem
              icon={<BookOpen size={16} strokeWidth={1.75} />}
              label="Nội dung tài liệu"
              onClick={() =>
                viewerRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            />
            <NavItem
              icon={<Sparkles size={16} strokeWidth={1.75} />}
              label="AI Review"
              active={panel === "ai"}
              onClick={() => setPanel("ai")}
            />
            <NavItem
              icon={<MessageSquareText size={16} strokeWidth={1.75} />}
              label="Feedback"
              active={panel === "feedback"}
              onClick={() => setPanel("feedback")}
            />
            <NavItem
              icon={<FileClock size={16} strokeWidth={1.75} />}
              label="Lịch sử version"
              to={`/reviews/${review.id}/versions`}
            />
            <NavItem
              icon={<History size={16} strokeWidth={1.75} />}
              label="Lịch sử review"
              to={`/reviews/${review.id}/history`}
            />
          </nav>
        </aside>

        {/* CENTER — PDF / Word preview */}
        <div
          ref={viewerRef}
          className="flex min-h-0 scroll-mt-4 flex-col gap-3"
        >
          <div className="lg:hidden">
            <BackLink label="Yêu cầu review" fallback="/reviews" />
          </div>
          <header className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] leading-[1.2] font-semibold text-ink lg:text-[24px]">
                {review.documentTitle}
              </h1>
              <Badge tone="brand">Version {review.version}</Badge>
            </div>
            <nav
              aria-label="Ngữ cảnh học vụ"
              className="flex flex-wrap items-center gap-x-1 text-[12px] text-muted"
            >
              {hierarchy.filter(Boolean).map((h, i, arr) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <span
                    className={
                      i === arr.length - 1 ? "font-semibold text-ink" : ""
                    }
                  >
                    {h}
                  </span>
                  {i < arr.length - 1 && (
                    <ChevronRight size={12} strokeWidth={1.75} />
                  )}
                </span>
              ))}
            </nav>
            <p className="text-[12px] text-muted">
              File:{" "}
              <span className="font-medium text-ink">{review.fileName}</span> ·
              Nộp bởi {review.submitter} · {review.submittedAt}
            </p>
          </header>
          <div className="rounded-[12px] border border-line bg-white p-3 lg:hidden">
            <StatusTracks
              documentStatus={review.documentStatus}
              aiStatus={aiStatus}
              ai={review.ai}
              supervisorStatus={status}
              compact
            />
          </div>
          <OriginalDocumentPanel
            key={review.id + review.version}
            review={review}
          />
          <DocumentViewer
            review={review}
            className="h-[70dvh] lg:h-auto lg:flex-1"
          />
          <p className="text-[11px] text-muted">
            Chỉ xem. Giảng viên không chỉnh sửa nội dung file; mọi thay đổi do
            sinh viên nộp ở version mới.
          </p>
        </div>

        {/* RIGHT — AI Review + Supervisor Review */}
        <aside
          ref={panelRef}
          className="flex min-h-0 scroll-mt-4 flex-col lg:overflow-hidden lg:rounded-[12px] lg:border lg:border-line lg:bg-white"
        >
          <div className="hidden flex-col gap-3 border-b border-line p-4 lg:flex">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[16px] font-semibold text-ink">
                Review của giảng viên
              </h2>
              <StatusBadge status={status} />
            </div>
            <StatusTracks
              documentStatus={review.documentStatus}
              aiStatus={aiStatus}
              ai={review.ai}
              supervisorStatus={status}
              compact
            />
          </div>
          <div
            id="review-workspace-tablist"
            role="tablist"
            className="flex gap-1 rounded-[8px] bg-subtle p-1 lg:mx-4 lg:mt-3"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                id={`review-workspace-tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={panel === t.id}
                aria-controls="review-workspace-tabpanel"
                tabIndex={panel === t.id ? 0 : -1}
                onClick={() => openPanel(t.id)}
                onKeyDown={(e) => {
                  const i = tabs.findIndex((x) => x.id === panel)
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault()
                    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]
                    openPanel(next.id)
                    document.getElementById(`review-workspace-tab-${next.id}`)?.focus()
                  } else if (e.key === "Home") {
                    e.preventDefault()
                    openPanel(tabs[0].id)
                    document.getElementById(`review-workspace-tab-${tabs[0].id}`)?.focus()
                  } else if (e.key === "End") {
                    e.preventDefault()
                    openPanel(tabs[tabs.length - 1].id)
                    document.getElementById(`review-workspace-tab-${tabs[tabs.length - 1].id}`)?.focus()
                  }
                }}
                className={`flex-1 whitespace-nowrap rounded-[6px] px-2 py-2 text-[13px] font-medium transition ${
                  panel === t.id
                    ? "bg-white text-brand shadow-[0_1px_2px_rgba(36,51,45,0.08)]"
                    : "text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div id="review-workspace-tabpanel" role="tabpanel" aria-labelledby={`review-workspace-tab-${panel}`} className="flex flex-col gap-3 pt-4 pb-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-4 lg:pb-4">
            {panel === "ai" && (
              <AIReviewSection
                key={review.id + review.version}
                review={review}
                added={added}
                onAddFinding={completed ? undefined : addFinding}
                onViewDocument={() =>
                  viewerRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              />
            )}
            {panel === "feedback" && (
              <>
                <h3 className="text-[14px] font-semibold text-ink">
                  Feedback của giảng viên · {review.version}
                </h3>
                {current.length ? (
                  current.map((f) => <FeedbackItem key={f.id} feedback={f} />)
                ) : (
                  <EmptyState
                    title="Chưa có feedback cho version này"
                    description="Có thể ghi chú theo trang, mục hoặc nhận xét chung cho tài liệu."
                  />
                )}
                {completed ? (
                  <Notice>
                    Review đã hoàn tất. Chỉ feedback được chọn thuộc lịch sử
                    chính thức và bị khóa; feedback bỏ chọn vẫn là nháp riêng
                    của giảng viên.
                  </Notice>
                ) : (
                  <FeedbackComposer onSubmit={addFeedback} />
                )}
                {previous.length > 0 && (
                  <>
                    <h3 className="mt-2 text-[14px] font-semibold text-ink">
                      Feedback version trước
                    </h3>
                    {previous.map((f) => (
                      <FeedbackItem key={f.id} feedback={f} />
                    ))}
                  </>
                )}
              </>
            )}
            {panel === "history" && (
              <>
                <ol>
                  {audit.map((e, i) => (
                    <TimelineItem
                      key={e.id}
                      event={e}
                      last={i === audit.length - 1}
                    />
                  ))}
                </ol>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    to={`/reviews/${review.id}/versions`}
                  >
                    Lịch sử version
                  </Button>
                  <Button
                    variant="secondary"
                    to={`/reviews/${review.id}/history`}
                  >
                    Lịch sử review
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="hidden border-t border-line p-4 lg:block">
            <DecisionBar review={review} onDecide={setDecision} />
          </div>
        </aside>
      </div>

      {/* Mobile sticky action area */}
      <div className="sticky bottom-0 z-20 -mx-5 border-t border-line bg-white px-5 pt-3 pb-3 lg:hidden">
        <DecisionBar review={review} onDecide={setDecision} mobile />
      </div>

      <DecisionModals
        review={review}
        open={decision}
        currentFeedback={current}
        onClose={() => setDecision(null)}
      />
    </>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  to,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  to?: string
}) {
  const cls = `flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-[13px] font-medium ${
    active ? "bg-brand-soft text-brand" : "text-ink hover:bg-subtle"
  }`
  if (to)
    return (
      <Link to={to} className={cls}>
        {icon}
        <span className="flex-1">{label}</span>
        <ArrowUpRight size={14} strokeWidth={1.75} className="text-muted" />
      </Link>
    )
  return (
    <button type="button" onClick={onClick} className={cls}>
      {icon}
      {label}
    </button>
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
          Yêu cầu chỉnh sửa
        </Button>
        <Button
          onClick={() => onDecide("approve")}
          icon={<Check size={16} strokeWidth={2} />}
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
