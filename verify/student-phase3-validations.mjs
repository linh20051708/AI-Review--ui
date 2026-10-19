import assert from "node:assert/strict"
import fs from "node:fs"
import ts from "typescript"
const source=fs.readFileSync("src/pages/student/StudentUploadPage.tsx","utf8")
const ast=ts.createSourceFile("StudentUploadPage.tsx",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
let handler
function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==="onFile")handler=n.initializer.getText(ast);ts.forEachChild(n,visit)}visit(ast)
assert.ok(handler)
const body=ts.transpile(`const onFile = ${handler}; return onFile`,{target:ts.ScriptTarget.ES2022})
let error="",file
const onFile=new Function("allowed","maxBytes","maxSizeMB","setError","setFile","setChecked","setSelection","setPending",body)(["pdf"],1024,1,v=>error=v,v=>file=v,()=>{},()=>{},()=>{})
onFile({target:{files:[{name:"wrong.docx",size:10}]}});assert.match(error,/PDF/);assert.equal(file,null)
onFile({target:{files:[{name:"empty.pdf",size:0}]}});assert.match(error,/File rỗng/)
onFile({target:{files:[{name:"large.pdf",size:1025}]}});assert.match(error,/vượt quá/)
const valid={name:"accepted.pdf",size:100};onFile({target:{files:[valid]}});assert.equal(file,valid);assert.equal(error,"")
onFile({target:{files:[]}});assert.equal(file,null);assert.equal(error,"")
console.log("PASS actual upload onFile handler: configured extension, empty file, size limit, valid file, cancel clears selection. This is a source-handler test, not browser file-picker E2E.")
