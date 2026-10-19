import { contentText, ruleDescription, shortCriterion } from "@/components/ui/contentText"
import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import { useManagement } from "@/data/managementStore"
import { runEvaluation, useReviewStore } from "@/data/reviewStore"
import { currentIllustration, resolveReviewRule } from "@/lib/rubric"
import { evaluationForReview } from "@/lib/reviewPresentation"
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
  const latest = evaluationForReview(review, store.evaluations)
  const current = latest ? currentIllustration(latest, review.documentTitle) : undefined
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
    (f) => !current?.criterionResults.some((c) => c.name === f.category),
  )
  const percent =
    current?.overallScore != null && current.maxScore
      ? (current.overallScore / current.maxScore) * 100
      : null
  const canRun =
    !completedReview &&
    rule?.aiEnabled &&
    rule.status === "active" &&
    criteria.some((c) => c.enabled)
  const viewDocument = onViewDocument ? (
    <Button onClick={onViewDocument}>Đối chiếu tài liệu</Button>
  ) : (
    <Button to={"/reviews/" + review.id}>Đối chiếu tài liệu</Button>
  )

  return (
    <div className="flex min-w-0 flex-col gap-4 text-[14px]">

      {current?.evaluationStatus === "completed" ? (
        <>
          <Card className="gap-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-[16px] font-semibold">Điểm tham khảo</h2>
              <p className="text-[28px] font-semibold leading-tight tabular-nums">
                {current.overallScore ?? "—"}
                <span className="text-[16px] font-normal text-muted">
                  {" "}
                  / {current.maxScore}
                </span>
              </p>
            </div>
            <span>
              <Badge tone="amber">Kết quả minh họa</Badge>
            </span>
            <p>{current.criterionResults.filter(c => c.score === c.maxScore).length} đạt · {current.criterionResults.filter(c => c.score !== null && c.score < c.maxScore).length} cần cải thiện · {current.criterionResults.filter(c => c.score === null).length} chưa chấm</p>
            {current.findings.slice(0,3).map(f => <div key={f.id} className="border-t border-line pt-3"><p className="font-semibold">{shortCriterion(f.category)} · {f.proposedScore ?? "—"}/{f.maxScore ?? "—"}</p><p>{f.issue ?? contentText(f.message)}</p>{f.suggestion && <p className="mt-1 text-brand">{f.suggestion}</p>}</div>)}
            {viewDocument}
            <details className="refinement-details">
              <summary>Chi tiết điểm đề xuất</summary>
              <div className="flex flex-col gap-2 py-3">
                <p>
                  {percent === null
                    ? "Có tiêu chí chấm thủ công / tắt đề xuất điểm. Chưa xếp loại."
                    : "Mức điểm đề xuất: " +
                      (percent >= (rule?.passThreshold ?? 80)
                        ? "Đạt"
                        : percent >= (rule?.improveThreshold ?? 70)
                          ? "Cần cải thiện"
                          : "Cần làm lại") +
                      " · " +
                      percent.toFixed(1) +
                      "%"}
                </p>
                <p className="text-muted">
                  Điểm tham khảo; giảng viên quyết định cuối cùng.
                </p>
              </div>
            </details>
          </Card>
          <CriterionAccordionList
            key={current.id}
            evaluation={current}
            onAddFinding={onAddFinding}
            added={added}
          />
          {additionalFindings.length > 0 && (
            <section
              aria-label="Nhận xét bổ sung"
              className="flex flex-col gap-3"
            >
              <h2 className="text-[16px] font-semibold">
                Nhận xét bổ sung ({additionalFindings.length})
              </h2>
              <div className="divide-y divide-line">
                {additionalFindings.map((f) => (
                  <div key={f.id} className="flex flex-col gap-2 py-3">
                    <strong>{f.category}</strong>
                    <p>{f.issue ?? contentText(f.message)}</p>
                    {onAddFinding && (
                      <Button
                        variant="secondary"
                        disabled={added.includes(f.id)}
                        onClick={() => onAddFinding(f)}
                      >
                        {added.includes(f.id)
                          ? "Đã thêm"
                          : "Thêm vào feedback nháp"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {!current.findings.length && (
            <p className="text-muted">
              Chưa có nhận xét AI. Điều này không chứng minh tài liệu đạt yêu
              cầu.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <h2 className="text-[16px] font-semibold">
              {state === "loading"
                ? "Đang tạo đề xuất"
                : state === "error"
                  ? "AI gặp lỗi"
                  : "Chưa có kết quả AI"}
            </h2>
            {state === "loading" && (
              <p
                role="status"
                className="animate-pulse rounded-lg bg-brand-soft p-4"
              >
                Đang tạo đề xuất theo tiêu chí…
              </p>
            )}
            {(error || current?.error) && (
              <p role="alert" className="text-danger">
                {error || current?.error}
              </p>
            )}
            {canRun && (
              <Button
                disabled={state === "loading"}
                loading={state === "loading"}
                onClick={() => start()}
              >
                {state === "error"
                  ? "Thử lại AI Evaluation"
                  : "Bắt đầu AI Evaluation"}
              </Button>
            )}
            {completedReview && !current && (
              <p className="text-muted">
                Chưa có kết quả đánh giá theo tiêu chí cho phiên bản này.
              </p>
            )}
            {!canRun && state === "not_started" && !completedReview && (
              <p className="text-muted">
                Kiểm tra bộ quy tắc và tiêu chí đang bật trước khi chạy AI.
              </p>
            )}
            <div>
              {onViewDocument ? (
                <Button variant="secondary" onClick={onViewDocument}>
                  Đối chiếu tài liệu
                </Button>
              ) : (
                <Button variant="secondary" to={"/reviews/" + review.id}>
                  Đối chiếu tài liệu
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <details className="refinement-details">
        <summary>
          Cấu hình đánh giá · {criteria.filter((c) => c.enabled).length} tiêu
          chí bật
        </summary>
        <div className="flex flex-col gap-3 py-3">
          <strong>
            {rule ? rule.name + " · v" + rule.version : "Chưa gán bộ quy tắc"}
          </strong>
          {ruleDescription(rule?.description) && <p>{ruleDescription(rule?.description)}</p>}
          <p>
            Trạng thái AI:{" "}
            {state === "completed"
              ? "Đã có đề xuất"
              : state === "loading"
                ? "Đang tạo đề xuất"
                : state === "error"
                  ? "Có lỗi"
                  : "Chưa chạy"}
          </p>
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
              Quy tắc được lưu theo bản nộp; thay đổi cấu hình chỉ áp dụng bản
              nộp mới.
            </p>
          )}
          <details className="refinement-details">
            <summary>Tiêu chí & hướng dẫn ({criteria.length})</summary>
            {criteria.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-2 border-t border-line py-3"
              >
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
                <p>
                  Evidence: {c.evidenceRequirement || "Supervisor xác minh"}
                </p>
              </div>
            ))}
          </details>
          {!criteria.length && (
            <>
              <EmptyState
                title="Chưa có checklist"
                description="Cấu hình tiêu chí trong Bộ quy tắc."
              />
              <Button variant="secondary" to="/rule-sets">
                Cấu hình Bộ quy tắc
              </Button>
            </>
          )}
        </div>
      </details>
      {canRun && state === "completed" && <Button variant="secondary" onClick={() => start()}>Chạy lại AI Evaluation</Button>}
      {!detailed && (
        <Button variant="secondary" to={"/reviews/" + review.id + "/ai-result"}>
          Kết quả & lịch sử AI
        </Button>
      )}
      {detailed && (
        <details className="refinement-details">
          <summary>Lịch sử AI ({runs.length} lần)</summary>
          <div className="flex flex-col gap-3 py-3">
            {runs.length ? (
              runs.map((e) => (
                <details key={e.id} className="refinement-details">
                  <summary>
                    {e.documentVersion} · {e.evaluationStatus}
                  </summary>
                  <div className="flex flex-col gap-2 py-3">
                    <p>
                      {e.ruleSnapshot.name} · v{e.ruleSetVersion}
                    </p>
                    <p>
                      {e.createdAt}
                    </p>
                    <p>
                      {e.overallScore ?? "—"} / {e.maxScore} · AI đề xuất · Chưa xác minh
                    </p>
                    {e.criterionResults.map((c) => (
                      <p key={c.criterionId}>
                        {c.criterionId} · {c.name}: {c.score ?? "—"}/
                        {c.maxScore} · {contentText(c.evidence)}
                      </p>
                    ))}
                    {e.findings.map((f) => (
                      <p key={f.id}>{contentText(f.message)}</p>
                    ))}
                  </div>
                </details>
              ))
            ) : (
              <p className="text-muted">Chưa có lần chạy AI.</p>
            )}
          </div>
        </details>
      )}
    </div>
  )
}

function CriterionAccordionList({
  evaluation,
  onAddFinding,
  added,
}: {
  evaluation: AIEvaluation
  onAddFinding?: (finding: AIFinding) => void
  added: string[]
}) {
  const id = useId()
  const [expanded, setExpanded] = useState<string[]>([])
  const [attentionOnly, setAttentionOnly] = useState(true)
  const allCriteria = evaluation.criterionResults
  const attention = allCriteria.filter(
    (c) => c.score === null || c.score < c.maxScore,
  )
  const criteria = attentionOnly && attention.length ? attention : allCriteria
  const allOpen =
    criteria.length > 0 &&
    criteria.every((c) => expanded.includes(c.criterionId))
  if (!allCriteria.length) return null
  return (
    <section
      className="flex min-w-0 flex-col gap-3"
      aria-label="Kết quả checklist AI"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[16px] font-semibold">Tiêu chí</h2>
        <button
          type="button"
          className="min-h-12 px-2 font-semibold text-brand"
          onClick={() =>
            setExpanded(allOpen ? [] : criteria.map((c) => c.criterionId))
          }
        >
          {allOpen ? "Thu gọn" : "Mở tất cả"}
        </button>
      </div>
      <div
        role="group"
        aria-label="Phạm vi tiêu chí"
        className="grid grid-cols-2 gap-1 rounded-lg bg-subtle p-1"
      >
        <button
          type="button"
          aria-pressed={attentionOnly}
          onClick={() => setAttentionOnly(true)}
          className={`min-h-12 rounded-md px-2 ${
            attentionOnly
              ? "bg-white font-semibold text-brand shadow-sm"
              : "text-muted"
          }`}
        >
          Cần chú ý ({attention.length})
        </button>
        <button
          type="button"
          aria-pressed={!attentionOnly}
          onClick={() => setAttentionOnly(false)}
          className={`min-h-12 rounded-md px-2 ${
            !attentionOnly
              ? "bg-white font-semibold text-brand shadow-sm"
              : "text-muted"
          }`}
        >
          Tất cả ({allCriteria.length})
        </button>
      </div>
      {attentionOnly && !attention.length && (
        <p className="text-muted">
          Không có tiêu chí thiếu điểm đề xuất. Vẫn cần xác minh tất cả tiêu
          chí.
        </p>
      )}
      <div className="divide-y divide-line rounded-xl border border-line bg-white px-4">
        {criteria.map((c, index) => {
          const open = expanded.includes(c.criterionId)
          const triggerId = `${id}-trigger-${index}`
          const panelId = `${id}-panel-${index}`
          const findings = evaluation.findings.filter(
            (f) => f.category === c.name,
          )
          const config = evaluation.ruleSnapshot.criteria?.find(
            (item) => item.id === c.criterionId,
          )
          return (
            <div key={c.criterionId} className="min-w-0 py-1">
              <h3>
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() =>
                    setExpanded((ids) =>
                      open
                        ? ids.filter((value) => value !== c.criterionId)
                        : [...ids, c.criterionId],
                    )
                  }
                  className="flex min-h-12 w-full min-w-0 items-start gap-2 py-3 text-left"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-semibold">
                      {c.criterionId} · {shortCriterion(c.name)}
                    </span>
                    <span className="text-muted">
                      {c.score === null
                        ? `Chấm thủ công / ${c.maxScore}`
                        : `${c.score}/${c.maxScore}`}{" "}

                      {config?.critical
                        ? " · Critical"
                        : config?.required
                          ? " · Bắt buộc"
                          : ""}
                    </span>
                  </span>
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    className={`mt-1 shrink-0 ${open ? "rotate-180" : ""}`}
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                hidden={!open}
                className="min-w-0 border-t border-line py-4"
              >
                <div className="flex flex-col gap-3">
                  <p className="font-semibold">{c.name}</p>
                  {findings.length > 0 && <strong>Nhận xét AI</strong>}
                  {findings.map((f) => (
                    <div key={f.id} className="flex flex-col gap-2">
                      <p>{f.issue ?? contentText(f.message)}</p>
                      {onAddFinding && (
                        <Button
                          variant="secondary"
                          disabled={added.includes(f.id)}
                          onClick={() => onAddFinding(f)}
                        >
                          {added.includes(f.id)
                            ? "Đã thêm"
                            : "Thêm vào feedback nháp"}
                        </Button>
                      )}
                    </div>
                  ))}
                  <strong>Nội dung đối chiếu</strong>
                  <p>{contentText(c.evidence)}</p>
                  {c.suggestions.length > 0 && <strong>Gợi ý</strong>}
                  {c.suggestions.map((suggestion, i) => (
                    <p key={i}>{contentText(suggestion)}</p>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
