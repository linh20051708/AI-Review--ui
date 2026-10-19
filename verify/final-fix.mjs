import assert from "node:assert/strict"
import { register } from "node:module"
register("./self-service-loader.mjs", import.meta.url)
const { reviewAI, evaluationForReview, compareReviewAI } = await import("../src/lib/reviewPresentation.ts")
const { requestRecords } = await import("../src/data/filterRecords.ts")
const review = { id: "r", documentId: "srs", version: "v2", aiStatus: "aiReviewed", ai: {errors:9,warnings:8,suggestions:7}, documentTitle:"SRS", projectName:"P", submitter:"S",classCode:"C",groupName:"G" }
const run = { id:"e",reviewId:"r",documentId:"srs",documentVersion:"v2",evaluationStatus:"completed",illustrationVersion:1,findings:[{level:"error"},{level:"warning"}],criterionResults:[{suggestions:["Fix A","Fix B"]}],overallScore:60,maxScore:100 }
const data = [review, run]
const original = JSON.stringify(data)
assert.equal(reviewAI(review, []).counts, undefined)
assert.equal(requestRecords([review], [], [])[0].evaluationStatus,"notRun")
assert.equal(requestRecords([review], [], [])[0].ai,"notRun")
for (const other of [{...run,reviewId:"other"},{...run,documentId:"other"},{...run,documentVersion:"v1"}]) {
  assert.equal(evaluationForReview(review,[other]),undefined)
  assert.equal(reviewAI(review,[other]).counts,undefined)
}
assert.deepEqual(reviewAI(review,[run]).counts,{errors:1,warnings:1,suggestions:2})
assert.equal(requestRecords([review],[],[],[run])[0].ai,"hasErrors")
for (const evaluationStatus of ["loading","error"]) {
  const result = reviewAI(review,[run,{...run,id:"retry",evaluationStatus}])
  assert.equal(result.status,evaluationStatus)
  assert.equal(result.counts,undefined,"Never leak a previous run or cached request counts during retry/error")
}
const clean = {...run,findings:[],criterionResults:[]}
assert.deepEqual(reviewAI(review,[clean]).counts,{errors:0,warnings:0,suggestions:0})
assert.equal(requestRecords([review],[],[],[clean])[0].ai,"clean")
assert.ok(compareReviewAI(review,{...review,id:"legacy"},[clean])<0,"Completed zero-error runs sort ahead of legacy-only counters")
assert.equal(JSON.stringify(data),original,"Presentation must not change requests/evaluations")
console.log("PASS evaluation-backed queue/filter summary: no legacy-only counts; exact request/document/version; loading/error/retry; completed and zero findings; immutable source")
