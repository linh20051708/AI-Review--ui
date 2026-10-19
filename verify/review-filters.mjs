import assert from "node:assert/strict"
import {register} from "node:module"
register("./self-service-loader.mjs",import.meta.url)
const {facetOptions,filterRecords,prune,restoreReviewView}=await import("../src/lib/smartFilter.ts")
const {requestRecords,projectRecords,reviewStatusLabels}=await import("../src/data/filterRecords.ts")
const records=[
 {class:"A",lab:"A::1",labItem:"A::srs",docType:"SRS",group:"a1",status:"waiting",documentStatus:"submitted",text:"alpha",evaluationStatus:"notRun"},
 {class:"A",lab:"A::1",labItem:"A::srs",docType:"SRS",group:"a2",status:"approved",documentStatus:"resubmitted",text:"alpha",evaluationStatus:"completed"},
 {class:"A",lab:"A::2",labItem:"A::sds",docType:"SDS",group:"a1",status:"needsRevision",documentStatus:"submitted",text:"beta",evaluationStatus:"error"},
 {class:"B",lab:"B::1",labItem:"B::persona",docType:"Persona",group:"b1",status:"inReview",documentStatus:"submitted",text:"gamma",evaluationStatus:"loading"}
]
const state=facets=>({facets,q:""})
let s=state({class:["A"]})
assert.deepEqual(facetOptions(records,s,"lab").map(o=>o.value),["A::1","A::2"])
s=prune(records,state({class:["A"],lab:["A::1"],labItem:["A::srs"]}))
assert.equal(filterRecords(records,s).length,2)
assert.deepEqual(facetOptions(records,s,"class").map(o=>o.value),["A","B"])
s=prune(records,{...s,facets:{...s.facets,class:["B"]}})
assert.deepEqual(s.facets.class,["B"]);assert.deepEqual(s.facets.lab,[]);assert.deepEqual(s.facets.labItem,[])
assert.deepEqual(facetOptions(records,s,"labItem").map(o=>o.value),["B::persona"])
s=prune(records,state({class:["A"],lab:["A::2"],labItem:["A::srs"],group:["a2"]}))
assert.deepEqual(s.facets.class,["A"]);assert.deepEqual(s.facets.lab,["A::2"]);assert.deepEqual(s.facets.labItem,[]);assert.deepEqual(s.facets.group,[])
s=prune(records,state({class:["A"],lab:["A::1"],labItem:["A::srs"],status:["inReview"]}))
assert.deepEqual(s.facets.labItem,["A::srs"]);assert.equal(filterRecords(records,s).length,0)
s=prune(records,{...s,facets:{...s.facets,status:[]}});assert.equal(filterRecords(records,s).length,2)
for(const key of ["labItem","lab","class"]){s=prune(records,{...s,facets:{...s.facets,[key]:[]}});assert.ok(filterRecords(records,s).length>=2)}
for(const test of [state({}),state({class:["A"]}),state({class:["A"],lab:["A::1"]}),state({status:["approved"]}),{...state({class:["A"]}),q:"alpha"}]){
 for(const key of ["class","lab","labItem","status","documentStatus","evaluationStatus"]){
  for(const o of facetOptions(records,test,key))assert.equal(o.count,filterRecords(records,prune(records,{...test,facets:{...test.facets,[key]:[o.value]}})).length)
 }
}
assert.equal(filterRecords(records,{facets:{},q:""}).length,4)
assert.equal(filterRecords(records,{facets:{},q:"alpha"}).length,2)
assert.deepEqual(restoreReviewView(state({status:["done","resubmitted"]}),true).facets.legacyReviewStatus,["done","resubmitted"])
assert.deepEqual(restoreReviewView(state({status:["approved"]}),false).facets.status,["approved"])
const cls=[{id:"A",offeringId:"oa"},{id:"B",offeringId:"ob",labOverride:[{code:"Override",items:[{id:"b",title:"Persona"}]}]}]
const offerings=[{id:"oa",labs:[{code:"Lab 1",items:[{id:"a",title:"SRS"},{id:"other",title:"SRS"}]}]},{id:"ob",labs:[{code:"Hidden",items:[{id:"hidden",title:"Persona"}]}]}]
const base={id:"r",classId:"A",documentId:"other",documentTitle:"SRS",supervisorStatus:"notAccepted",documentStatus:"resubmitted",aiStatus:"notRun",ai:{errors:0,warnings:0,suggestions:0},projectName:"P",submitter:"S",classCode:"A",groupName:"G",version:"v2"}
const source=[base,{...base,id:"b",classId:"B",documentId:"b",documentTitle:"Persona",supervisorStatus:"approved"}]
const original=JSON.stringify(source)
const built=requestRecords(source,cls,offerings,[{reviewId:"r",documentId:"other",documentVersion:"v1",evaluationStatus:"completed"},{reviewId:"r",documentId:"other",documentVersion:"v2",evaluationStatus:"error"}])
assert.equal(built[0].labItem,"A::other::SRS");assert.equal(built[0].status,"notAccepted");assert.equal(built[0].documentStatus,"resubmitted");assert.equal(built[0].evaluationStatus,"error");assert.equal(built[0].ai,"notRun")
assert.equal(built[1].lab,"B::Override");assert.equal(built[1].status,"approved")
assert.deepEqual(Object.keys(reviewStatusLabels),["waiting","inReview","needsRevision","approved","notAccepted"])
const variants=["waiting","inReview","needsRevision","approved","notAccepted"].flatMap(supervisorStatus=>["submitted","resubmitted"].map(documentStatus=>({...base,id:`${supervisorStatus}-${documentStatus}`,supervisorStatus,documentStatus})))
const compatible=requestRecords(variants,cls,offerings)
for(const selected of [["waiting"],["resubmitted"],["done"],["waiting","resubmitted"],["resubmitted","inReview"]]){
 const restored=restoreReviewView(state({status:selected}),true)
 assert.deepEqual(filterRecords(compatible,restored).map(r=>r.item.id),compatible.filter(r=>selected.includes(r.legacyReviewStatus)).map(r=>r.item.id))
}
assert.equal(filterRecords(records,state({group:["a1"]})).length,2)
const projectRecord=projectRecords([{id:"p",groupId:"g",state:"active",name:"Project",description:""}],[{id:"g",classId:"A"}],cls)[0]
assert.equal(projectRecord.status,"active")
assert.equal(JSON.stringify(source),original)
console.log("PASS Class → Lab → Document cascade, parent replacement/unselect, scoped options, child pruning, independent statuses, counts, search, reset, saved legacy views, class overrides and exact documentId/version mapping; source data unchanged")
