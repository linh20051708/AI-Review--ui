import assert from "node:assert/strict"
import { register } from "node:module"
register("./ts-loader.mjs", import.meta.url)
const storage = new Map()
globalThis.localStorage = {
  getItem: k => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: k => storage.delete(k),
}
const { getManagementState } = await import("../src/data/managementStore.ts")
const { getReviewState } = await import("../src/data/reviewStore.ts")
const { seedDemoManagement, seedDemoReviews } = await import("../src/data/demoSeed.ts")
const { resolveReviewRule, validateRule, personaTemplate } = await import("../src/lib/rubric.ts")
const { documentsFor } = await import("../src/data/selectors.ts")
const { ruleSets: legacyRules } = await import("../src/data/mockData.ts")
const m = getManagementState(), r = getReviewState()
const demo = r.requests.filter(r => r.id.startsWith("demo-ready-"))
assert.equal(demo.length, 3)
for (const request of demo) {
  const p = m.projects.find(p => p.id === request.projectId)
  const g = m.groups.find(g => g.id === p.groupId)
  const c = m.classes.find(c => c.id === g.classId)
  const o = m.offerings.find(o => o.id === c.offeringId)
  assert.equal(g.projectId, p.id)
  assert.equal(c.id, request.classId)
  assert.equal(o.semesterId, request.semesterId)
  assert.equal(o.courseId, request.courseId)
  assert.ok(m.semesters.some(s => s.id === o.semesterId))
  assert.ok(m.courses.some(s => s.id === o.courseId))
  assert.ok(g.memberIds.every(id => m.students.some(s => s.id === id && s.groupId === g.id && s.classId === c.id)))
  assert.ok(o.labs.some(l => l.items.some(i => i.id === request.documentId)))
  assert.equal(documentsFor(p, r.requests, m).length, 3)
  // Check assignment as well as immutable review snapshots.
  const rule = resolveReviewRule({ ...request, ruleSnapshot: undefined }, m)
  assert.equal(rule.id, request.ruleSnapshot.id)
  assert.equal(rule.documentType, request.documentTitle)
  assert.equal(rule.status, "active")
  assert.equal(validateRule(rule), undefined)
  assert.equal(rule.criteria.reduce((n, c) => n + c.maxScore, 0), 100)
  const versions = r.versions.filter(v => v.reviewId === request.id)
  assert.deepEqual(versions.map(v => v.version), ["v1", "v2"])
  assert.equal(versions.filter(v => v.isCurrent).length, 1)
  for (const v of versions) {
    const e = r.evaluations.find(e => e.documentVersionId === v.id)
    assert.equal(e.evaluationStatus, "completed")
    assert.equal(e.criterionResults.length, rule.criteria.length)
    assert.ok(e.criterionResults.every(c => c.needsVerification))
    assert.ok(r.feedback.some(f => f.reviewId === request.id && f.version === v.version))
  }
  assert.ok(r.audit.some(e => e.reviewId === request.id && e.selectedFeedbackIds?.length))
}
assert.deepEqual(demo[0].ruleSnapshot.criteria, personaTemplate.criteria)
const serialized = value => JSON.parse(JSON.stringify(value))
assert.deepEqual(JSON.parse(storage.get("project-review:management:v2")), serialized(m))
assert.deepEqual(JSON.parse(storage.get("project-review:review:v1")), serialized(r))
// Old saved state: preserve every existing entity, including a customized demo ID.
const oldM = structuredClone(m), oldR = structuredClone(r)
delete oldM.demoSeedVersion
delete oldR.demoSeedVersion
oldM.ruleSets[0].name = "User custom rule"
oldR.requests[0].note = "User private edits"
oldM.ruleSets.find(x => x.id === demo[0].ruleSnapshot.id).status = "draft"
oldR.requests.find(x => x.id === demo[0].id).version = "v7"
assert.deepEqual(seedDemoManagement(oldM), { ...oldM, demoSeedVersion: 2 })
assert.deepEqual(seedDemoReviews(oldR, oldM), { ...oldR, demoSeedVersion: 1 })
const legacy = { ...structuredClone(m), demoSeedVersion: undefined, ruleSets: structuredClone(legacyRules) }
const upgraded = seedDemoManagement(legacy)
assert.ok(upgraded.ruleSets.every(rule => rule.criteria?.length))
const customized = structuredClone(legacy)
customized.ruleSets[0].name = "Custom empty checklist"
assert.deepEqual(seedDemoManagement(customized).ruleSets[0], customized.ruleSets[0])
for (let i = 0; i < 5; i++) {
  assert.deepEqual(seedDemoManagement(serialized(m)), serialized(m))
  assert.deepEqual(seedDemoReviews(serialized(r), m), serialized(r))
}
// A removed entity is not resurrected after the migration has already run.
const removed = { ...m, projects: m.projects.filter(p => p.id !== demo[0].projectId) }
assert.deepEqual(seedDemoManagement(removed), removed)
console.log("PASS: demo links, active rubrics, snapshots, AI, feedback, versions, persistence, preservation and idempotence")
