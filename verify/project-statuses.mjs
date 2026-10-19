import assert from "node:assert/strict"
import { register } from "node:module"
register("./self-service-loader.mjs",import.meta.url)
const storage=new Map()
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}
const {getManagementState}=await import("../src/data/managementStore.ts")
const {seedProjectStatuses,archivedSampleProjectIds,projectStateMeta}=await import("../src/data/projectStatuses.ts")
const {projects:baseline,reviewRequests}=await import("../src/data/mockData.ts")
const {projectRecords,projectStatusLabels}=await import("../src/data/filterRecords.ts")
const {facetOptions,filterRecords,prune}=await import("../src/lib/smartFilter.ts")
const state=getManagementState()
assert.equal(state.projects.length,14)
assert.equal(state.projects.filter(p=>p.state==="active").length,12)
assert.equal(state.projects.filter(p=>p.state==="archived").length,2)
assert.deepEqual(Object.keys(projectStateMeta),["active","archived"])
assert.equal(projectStatusLabels.active,projectStateMeta.active.label)
const protectedIds=["smart-campus-management","smart-attendance-system","hospital-management-system","student-services-portal","demo-ready-project"]
assert.ok(protectedIds.every(id=>state.projects.find(p=>p.id===id)?.state==="active"))
const old={...state,projectStatusSeedVersion:undefined,projects:state.projects.map(p=>({...p,state:"active"}))}
const original=JSON.stringify(old)
const seeded=seedProjectStatuses(old,baseline,reviewRequests)
assert.equal(seeded.projects.filter(p=>p.state==="archived").length,2)
assert.equal(JSON.stringify(old),original)
for(const p of seeded.projects){const before=old.projects.find(b=>b.id===p.id);assert.deepEqual({...p,state:before.state},before)}
assert.equal(seedProjectStatuses(seeded,baseline,reviewRequests),seeded)
const restored={...seeded,projects:seeded.projects.map(p=>({...p,state:"active"}))}
assert.equal(seedProjectStatuses(restored,baseline,reviewRequests),restored)
const target=archivedSampleProjectIds[0]
for(const supervisorStatus of ["waiting","inReview","needsRevision"]){
 const busy=seedProjectStatuses(old,baseline,[...reviewRequests,{id:"ongoing",projectId:target,supervisorStatus}])
 assert.equal(busy.projects.find(p=>p.id===target).state,"active")
}
const edited={...old,projects:old.projects.map(p=>p.id===target?{...p,name:"User edited title"}:p)}
assert.equal(seedProjectStatuses(edited,baseline,reviewRequests).projects.find(p=>p.id===target).state,"active")
assert.equal(seedProjectStatuses(old,baseline,undefined),old)
const custom={...old,projects:[...old.projects,{...old.projects[0],id:"user-project"}]}
assert.equal(seedProjectStatuses(custom,baseline,reviewRequests).projects.find(p=>p.id==="user-project").state,"active")
const records=projectRecords(state.projects,state.groups,state.classes)
for(const cls of [undefined,...state.classes.map(c=>c.id)]){
 const s={facets:cls?{class:[cls]}:{},q:""}
 const opts=facetOptions(records,s,"status",Object.keys(projectStateMeta))
 assert.equal(opts.length,2)
 for(const opt of opts){assert.equal(opt.count,filterRecords(records,{...s,facets:{...s.facets,status:[opt.value]}}).length)}
 const both=filterRecords(records,{...s,facets:{...s.facets,status:["active","archived"]}})
 assert.equal(both.length,filterRecords(records,s).length)
}
const zero={facets:{class:["se1702"],status:["archived"]},q:""}
assert.equal(filterRecords(records,prune(records,zero)).length,0)
const opts=facetOptions(records,zero,"status",Object.keys(projectStateMeta))
assert.equal(opts.find(o=>o.value==="archived").count,0)
assert.equal(filterRecords(records,{facets:{},q:""}).length,14)
console.log("PASS 14 seed projects: 12 active / 2 archived; valid lifecycle only; protected demos; idempotent guarded migration; edited/custom projects retained; live review/revision protected; Class + multi-status counts incl zero; reset; no source mutation")
