import assert from "node:assert/strict"
import { register } from "node:module"
register("./ts-loader.mjs", import.meta.url)
const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}
const mgmt = await import("../src/data/managementStore.ts")
const flow = await import("../src/data/reviewStore.ts")
const { personaTemplate, resolveReviewRule, mockEvaluation, validateRule } =
  await import("../src/lib/rubric.ts")
const { documentsFor } = await import("../src/data/selectors.ts")
const { buildReviewRequest } = await import("../src/data/mockData.ts")
const { reviewActions: actions, getReviewState: get } = flow
mgmt.resetManagement()
flow.resetReview()
assert.equal(personaTemplate.criteria.length, 10)
assert.deepEqual(
  personaTemplate.criteria.map((c) => c.id),
  Array.from({ length: 10 }, (_, i) => `P${String(i + 1).padStart(2, "0")}`),
)
assert.equal(
  personaTemplate.criteria.reduce((n, c) => n + c.maxScore, 0),
  100,
)
assert.equal(
  personaTemplate.criteria[0].name,
  "Đã xác định phạm vi sản phẩm, các tác vụ trọng tâm và nhóm người dùng liên quan.",
)
assert.equal(validateRule(personaTemplate), undefined)
assert.ok(validateRule({ ...personaTemplate, aiEnabled: false }))
assert.ok(
  validateRule({ ...personaTemplate, passThreshold: 50, improveThreshold: 70 }),
)
assert.ok(
  validateRule({
    ...personaTemplate,
    criteria: [personaTemplate.criteria[0], personaTemplate.criteria[0]],
  }),
)
const created = mgmt.saveRuleSet({
  ...structuredClone(personaTemplate),
  id: "test-rule",
  name: "Test rubric",
  prerequisiteApproval: false,
})
assert.equal(created.version, 1)
const edited = mgmt.saveRuleSet({
  ...created,
  criteria: created.criteria.map((c, i) =>
    i === 0 ? { ...c, maxScore: 20 } : c,
  ),
})
assert.equal(edited.version, 2)
const copy = mgmt.saveRuleSet({
  ...structuredClone(edited),
  id: "test-copy",
  status: "draft",
})
assert.equal(copy.version, 1)
assert.equal(
  mgmt.getManagementState().ruleSets.find((r) => r.id === created.id)
    .criteria[0].maxScore,
  20,
)
assert.ok(
  JSON.parse(storage.get("project-review:management:v2")).ruleSets.some(
    (r) => r.id === created.id,
  ),
)
const review = get().requests.find(
  (r) => r.classId === "se1701" && r.supervisorStatus === "waiting",
)
assert.ok(review)
mgmt.updateManagement((s) => ({
  classes: s.classes.map((c) =>
    c.id === review.classId ? { ...c, ruleSetOverride: edited.id } : c,
  ),
}))
assert.equal(resolveReviewRule(review, mgmt.getManagementState()).id, edited.id)
const cls = mgmt
  .getManagementState()
  .classes.find((c) => c.id === review.classId)
const offering = mgmt
  .getManagementState()
  .offerings.find((o) => o.id === cls.offeringId)
mgmt.updateManagement((s) => ({
  classes: s.classes.map((c) =>
    c.id === cls.id
      ? {
          ...c,
          labOverride: structuredClone(offering.labs).map((l) => ({
            ...l,
            items: l.items.map((i) =>
              i.id === review.documentId
                ? { ...i, ruleSetId: personaTemplate.id }
                : i,
            ),
          })),
        }
      : c,
  ),
}))
assert.equal(
  resolveReviewRule(review, mgmt.getManagementState()).id,
  personaTemplate.id,
  "Lab Item wins over Class",
)
assert.throws(() => actions.startReview(review.id), /AI Evaluation/)
assert.equal(flow.latestEvaluation(review), undefined)
const firstRun = flow.runEvaluation(review.id)
assert.equal(flow.latestEvaluation(review).evaluationStatus, "loading")
await firstRun
const first = structuredClone(flow.latestEvaluation(review))
assert.equal(first.evaluationStatus, "completed")
assert.equal(first.criterionResults.length, 10)
assert.equal(first.maxScore, 100)
assert.ok(first.criterionResults.every((c) => c.score === null || (Number.isFinite(c.score) && c.score >= 0 && c.score <= c.maxScore)), "Illustrative scores stay within the frozen criterion scale")
assert.equal(
  first.overallScore,
  first.criterionResults.every(c => c.score !== null)
    ? first.criterionResults.reduce((n, c) => n + c.score, 0)
    : null,
)
assert.ok(first.criterionResults.every((c) => c.needsVerification))
assert.ok(
  get().versions.some(
    (v) => v.id === first.documentVersionId && v.version === review.version,
  ),
)
mgmt.saveRuleSet({
  ...personaTemplate,
  criteria: personaTemplate.criteria.map((c) => ({ ...c, maxScore: 5 })),
})
await flow.runEvaluation(review.id, true)
assert.equal(flow.latestEvaluation(review).evaluationStatus, "error")
assert.throws(() => actions.decide(review.id, "approved"), /AI Evaluation/)
await flow.runEvaluation(review.id)
assert.equal(
  flow.latestEvaluation(review).maxScore,
  100,
  "Retry uses frozen snapshot, not edited rule",
)
assert.deepEqual(
  get().evaluations.find((e) => e.id === first.id),
  first,
  "Prior run remains unchanged",
)
const changed = mockEvaluation({
  ...first,
  ruleSnapshot: {
    ...first.ruleSnapshot,
    criteria: first.ruleSnapshot.criteria
      .slice(0, 3)
      .map((c, i) => ({ ...c, maxScore: 20, enabled: i !== 1 })),
  },
})
assert.equal(changed.criterionResults.length, 2)
assert.equal(changed.maxScore, 40)
const manual = mockEvaluation({
  ...first,
  ruleSnapshot: {
    ...first.ruleSnapshot,
    criteria: [
      {
        ...first.ruleSnapshot.criteria[0],
        suggestScore: false,
        suggestFindings: false,
        suggestSuggestions: false,
      },
    ],
  },
})
assert.equal(manual.overallScore, null)
assert.equal(manual.findings.length, 0)
assert.deepEqual(manual.criterionResults[0].suggestions, [])
actions.startReview(review.id)
const selected = actions.addFeedback({
  reviewId: review.id,
  version: review.version,
  severity: "Major",
  category: "Evidence",
  message: "Cần bổ sung evidence.",
})
const excluded = actions.addFeedback({
  reviewId: review.id,
  version: review.version,
  severity: "Minor",
  category: "Nháp",
  message: "Không công bố nhận xét này.",
})
actions.decide(review.id, "needsRevision", "Bổ sung evidence.", [selected])
assert.equal(get().feedback.find((f) => f.id === selected).official, true)
assert.equal(get().feedback.find((f) => f.id === excluded).official, false)
assert.deepEqual(get().audit.at(-1).selectedFeedbackIds, [selected])
const nextVersion = "v" + (Number(review.version.slice(1)) + 1)
const latestRule = mgmt
  .getManagementState()
  .ruleSets.find((r) => r.id === personaTemplate.id)
mgmt.saveRuleSet({ ...latestRule, maxResubmissions: 0 })
assert.throws(
  () =>
    actions.submitVersion({
      reviewId: review.id,
      version: nextVersion,
      fileName: "revision.pdf",
      fileType: "PDF",
      pageCount: 2,
      submitter: "Test",
    }),
  /nộp lại/,
)
mgmt.saveRuleSet({
  ...latestRule,
  prerequisiteApproval: false,
  resubmissionEnabled: true,
  maxResubmissions: 99,
})
actions.submitVersion({
  reviewId: review.id,
  version: nextVersion,
  fileName: "revision.pdf",
  fileType: "PDF",
  pageCount: 2,
  submitter: "Test",
})
const next = get().requests.find((r) => r.id === review.id)
assert.equal(next.aiStatus, "notRun")
assert.equal(flow.latestEvaluation(next), undefined)
await flow.runEvaluation(next.id)
assert.equal(
  flow.latestEvaluation(next).maxScore,
  50,
  "New submission uses new rule snapshot",
)
assert.notEqual(
  flow.latestEvaluation(next).documentVersionId,
  first.documentVersionId,
)
assert.deepEqual(
  get().evaluations.find((e) => e.id === first.id),
  first,
)
actions.startReview(next.id)
actions.decide(next.id, "approved", undefined, [])
assert.equal(
  get().requests.find((r) => r.id === next.id).supervisorStatus,
  "approved",
)
await assert.rejects(() => flow.runEvaluation(next.id), /hoàn tất/)
// Auto mode and disabled AI are both derived from the assigned rule.
const autoRule = mgmt.saveRuleSet({
  ...edited,
  id: "auto-test",
  aiReview: "auto",
  prerequisiteApproval: false,
})
mgmt.updateManagement((s) => ({
  classes: s.classes.map((c) =>
    c.id === cls.id
      ? { ...c, ruleSetOverride: autoRule.id, labOverride: undefined }
      : c,
  ),
}))
const autoReview = buildReviewRequest({
  id: "auto-review",
  projectId: review.projectId,
  documentId: "test-auto-document",
  documentTitle: "Test automatic",
  version: "v1",
  supervisorStatus: "waiting",
  documentStatus: "submitted",
  aiStatus: "notRun",
  ai: { errors: 0, warnings: 0, suggestions: 0 },
  submitter: "Test",
  submittedAt: "15/10/2026 · 10:00",
  requestedAt: "15/10/2026 · 10:00",
})
actions.submitFirstVersion({
  review: autoReview,
  version: "v1",
  fileName: "auto.pdf",
  fileType: "PDF",
  pageCount: 2,
})
assert.equal(flow.latestEvaluation(autoReview).evaluationStatus, "loading")
await new Promise((resolve) => setTimeout(resolve, 1250))
assert.equal(flow.latestEvaluation(autoReview).evaluationStatus, "completed")
const offRule = mgmt.saveRuleSet({
  ...autoRule,
  id: "disabled-test",
  aiEnabled: false,
  aiRequiredBeforeSupervisor: false,
})
mgmt.updateManagement((s) => ({
  classes: s.classes.map((c) =>
    c.id === cls.id ? { ...c, ruleSetOverride: offRule.id } : c,
  ),
}))
const disabled = {
  ...autoReview,
  id: "disabled-review",
  documentId: "disabled-document",
}
actions.submitFirstVersion({
  review: disabled,
  version: "v1",
  fileName: "manual.pdf",
  fileType: "PDF",
  pageCount: 1,
})
await assert.rejects(() => flow.runEvaluation(disabled.id), /chưa được bật/)
actions.startReview(disabled.id)
actions.decide(disabled.id, "notAccepted", "Sai tài liệu.", [])
assert.equal(
  get().requests.find((r) => r.id === disabled.id).supervisorStatus,
  "notAccepted",
)
assert.ok(
  JSON.parse(storage.get("project-review:review:v1")).evaluations.length >= 5,
)
console.log(
  "PASS: rule create/edit/copy; Persona 10x10; validation; assignment priority; loading/completed/error/retry; weighted checklist; immutable snapshots across versions; selected feedback/decision/history; resubmission limit; auto/disabled AI; persistence.",
)
