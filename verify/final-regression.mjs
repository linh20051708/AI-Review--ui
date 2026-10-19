import assert from "node:assert/strict"
import {register} from "node:module"
register("./self-service-loader.mjs",import.meta.url)
const storage=new Map()
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}
const auth=await import("../src/app/auth.ts")
const {getManagementState:get,updateManagement:update,saveRuleSet}=await import("../src/data/managementStore.ts")
const {getReviewState:reviews,reviewActions:a,runEvaluation}=await import("../src/data/reviewStore.ts")
const {resolveReviewRule}=await import("../src/lib/rubric.ts")
const {resolveProjectAcademicContext,resolveLabStructure}=await import("../src/lib/config.ts")
const initialProjects=structuredClone(get().projects)
const cfg=get(),baseClass=cfg.classes[0],baseOffering=cfg.offerings.find(o=>o.id===baseClass.offeringId),baseCourse=cfg.courses.find(c=>c.id===baseClass.courseId),baseSemester=cfg.semesters.find(s=>s.id===baseClass.semesterId)
const semester={...baseSemester,id:"phase4-semester",name:"QA Semester",archived:false}
const course={...baseCourse,id:"phase4-course",code:"QA323"}
const offering={...structuredClone(baseOffering),id:"phase4-offering",semesterId:semester.id,courseId:course.id}
const cls={...baseClass,id:"phase4-class",code:"QA4",semesterId:semester.id,courseId:course.id,offeringId:offering.id,projectCount:1,pendingReviews:0,studentCount:0}
const group={...cfg.groups[0],id:"phase4-group",classId:cls.id,projectId:"phase4-project",memberIds:[]}
const project={...cfg.projects[0],id:"phase4-project",groupId:group.id,members:[],registrationId:undefined,state:"active"}
update(s=>({semesters:[...s.semesters,semester],courses:[...s.courses,course],offerings:[...s.offerings,offering],classes:[...s.classes,cls],groups:[...s.groups,group],projects:[...s.projects,project]}))
const linked=resolveProjectAcademicContext(project,get())
assert.equal(linked.semester.id,semester.id);assert.equal(linked.course.id,course.id);assert.equal(linked.offering.id,offering.id);assert.equal(linked.cls.id,cls.id);assert.equal(linked.group.id,group.id)
auth.signIn("supervisor")
const r=reviews().requests.find(r=>r.id==="review-001")
const originalRule=resolveReviewRule(r,get())
const academic=structuredClone(get()),academicClass=academic.classes.find(c=>c.id===r.classId),academicOffering=academic.offerings.find(o=>o.id===academicClass.offeringId)
for(const id of ["qa-offer","qa-class","qa-item"])academic.ruleSets.push({...structuredClone(originalRule),id,name:id})
academicOffering.ruleSetId="qa-offer";academicClass.ruleSetOverride="qa-class"
academicClass.labOverride=structuredClone(resolveLabStructure(academicClass,academicOffering))
const labItem=academicClass.labOverride.flatMap(l=>l.items).find(i=>i.id===r.documentId)
assert.ok(labItem);labItem.ruleSetId="qa-item"
assert.equal(resolveReviewRule({...r,ruleSnapshot:undefined},academic).id,"qa-item")
delete labItem.ruleSetId;assert.equal(resolveReviewRule({...r,ruleSnapshot:undefined},academic).id,"qa-class")
delete academicClass.ruleSetOverride;assert.equal(resolveReviewRule({...r,ruleSnapshot:undefined},academic).id,"qa-offer")
assert.equal(resolveReviewRule({...r,ruleSnapshot:originalRule},academic).id,originalRule.id)
a.startReview(r.id);await runEvaluation(r.id)
const frozen=structuredClone(reviews().requests.find(x=>x.id===r.id).ruleSnapshot)
const oldEvaluation=structuredClone(reviews().evaluations.find(e=>e.reviewId===r.id))
const saved=saveRuleSet({...structuredClone(originalRule),name:"QA edited rule"})
assert.ok(saved.version>frozen.version)
assert.deepEqual(reviews().requests.find(x=>x.id===r.id).ruleSnapshot,frozen)
const selected=a.addFeedback({reviewId:r.id,version:r.version,severity:"Major",category:"Other",message:"Publish this evidence request"})
const privateDraft=a.addFeedback({reviewId:r.id,version:r.version,severity:"Minor",category:"Other",message:"Private draft"})
a.decide(r.id,"needsRevision","Revise evidence",[selected])
assert.equal(reviews().feedback.find(f=>f.id===selected).official,true)
assert.equal(reviews().feedback.find(f=>f.id===privateDraft).official,false)
const member=get().students.find(s=>s.groupId===r.groupId)
auth.signIn("student",member?.id)
a.submitVersion({reviewId:r.id,version:"v3",fileName:"qa-v3.pdf",fileType:"PDF",fileSize:100,pageCount:3,submitter:member?.name??"QA Student"})
assert.equal(reviews().requests.find(x=>x.id===r.id).ruleSnapshot.version,saved.version)
assert.deepEqual(reviews().evaluations.find(e=>e.id===oldEvaluation.id),oldEvaluation)
auth.signIn("supervisor")
const rejected=reviews().requests.find(x=>x.id==="review-002")
assert.throws(()=>a.decide(rejected.id,"notAccepted",""),/lý do/)
a.decide(rejected.id,"notAccepted","Wrong document type")
assert.equal(reviews().requests.find(x=>x.id===rejected.id).supervisorStatus,"notAccepted")
a.decide(rejected.id,"approved")
assert.equal(reviews().requests.find(x=>x.id===rejected.id).supervisorStatus,"notAccepted")
assert.deepEqual(get().projects.filter(p=>initialProjects.some(old=>old.id===p.id)),initialProjects)
console.log("PASS isolated academic relationship chain; Lab Item → Class → Offering priority; rule edits/new-version snapshot; historical evaluation immutable; selected official feedback vs private draft; reason required for Reject; completed decisions locked; original projects unchanged")

