import assert from "node:assert/strict"
import { register } from "node:module"
register("./self-service-loader.mjs", import.meta.url)
const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}
const auth = await import("../src/app/auth.ts")
const { getManagementState: get, updateManagement: update } = await import(
  "../src/data/managementStore.ts"
)
const actions = await import("../src/data/selfService.ts")
const { seedSelfService } = await import("../src/data/selfServiceSeed.ts")
const { resolveProjectAcademicContext } = await import("../src/lib/config.ts")
const { reviewActions, getReviewState } = await import(
  "../src/data/reviewStore.ts"
)
const before = structuredClone(get().projects)
assert.deepEqual(seedSelfService(get()), get(), "migration must be idempotent")
auth.signIn("student", "self-create")
assert.throws(() => actions.createGroup("self-service-class", "Too early"))
assert.throws(() => actions.joinClass("invalid"))
actions.joinClass("SELF323")
assert.throws(() => actions.joinClass("SELF323"))
const group = actions.createGroup("self-service-class", "Test Group")
assert.equal(group.leaderId, "self-create")
assert.throws(() => actions.createGroup("self-service-class", "Duplicate"))
assert.throws(() => actions.joinGroup("self-open-group"))
actions.registerProject(
  group.id,
  "Self-service project",
  "Student-created scope",
)
assert.equal(
  get().projects.length,
  before.length,
  "pending registration must not create an active project",
)
assert.throws(() => actions.registerProject(group.id, "Duplicate", "scope"))
const regId = get().registrations.find((r) => r.groupId === group.id).id
auth.signIn("student", "self-join")
actions.joinClass("SELF323")
actions.joinGroup(group.id)
assert.throws(() => actions.joinGroup("self-open-group"))
assert.throws(() => actions.registerProject(group.id, "Not leader", "scope"))
assert.throws(() => actions.removeMember(group.id, "self-create"))
assert.throws(() => actions.decideRegistration(regId, "approved", ""))
auth.signIn("supervisor")
assert.throws(() => actions.decideRegistration(regId, "changesRequested", ""))
actions.decideRegistration(regId, "changesRequested", "Clarify scope")
auth.signIn("student", "self-create")
actions.removeMember(group.id, "self-join")
assert.throws(() => actions.removeMember(group.id, "self-create"))
actions.registerProject(group.id, "Revised project", "Clarified scope")
auth.signIn("supervisor")
actions.decideRegistration(regId, "approved", "Approved scope")
const project = get().projects.find((p) => p.registrationId === regId)
assert.ok(project)
assert.equal(get().groups.find((g) => g.id === group.id).projectId, project.id)
const ctx = resolveProjectAcademicContext(project, get())
assert.deepEqual(ctx.labs, ctx.offering.labs)
assert.equal(ctx.ruleSet.value.id, ctx.offering.ruleSetId)
auth.signIn("student", "self-create")
assert.throws(() =>
  actions.registerProject(group.id, "Second project", "scope"),
)
assert.throws(() => actions.removeMember(group.id, "self-join"))
assert.deepEqual(
  get().projects.filter((p) => before.some((old) => old.id === p.id)),
  before,
  "old projects untouched",
)
const doc = ctx.labs[0].items[0]
const review = {
  id: "self-test-review",
  documentId: doc.id,
  projectId: project.id,
  semesterId: ctx.semester.id,
  courseId: ctx.course.id,
  classId: ctx.cls.id,
  groupId: group.id,
  classCode: ctx.cls.code,
  groupName: group.name,
  projectName: project.name,
  documentTitle: doc.title,
  version: "v1",
  fileName: "persona.pdf",
  fileType: "PDF",
  pageCount: 1,
  submitter: "Lê Mai Linh",
  submittedAt: "",
  requestedAt: "",
  requestedTs: Date.now(),
  documentStatus: "submitted",
  aiStatus: "notRun",
  ai: { errors: 0, warnings: 0, suggestions: 0 },
  supervisorStatus: "waiting",
}
reviewActions.submitFirstVersion({
  review,
  version: "v1",
  fileName: "persona.pdf",
  fileType: "PDF",
  fileSize: 100,
  pageCount: 1,
})
assert.ok(getReviewState().versions.some((v) => v.reviewId === review.id))
update((s) => ({
  registrations: s.registrations.map((r) =>
    r.id === regId ? { ...r, status: "rejected" } : r,
  ),
}))
assert.throws(() =>
  reviewActions.submitFirstVersion({
    review: { ...review, id: "forbidden", documentId: "another" },
    version: "v1",
    fileName: "persona.pdf",
    fileType: "PDF",
    fileSize: 100,
    pageCount: 1,
  }),
)
// Legacy approval flags cannot reintroduce a pending enrollment path.
update((s) => ({
  classes: s.classes.map((c) =>
    c.id === "self-service-class"
      ? { ...c, requireApproval: true, joinCode: "APPROVAL" }
      : c,
  ),
  students: [
    ...s.students,
    {
      id: "waiting-student",
      name: "Waiting",
      initials: "W",
      email: "waiting@test",
      studentCode: "W",
      classId: "",
    },
  ],
}))
auth.signIn("student", "waiting-student")
actions.joinClass("APPROVAL")
assert.ok(!get().joinRequests.some((j) => j.studentId === "waiting-student"))
assert.ok(actions.enrolled(get().students.find(st => st.id === "waiting-student"), "self-service-class"))
assert.ok(actions.createGroup("self-service-class", "Enrolled immediately"))
auth.signIn("student", "self-leader")
actions.registerProject("self-open-group", "Rejected scope", "scope")
const rejected = get().registrations.find(
  (r) => r.groupId === "self-open-group",
)
auth.signIn("supervisor")
actions.decideRegistration(rejected.id, "rejected", "Not suitable")
assert.ok(!get().projects.some((p) => p.groupId === "self-open-group"))
console.log(
  "PASS self-service: enrollment, group uniqueness, leader permissions, registration revision/rejection/approval, inherited config, upload gate, legacy data preservation",
)

// Per-class uniqueness allows membership in a different class without overwriting the first.
auth.signIn("student", "self-join")
const otherClass = {
  ...get().classes.find((c) => c.id === "self-service-class"),
  id: "second-class",
  joinCode: "SECOND",
  requireApproval: false,
  studentCount: 0,
}
update((s) => ({ classes: [...s.classes, otherClass] }))
actions.joinClass("SECOND")
const second = actions.createGroup("second-class", "Second class group")
assert.ok(
  get()
    .groups.find((g) => g.id === second.id)
    .memberIds.includes("self-join"),
)
assert.equal(
  get().students.find((s) => s.id === "self-join").classId,
  "self-service-class",
)
console.log("PASS per-class enrollment and group membership isolation")
