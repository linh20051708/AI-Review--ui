import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import AIFindingCard from "@/components/review/AIFindingCard"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Notice from "@/components/ui/Notice"
import { toast } from "@/components/ui/Toast"
import type { AIFinding, ReviewRequest } from "@/types"

export type AIState = "not_started" | "loading" | "completed" | "error"

interface Props {
  review: ReviewRequest
  findings: AIFinding[]
  added?: string[]
  onAddFinding?: (f: AIFinding) => void
  detailed?: boolean
  initialState?: AIState
}

export default function AIReviewSection({
  review,
  findings,
  added = [],
  onAddFinding,
  detailed = false,
  initialState,
}: Props) {
  // Determine starting state from review data, or override if provided
  const [state, setState] = useState<AIState>(() => {
    if (initialState) return initialState
    if (review.aiStatus === "aiReviewing") return "loading"
    if (review.aiStatus === "aiReviewed") return "completed"
    return "not_started"
  })

  const runAIReview = () => {
    setState("loading")
    setTimeout(() => {
      setState("completed")
      toast("AI Review hoàn tất: 2 lỗi, 3 cảnh báo, 4 gợi ý")
    }, 1800)
  }

  const triggerErrorSimulation = () => {
    setState("loading")
    setTimeout(() => {
      setState("error")
      toast("Không thể hoàn tất AI Review. Vui lòng thử lại.")
    }, 1500)
  }

  const counts = [
    { value: review.ai.errors || 2, label: "Lỗi", bg: "bg-rust-soft text-rust border-rust/20" },
    { value: review.ai.warnings || 3, label: "Cảnh báo", bg: "bg-amber-soft text-amber border-amber/20" },
    { value: review.ai.suggestions || 4, label: "Gợi ý", bg: "bg-olive-soft text-olive border-olive/20" },
  ]

  // NOT_STARTED STATE
  if (state === "not_started") {
    return (
      <div className="flex flex-col gap-3">
        <EmptyState
          icon={<Sparkles size={24} className="text-brand" />}
          title="AI Review chưa được chạy"
          description="Khởi chạy AI để tự động đối chiếu quy chuẩn, kiểm tra sơ đồ và phát hiện lỗi trước khi giảng viên đánh giá."
          action={
            <Button
              icon={<Sparkles size={18} strokeWidth={1.75} />}
              onClick={runAIReview}
              className="w-auto px-5"
            >
              Chạy AI Review
            </Button>
          }
        />
        <Notice>
          AI Review chỉ mang tính hỗ trợ. Quyết định cuối cùng thuộc về giảng viên.
        </Notice>
      </div>
    )
  }

  // LOADING STATE
  if (state === "loading") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center justify-center gap-3 rounded-[12px] border border-brand/30 bg-brand-soft/40 p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-sm">
            <Loader2 size={24} className="animate-spin" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-bold text-ink">AI đang phân tích tài liệu...</p>
            <p className="text-[13px] text-muted">
              Đang đối chiếu quy chuẩn đồ án, kiểm tra cú pháp và cấu trúc tài liệu...
            </p>
          </div>

          {/* Skeleton progress cards */}
          <div className="mt-2 flex w-full flex-col gap-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-line/80 mx-auto" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-line/60 mx-auto" />
          </div>

          <Button disabled loading className="mt-2 w-auto px-6 opacity-80">
            Đang phân tích...
          </Button>
        </div>

        <Notice>
          Giảng viên vẫn có thể xem trước tài liệu và ghi nhận feedback độc lập trong khi AI đang xử lý.
        </Notice>
      </div>
    )
  }

  // ERROR STATE
  if (state === "error") {
    return (
      <div className="flex flex-col gap-3">
        <EmptyState
          icon={<AlertCircle size={24} className="text-danger" />}
          title="Không thể hoàn tất AI Review"
          description="Đã xảy ra lỗi trong quá trình phân tích tài liệu hoặc kết nối dịch vụ bị gián đoạn."
          action={
            <Button
              variant="secondary"
              icon={<RefreshCw size={16} strokeWidth={1.75} />}
              onClick={runAIReview}
              className="w-auto px-5"
            >
              Thử lại
            </Button>
          }
        />
        <Notice>
          AI Review chỉ mang tính hỗ trợ. Bạn có thể tự thẩm định tài liệu mà không cần đợi AI.
        </Notice>
      </div>
    )
  }

  // COMPLETED STATE
  return (
    <div className="flex flex-col gap-3">
      {/* Header status badge + re-run action */}
      <div className="flex items-center justify-between gap-2 rounded-[8px] bg-brand-soft px-3 py-2 border border-brand/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-brand shrink-0" />
          <span className="text-[13px] font-semibold text-brand">AI Review hoàn tất</span>
        </div>
        <button
          type="button"
          onClick={runAIReview}
          className="inline-flex min-h-12 items-center gap-1.5 px-2 text-[12px] font-semibold text-brand hover:underline active:scale-95 transition"
        >
          <RefreshCw size={14} />
          <span>Chạy lại AI Review</span>
        </button>
      </div>

      {/* Summary count pills */}
      <div className="grid grid-cols-3 gap-2">
        {counts.map((c) => (
          <div
            key={c.label}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-[10px] border p-2.5 ${c.bg}`}
          >
            <span className="text-[22px] font-bold leading-none">{c.value}</span>
            <span className="text-[12px] font-medium">{c.label}</span>
          </div>
        ))}
      </div>

      <Notice>
        AI Review chỉ mang tính hỗ trợ. Quyết định cuối cùng thuộc về giảng viên.
      </Notice>

      {/* Findings list */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-muted">
            Phát hiện của AI ({findings.length})
          </span>
          {!detailed && (
            <Link
              to={`/reviews/${review.id}/ai-result`}
              className="inline-flex min-h-12 items-center gap-1 text-[13px] font-semibold text-brand hover:underline"
            >
              Xem báo cáo đầy đủ <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {findings.length === 0 ? (
          <EmptyState
            title="AI không phát hiện vấn đề nào"
            description="Tài liệu tuân thủ tốt các tiêu chí kiểm tra sơ bộ."
          />
        ) : (
          findings.map((f) => (
            <AIFindingCard
              key={f.id}
              finding={f}
              added={added.includes(f.id)}
              onAdd={onAddFinding ? () => onAddFinding(f) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
