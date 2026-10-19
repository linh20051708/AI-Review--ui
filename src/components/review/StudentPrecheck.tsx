import { shortCriterion } from "@/components/ui/contentText"
import { useEffect, useRef, useState } from "react"
import Button from "@/components/ui/Button"
import { studentPrecheck } from "@/lib/studentPrecheck"
import type { AIEvaluation, RuleSet } from "@/types"

export default function StudentPrecheck({ rule, documentTitle, onReady }: { rule: RuleSet; documentTitle: string; onReady: () => void }) {
  const [result, setResult] = useState<AIEvaluation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  const run = async () => {
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setBusy(true); setError(""); setResult(null)
    try {
      const value = await studentPrecheck(rule, current.signal, documentTitle)
      if (!current.signal.aborted) { setResult(value); onReady() }
    } catch (e) {
      if (!current.signal.aborted) setError(e instanceof Error ? e.message : "Không thể kiểm tra. Vui lòng thử lại.")
    } finally { if (!current.signal.aborted) setBusy(false) }
  }
  return <section className="flex min-w-0 flex-col gap-3 text-[14px]" aria-label="AI Pre-check" aria-busy={busy}>
    <h2 className="font-semibold">AI Pre-check</h2>
    <p className="text-muted">Kết quả minh họa</p>
    <p className="break-words text-muted">{rule.name} · v{rule.version ?? 1}</p>
    {busy && <p role="status">Đang kiểm tra…</p>}
    {error && <p role="alert" className="text-danger">{error}</p>}
    {!result && <Button loading={busy} onClick={run}>{error ? "Thử lại" : "Kiểm tra bằng AI"}</Button>}
    {result && <>
      <p role="status" className="font-semibold">Điểm tham khảo: {result.overallScore ?? "Chưa có"} / {result.maxScore}</p>
      <p>{result.criterionResults.filter(c => c.score === c.maxScore).length} đạt · {result.criterionResults.filter(c => c.score !== null && c.score < c.maxScore).length} cần cải thiện · {result.criterionResults.filter(c => c.score === null).length} chưa chấm</p>
      <div className="divide-y divide-line">{result.findings.slice(0,3).map(f => <div key={f.id} className="space-y-1 py-3"><p className="font-semibold">{shortCriterion(f.category)} · {f.proposedScore ?? "—"}/{f.maxScore}</p><p>{f.issue}</p><p className="text-brand">{f.suggestion}</p></div>)}</div>

      <details><summary>Tiêu chí & gợi ý ({result.criterionResults.length})</summary>
        <ul className="divide-y divide-line">{result.criterionResults.map(c => <li key={c.criterionId} className="space-y-2 py-3">
          <p className="font-semibold">{c.name} · {c.score ?? "—"}/{c.maxScore}</p>
          <p>{c.comment}</p>
          {result.findings.filter(f => f.category === c.name).map(f => <p key={f.id}>{f.level === "error" ? "Lỗi" : "Cảnh báo"}: {f.issue ?? f.message}</p>)}
          {c.suggestions.map((s, i) => <p key={i}>{s}</p>)}
        </li>)}</ul>
      </details>
    </>}
  </section>
}
