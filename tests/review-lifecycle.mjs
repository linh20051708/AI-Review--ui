import assert from 'node:assert/strict'
import { register } from 'node:module'
register('./ts-loader.mjs', import.meta.url)

// Isolated storage: tests never change the browser's demo data.
const storage = new Map()
globalThis.localStorage = { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: (k) => storage.delete(k) }
const server = { ssrLoadModule: (path) => import(new URL(`..${path}`, import.meta.url)), close: async () => {} }
try {
  const { reviewActions: actions, getReviewState: get, resetReview } = await server.ssrLoadModule('/src/data/reviewStore.ts')
  const { documentsFor, versionsFor } = await server.ssrLoadModule('/src/data/selectors.ts')
  const mock = await server.ssrLoadModule('/src/data/mockData.ts')
  const auth = await server.ssrLoadModule('/src/app/auth.ts')
  const cfg = { classes: mock.classes, offerings: mock.courseOfferings, groups: mock.studentGroups }
  const project = mock.projects.find((p) => p.id === 'smart-campus-management')
  const docs = () => documentsFor(project, get().requests, cfg)
  resetReview()
  const sequence = docs().find((d) => d.title === 'Sequence Diagram')
  const stateDoc = docs().find((d) => d.title === 'State Diagram')
  assert.equal(stateDoc.submissionLocked, true)
  actions.startReview(sequence.reviewId)
  actions.decide(sequence.reviewId, 'approved')
  assert.equal(docs().find((d) => d.id === stateDoc.id).submissionLocked, undefined)
  const otherVersions = get().versions.filter((v) => v.reviewId !== stateDoc.reviewId)
  const input = { reviewId: stateDoc.reviewId, version: 'v2', fileName: 'state-v2.pdf', fileType: 'PDF', fileSize: 1234, pageCount: 6, submitter: 'Nguyễn Minh Anh' }
  actions.submitVersion(input)
  assert.deepEqual(get().versions.filter((v) => v.reviewId !== stateDoc.reviewId), otherVersions)
  assert.throws(() => actions.submitVersion(input))
  assert.equal(docs().find((d) => d.id === stateDoc.id).latestVersion, 'v2')
  const prior = structuredClone(get().versions.find((v) => v.reviewId === stateDoc.reviewId && v.version === 'v1'))
  assert.equal(prior.supervisorStatus, 'needsRevision')
  actions.startReview(stateDoc.reviewId)
  actions.addFeedback({ reviewId: stateDoc.reviewId, version: 'v2', severity: 'Minor', category: 'Nội dung', message: 'Đã sửa đầy đủ.' })
  actions.decide(stateDoc.reviewId, 'approved')
  assert.deepEqual(get().versions.find((v) => v.id === prior.id), prior)
  assert.equal(versionsFor(get().requests.find((r) => r.id === stateDoc.reviewId), get().versions).at(-1).supervisorStatus, 'approved')
  assert.equal(get().feedback.at(-1).official, true)
  assert.equal(docs().find((d) => d.title === 'SRS').submissionLocked, undefined)
  const srs = docs().find((d) => d.title === 'SRS')
  const review = mock.buildReviewRequest({ id: 'test-srs', projectId: project.id, documentId: srs.id, documentTitle: srs.title, version: 'v1', submitter: 'Nguyễn Minh Anh', submittedAt: '14/10/2026 · 10:00', requestedAt: '14/10/2026 · 10:00', documentStatus: 'submitted', aiStatus: 'aiReviewed', ai: { errors: 1, warnings: 2, suggestions: 1 }, supervisorStatus: 'waiting' })
  const first = { review, version: 'v1', fileName: 'srs.docx', fileType: 'DOCX', pageCount: 8 }
  actions.submitFirstVersion(first)
  assert.throws(() => actions.submitFirstVersion({ ...first, review: { ...review, id: 'duplicate' } }))
  actions.startReview(review.id)
  actions.decide(review.id, 'needsRevision', 'Bổ sung yêu cầu chức năng.')
  actions.submitVersion({ ...input, reviewId: review.id, fileName: 'srs-v2.docx', fileType: 'DOCX' })
  actions.startReview(review.id)
  actions.decide(review.id, 'approved')
  assert.equal(docs().find((d) => d.id === srs.id).supervisorStatus, 'approved')
  const renamed = { ...cfg, offerings: cfg.offerings.map((o) => ({ ...o, labs: o.labs.map((l) => ({ ...l, items: l.items.map((i) => i.id === srs.id ? { ...i, title: 'Renamed SRS' } : i) })) })) }
  assert.equal(documentsFor(project, get().requests, renamed).find((d) => d.id === srs.id).reviewId, review.id)
  auth.signIn('student'); assert.equal(auth.currentRole(), 'student')
  auth.signOut(); assert.equal(auth.isAuthenticated(), false)
  auth.signIn('supervisor'); assert.equal(auth.currentRole(), 'supervisor')
  assert.ok(JSON.parse(storage.get('project-review:review:v1')).requests.some((r) => r.id === review.id && r.supervisorStatus === 'approved'))
  console.log('PASS: shared v1 → revision → v2 → approval; immutable/unrelated history; duplicate guards; dependencies; stable IDs; persistence; role session.')
} finally { await server.close() }
