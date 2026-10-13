import { CircleCheck, ClipboardList, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { useState } from "react"
import AIFindingCard from "@/components/review/AIFindingCard"
import ReviewContextCard from "@/components/review/ReviewContextCard"
import BackLink from "@/components/ui/BackLink"
import Badge, { toneClasses } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import { toast } from "@/components/ui/Toast"
import { aiChecks } from "@/data/mockData"
import { findingsFor, isCompleted } from "@/data/selectors"
import useReviewFromParams from "./useReviewFromParams"

type AIState = "not_started" | "loading" | "completed" | "error"

export default function AIReviewResultPage() {
  const { review } = useReviewFromParams()
  const [aiState, setAiState] = useState<AIState>(() =>
    review?.aiStatus === "aiReviewing" ? "loading" : "completed"
  )

  if (!review) return <EmptyState title="Không tìm thấy yêu cầu review" />
  const findings = findingsFor(review)

  const handleRunAI = () => {
    setAiState("loading")
    setTimeout(() => {
      setAiState("completed")
      toast("AI Review hoàn tất: 2 lỗi, 3 cảnh báo, 4 gợi ý")
    }, 1800)
  }

  const counts = [
    { value: review.ai.errors || 2, label: "Lỗi", tone: "rust" as const },
    { value: review.ai.warnings || 3, label: "Cảnh báo", tone: "amber" as const },
    { value: review.ai.suggestions || 4, label: "Gợi ý", tone: "olive" as const },
  ]

  return (
    <>
      <BackLink label="Không gian review" fallback={`/reviews/${review.id}`} />
      <PageHeading
        eyebrow="AI REVIEW · CHỈ THAM KHẢO"
        title="Kết quả AI Review"
        aside={
          aiState === "loading" ? (
            <Badge tone="olive">AI đang phân tích...</Badge>
          ) : (
            <Badge tone="brand">Đã hoàn tất</Badge>
          )
        }
        description={`${review.documentTitle} ${review.version} · ${review.fileName}`}
      />

      <ReviewContextCard review={review} />

      {/* Top action row */}
      <div className="flex items-center justify-between gap-3">
        <Notice>
          AI Review chỉ hỗ trợ tham khảo và không thể phê duyệt. Giảng viên đánh giá và quyết định độc lập.
        </Notice>
        <Button
          variant="secondary"
          className="w-auto shrink-0 min-h-12 px-4"
          icon={<RefreshCw size={16} />}
          loading={aiState === "loading"}
          disabled={aiState === "loading"}
          onClick={handleRunAI}
        >
          {aiState === "loading" ? "Đang phân tích..." : "Chạy lại AI Review"}
        </Button>
      </div>

      {aiState === "loading" ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[12px] border border-brand/30 bg-brand-soft/30 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-md">
            <Loader2 size={28} className="animate-spin" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <p className="text-[16px] font-bold text-ink">AI đang phân tích tài liệu...</p>
            <p className="text-[14px] text-muted leading-relaxed">
              Đang đối chiếu quy chuẩn môn học, kiểm tra tính đầy đủ của sơ đồ và ngữ nghĩa đặc tả...
            </p>
          </div>
          <div className="mt-3 flex w-full max-w-sm flex-col gap-2.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-line/80 mx-auto" />
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-line/60 mx-auto" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {counts.map((s) => (
              <div key={s.label} className={`flex flex-col gap-1 rounded-[12px] p-4 ${toneClasses[s.tone]}`}>
                <span className="text-[28px] leading-none font-semibold">{s.value}</span>
                <span className="text-[13px] font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          <section className="flex flex-col gap-3">
            <SectionHeader title="Kết quả kiểm tra quy chuẩn" />
            <Card className="gap-0 py-1">
              <ul>
                {aiChecks.map((c) => (
                  <li key={c.title} className="flex gap-3 border-b border-line py-3 last:border-b-0">
                    <CircleCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-muted" />
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 leading-[1.45]">
                      <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-ink">{c.title}</span>
                        <Badge tone={c.tone}>{c.result}</Badge>
                      </div>
                      <p className="text-[13px] text-muted">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeader title="Phát hiện chi tiết" meta={`${findings.length} mục`} />
            {findings.map((f) => (
              <AIFindingCard key={f.id} finding={f} />
            ))}
          </section>
        </>
      )}

      <Button to={`/reviews/${review.id}`} icon={<ClipboardList size={18} strokeWidth={1.75} />}>
        {isCompleted(review.supervisorStatus) ? "Mở không gian review" : "Quay lại review tài liệu"}
      </Button>
    </>
  )
}
