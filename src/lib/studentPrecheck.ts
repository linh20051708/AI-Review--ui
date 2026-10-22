import { mockEvaluation, normalizeRule, validateRule } from "@/lib/rubric"
import type { AIEvaluation, RuleSet } from "@/types"

/** Local draft only: no stores, file parsing, versions or review requests. */
export async function studentPrecheck(rule: RuleSet, signal: AbortSignal, documentTitle = rule.documentType ?? ""): Promise<AIEvaluation> {
  const snapshot = normalizeRule(structuredClone(rule))
  const invalid = validateRule(snapshot)
  if (invalid) throw new Error(invalid)
  if (snapshot.status !== "active" || !snapshot.aiEnabled)
    throw new Error("Bộ quy tắc chưa bật AI.")
  await new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Cancelled", "AbortError"))
    const cancel = () => { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")) }
    const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve() }, 600)
    signal.addEventListener("abort", cancel, { once: true })
  })
  return mockEvaluation({
    id: "local-precheck", reviewId: "", documentId: "", documentVersionId: "",
    documentVersion: "draft", ruleSetId: snapshot.id, ruleSetVersion: snapshot.version ?? 1,
    ruleSnapshot: snapshot, evaluationStatus: "loading", criterionResults: [],
    overallScore: null, maxScore: 0, findings: [], createdAt: new Date().toISOString(),
  }, documentTitle)
}
