import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import Notice from "@/components/ui/Notice"
import { useManagement } from "@/data/managementStore"
import { runEvaluation, useReviewStore } from "@/data/reviewStore"
import { resolveReviewRule } from "@/lib/rubric"
import type { AIEvaluation, AIFinding, ReviewRequest } from "@/types"
export type AIState = "not_started" | "loading" | "completed" | "error"

export default function AIReviewSection({
  review,
  onAddFinding,
  added = [],
  detailed,
  onViewDocument,
}: {
  review: ReviewRequest
  findings?: AIFinding[]
  added?: string[]
  onAddFinding?: (f: AIFinding) => void
  detailed?: boolean
  initialState?: AIState
  onViewDocument?: () => void
}) {
  const cfg = useManagement()
  const store = useReviewStore()
  const [error, setError] = useState("")
  const runs = store.evaluations.filter((e) => e.reviewId === review.id)
  const current = runs
    .filter((e) => e.documentVersion === review.version)
    .at(-1)
  const rule = current?.ruleSnapshot ?? resolveReviewRule(review, cfg)
  const state = current?.evaluationStatus ?? "not_started"
  const completedReview = !["waiting", "inReview"].includes(
    review.supervisorStatus,
  )
  const start = (fail = false) => {
    setError("")
    void runEvaluation(review.id, fail).catch((e) => setError(e.message))
  }
  const criteria = rule?.criteria ?? []
  const additionalFindings = (current?.findings ?? []).filter(
    f => !current?.criterionResults.some(c => c.name === f.category),
  )
  const percent =
    current?.overallScore != null && current.maxScore
      ? (current.overallScore / current.maxScore) * 100
      : null
  return (
    <div className="flex flex-col gap-3 text-[14px]">
      <Notice>
        Kết quả AI mô phỏng. Không đọc hoặc phân tích nội dung PDF/DOCX thật.
        Mọi evidence cần Supervisor xác minh; điểm không tự phê duyệt hoặc từ
        chối.
      </Notice>
      <Card>
        <strong>
          {rule ? rule.name + " · v" + rule.version : "Chưa gán bộ quy tắc"}
        </strong>
        <p>{rule?.description}</p>
        <Badge
          tone={
            state === "error"
              ? "rust"
              : state === "completed"
                ? "brand"
                : "neutral"
          }
        >
          {state === "not_started"
            ? "Not Started · Chưa chạy"
            : state === "loading"
              ? "Loading · Đang mô phỏng"
              : state === "error"
                ? "Error · Có lỗi"
                : "Completed · Hoàn tất mô phỏng"}
        </Badge>
        {rule && (
          <p>
            AI {rule.aiEnabled ? "bật" : "tắt"} · Supervisor{" "}
            {rule.supervisorApproval
              ? "bắt buộc"
              : "tùy chọn, vẫn quyết định thủ công"}{" "}
            · Đạt từ {rule.passThreshold}% · Cải thiện từ{" "}
            {rule.improveThreshold}%
          </p>
        )}
        {review.ruleSnapshot && (
          <p>
            Đang dùng snapshot của bản nộp; thay đổi cấu hình chỉ áp dụng bản
            nộp mới.
          </p>
        )}
      </Card>
      <details className="rounded-xl border border-line bg-white p-3">
        <summary className="min-h-12 cursor-pointer font-semibold">
          Checklist cấu hình ({criteria.filter((c) => c.enabled).length} bật /{" "}
          {criteria.length})
        </summary>
        {criteria.map((c) => (
          <div key={c.id} className="border-t border-line py-3">
            <strong>
              {c.id} · {c.name}
            </strong>
            <p>
              {c.maxScore} điểm · {c.enabled ? "Bật" : "Tắt"} ·{" "}
              {c.critical
                ? "Critical"
                : c.required
                  ? "Bắt buộc"
                  : "Thông thường"}{" "}
              · AI {c.aiEnabled ? "bật" : "tắt"}
            </p>
            <p>{c.description}</p>
            <p>Hướng dẫn: {c.instruction || "Chưa cấu hình"}</p>
            <p>Evidence: {c.evidenceRequirement || "Supervisor xác minh"}</p>
          </div>
        ))}
        {!criteria.length && (
          <EmptyState
            title="Chưa có checklist"
            description="Supervisor cần cấu hình tiêu chí trong Bộ quy tắc."
          />
        )}
        {!criteria.length && (
          <Button variant="secondary" to="/rule-sets">
            Cấu hình Bộ quy tắc
          </Button>
        )}
      </details>
      {!completedReview &&
        rule?.aiEnabled &&
        rule.status === "active" &&
        criteria.some((c) => c.enabled) && (
          <div className="flex flex-col gap-2">
            <Button
              disabled={state === "loading"}
              loading={state === "loading"}
              onClick={() => start()}
            >
              {state === "error"
                ? "Thử lại AI Evaluation"
                : state === "completed"
                  ? "Chạy lại AI Evaluation"
                  : "Bắt đầu AI Evaluation"}
            </Button>
            <Button
              variant="secondary"
              disabled={state === "loading"}
              onClick={() => start(true)}
            >
              Mô phỏng lỗi AI
            </Button>
          </div>
        )}
      {state === "loading" && (
        <p role="status" className="animate-pulse rounded-lg bg-brand-soft p-4">
          Đang tạo kết quả mô phỏng theo rubric…
        </p>
      )}
      {(error || current?.error) && (
        <p role="alert" className="text-danger">
          {error || current?.error}
        </p>
      )}
      {completedReview && !current && (
        <Notice>
          Review lịch sử chưa có kết quả rubric. Không suy diễn kết quả
          Completed từ số đếm AI demo cũ.
        </Notice>
      )}
      {current?.evaluationStatus === "completed" && (
        <>
          <Card>
            <strong>
              Tổng điểm đề xuất: {current.overallScore ?? "Chưa đủ điểm"} /{" "}
              {current.maxScore}
            </strong>
            <p>
              {percent === null
                ? "Có tiêu chí chấm thủ công / tắt đề xuất điểm. Chưa xếp loại."
                : (percent >= (rule?.passThreshold ?? 80)
                    ? "Đạt"
                    : percent >= (rule?.improveThreshold ?? 70)
                      ? "Cần cải thiện"
                      : "Cần làm lại") +
                  " · " +
                  percent.toFixed(1) +
                  "% (mô phỏng)"}
            </p>
            <p>Cần xác minh evidence trước quyết định cuối cùng.</p>
          </Card>
          <CriterionAccordionList
            key={current.id}
            evaluation={current}
            onAddFinding={onAddFinding}
            added={added}
          />
          {additionalFindings.length > 0 && <h2 className="font-semibold">
            Findings & Evidence ({additionalFindings.length})
          </h2>}
          {!current.findings.length && (
            <Notice>
              Không có findings được cấu hình để sinh. Điều này không chứng minh
              tài liệu đạt yêu cầu.
            </Notice>
          )}
          {additionalFindings.map((f) => (
            <Card key={f.id}>
              <strong>{f.category}</strong>
              <p>{f.message}</p>
              {onAddFinding && (
                <Button
                  variant="secondary"
                  disabled={added.includes(f.id)}
                  onClick={() => onAddFinding(f)}
                >
                  {added.includes(f.id) ? "Đã thêm" : "Thêm vào feedback nháp"}
                </Button>
              )}
            </Card>
          ))}
        </>
      )}
      {onViewDocument ? (
        <Button variant="secondary" onClick={onViewDocument}>
          Đối chiếu tài liệu / evidence
        </Button>
      ) : (
        <Button variant="secondary" to={"/reviews/" + review.id}>
          Mở Workspace để đối chiếu tài liệu
        </Button>
      )}
      {!detailed && (
        <Button variant="secondary" to={"/reviews/" + review.id + "/ai-result"}>
          Xem kết quả và lịch sử AI
        </Button>
      )}
      {detailed && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">
            Lịch sử AI theo version ({runs.length})
          </h2>
          {runs.map((e) => (
            <details key={e.id} className="rounded-xl border border-line p-3">
              <summary className="min-h-12 cursor-pointer">
                {e.documentVersion} · {e.ruleSnapshot.name} v{e.ruleSetVersion}{" "}
                · {e.evaluationStatus}
              </summary>
              <p>
                {e.createdAt} · ID {e.documentVersionId}
              </p>
              <p>
                {e.overallScore ?? "—"} / {e.maxScore} (mô phỏng)
              </p>
              {e.criterionResults.map((c) => (
                <p key={c.criterionId}>
                  {c.criterionId} · {c.name}: {c.score ?? "—"}/{c.maxScore} ·{" "}
                  {c.evidence}
                </p>
              ))}
              {e.findings.map((f) => (
                <p key={f.id}>{f.message}</p>
              ))}
            </details>
          ))}
        </section>
      )}
    </div>
  )
}

/** Expansion is presentation-only and resets for each evaluation run. */
function CriterionAccordionList({ evaluation, onAddFinding, added }: {
  evaluation: AIEvaluation
  onAddFinding?: (finding: AIFinding) => void
  added: string[]
}) {
  const id = useId()
  const [expanded, setExpanded] = useState<string[]>([])
  const criteria = evaluation.criterionResults
  const allOpen = criteria.length > 0 && criteria.every(c => expanded.includes(c.criterionId))
  if (!criteria.length) return null
  return (
    <section className="flex min-w-0 flex-col gap-3" aria-label="Kết quả checklist AI">
      <Button variant="secondary" onClick={() => setExpanded(allOpen ? [] : criteria.map(c => c.criterionId))}>
        {allOpen ? "Thu gọn tất cả" : "Mở tất cả"}
      </Button>
      {criteria.map((c, index) => {
        const open = expanded.includes(c.criterionId)
        const triggerId = `${id}-trigger-${index}`
        const panelId = `${id}-panel-${index}`
        const findings = evaluation.findings.filter(f => f.category === c.name)
        return (
          <Card key={c.criterionId} className="gap-0">
            <h2>
              <button
                id={triggerId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setExpanded(ids => open ? ids.filter(value => value !== c.criterionId) : [...ids, c.criterionId])}
                className="flex min-h-12 w-full min-w-0 items-start gap-2 rounded-md py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-2 [overflow-wrap:anywhere]">
                  <span className="font-semibold">{c.criterionId} · {c.name}</span>
                  <span>Điểm AI đề xuất: {c.score ?? "Chấm thủ công"} / {c.maxScore}</span>
                  <span><Badge tone="amber">Cần xác minh</Badge></span>
                </span>
                <ChevronDown aria-hidden="true" size={20} className={`mt-1 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            </h2>
            <div id={panelId} aria-labelledby={triggerId} hidden={!open} className="min-w-0 border-t border-line pt-3 [overflow-wrap:anywhere]">
              <div className="flex flex-col gap-3">
                {findings.length > 0 && <strong>Nhận xét AI</strong>}
                {findings.map(f => (
                  <div key={f.id} className="flex flex-col gap-2">
                    <p>{f.message}</p>
                    {onAddFinding && <Button variant="secondary" disabled={added.includes(f.id)} onClick={() => onAddFinding(f)}>
                      {added.includes(f.id) ? "Đã thêm" : "Thêm vào feedback nháp"}
                    </Button>}
                  </div>
                ))}
                <strong>Evidence</strong>
                <p>{c.evidence}</p>
                {c.suggestions.length > 0 && <strong>Suggestions</strong>}
                {c.suggestions.map((suggestion, i) => <p key={i}>{suggestion}</p>)}
              </div>
            </div>
          </Card>
        )
      })}
    </section>
  )
}
