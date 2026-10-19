import assert from "node:assert/strict"
import { register } from "node:module"
register("./self-service-loader.mjs",import.meta.url)
const storage=new Map()
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}
const {mockEvaluation,currentIllustration,personaTemplate,newCriterion}=await import("../src/lib/rubric.ts")
const {documentSample}=await import("../src/data/documentSamples.ts")
const {demoRules}=await import("../src/data/demoSeed.ts")
const {getReviewState}=await import("../src/data/reviewStore.ts")
const {studentPrecheck}=await import("../src/lib/studentPrecheck.ts")
const stored=JSON.stringify(getReviewState())
const run=(rule,title,id="test",version="v1")=>({id,reviewId:"",documentId:"",documentVersionId:"",documentVersion:version,ruleSetId:rule.id,ruleSetVersion:1,ruleSnapshot:rule,evaluationStatus:"loading",criterionResults:[],overallScore:null,maxScore:0,findings:[],createdAt:"test"})
for(const title of ["SRS","SDS","Detailed Design","Persona","Use Case Diagram","Sequence Diagram","Activity Diagram","State Diagram"]){
 const sample=documentSample(title)
 const existing=demoRules.find(r=>r.documentType===title)
 const rule=existing??{...structuredClone(personaTemplate),documentType:title,scoringMode:"weighted",criteria:Array.from({length:5},(_,i)=>({...newCriterion(`REVIEW0${i+1}`),name:`Tiêu chí ${i+1}`,maxScore:20}))}
 const original=JSON.stringify(rule)
 const result=mockEvaluation(run(rule,title),title)
 assert.ok(result.findings.length,title)
 for(const f of result.findings){assert.ok(f.issue);assert.ok(f.suggestion);assert.ok(f.maxScore);assert.ok(f.message.length<180)}
 for(const c of result.criterionResults){if(c.score!==null)assert.ok(sample.checks.some(s=>c.evidence.includes(s.text)));assert.ok(c.score===null || c.score>=0&&c.score<=c.maxScore)}
 assert.equal(result.maxScore,result.criterionResults.reduce((n,c)=>n+c.maxScore,0))
 assert.equal(JSON.stringify(rule),original)
 const rerun=mockEvaluation(run(rule,title,"other","v7"),title)
 assert.deepEqual(result.criterionResults,rerun.criterionResults)
 const pre=await studentPrecheck(rule,new AbortController().signal,title)
 assert.deepEqual(result.criterionResults,pre.criterionResults)
 assert.ok(!/mô phỏng|mock data|prototype|chưa xác minh trích đoạn/i.test(JSON.stringify(result.criterionResults)))
 if(title==="SRS"){assert.ok(result.findings.some(f=>f.issue.includes("nhanh")));assert.equal(result.criterionResults[2].score,10)}
}
const manual={...structuredClone(personaTemplate),criteria:[{...newCriterion("CUSTOM"),name:"Chấm thuyết trình trực tiếp",aiEnabled:false}]}
const result=mockEvaluation(run(manual,"Persona"),"Persona")
assert.equal(result.overallScore,null);assert.equal(result.findings.length,0)
const old={...run(personaTemplate,"Persona"),evaluationStatus:"completed",criterionResults:[{criterionId:"P01",name:"old",maxScore:10,score:5,evidence:"old",needsVerification:true,suggestions:["Gợi ý mô phỏng: old"]}]}
const before=JSON.stringify(old);assert.equal(currentIllustration(old,"Persona").illustrationVersion,1);assert.equal(JSON.stringify(old),before)
assert.equal(JSON.stringify(getReviewState()),stored)
console.log("PASS fixed document scenarios, matching sample excerpts, role parity, deterministic scores, unchanged rubric/snapshots/history/store, manual/custom criterion safety, legacy presentation without writes")
