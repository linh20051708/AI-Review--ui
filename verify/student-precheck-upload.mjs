import fs from "node:fs"
import ts from "typescript"
import assert from "node:assert/strict"
const source=fs.readFileSync("src/pages/student/StudentUploadPage.tsx","utf8")
const ast=ts.createSourceFile("upload.tsx",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
let submit,onFile
function visit(n){if(ts.isVariableDeclaration(n)){if(n.name.getText(ast)==="submit")submit=n.initializer.getText(ast);if(n.name.getText(ast)==="onFile")onFile=n.initializer.getText(ast)}ts.forEachChild(n,visit)}visit(ast)
let scheduled=0
const names=["file","student","submitting","locked","approved","rejected","awaiting","precheckEnabled","precheckReady","setSubmitting","window"]
const body=ts.transpile(`return (${submit})`,{target:ts.ScriptTarget.ES2022})
function check(ready,enabled=true,locked=false){new Function(...names,body)({}, {},false,locked,false,false,false,enabled,ready,()=>{}, {setTimeout:()=>scheduled++})()}
check(false);assert.equal(scheduled,0)
check(true);assert.equal(scheduled,1)
check(true,true,true);assert.equal(scheduled,1)
check(false,false);assert.equal(scheduled,2)
let ready=true,selection=0,pending=true
const onBody=ts.transpile(`return (${onFile})`,{target:ts.ScriptTarget.ES2022})
new Function("setError","setFile","setChecked","setSelection","setPending","allowed","maxBytes","maxSizeMB",onBody)(()=>{},()=>{},v=>ready=v,v=>selection=v(selection),v=>pending=v,["pdf"],1000,1)({target:{files:[{name:"other.pdf",size:10}]}})
assert.equal(ready,null);assert.equal(selection,1);assert.equal(pending,false)
console.log("PASS actual upload handlers: precheck blocks submit scheduling, completion enables confirmation submission, dependency remains blocked, AI-disabled flow retained, file replacement clears readiness and confirmation")
