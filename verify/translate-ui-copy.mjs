import ts from 'typescript'
import fs from 'node:fs'
import path from 'node:path'
const terms = [
  ['Project Review', 'SRS Review AI'], ['My Project', 'Dự án của tôi'],
  ['Supervisor Approval Required', 'Giảng viên bắt buộc phê duyệt'],
  ['Supervisor Review', 'Giảng viên đánh giá'], ['AI Evaluation', 'Đánh giá AI'], ['AI Review', 'Đánh giá AI'],
  ['Evidence Required', 'Bắt buộc có bằng chứng'], ['Evaluation Instruction', 'Hướng dẫn đánh giá'], ['Evidence Requirement', 'Yêu cầu bằng chứng'],
  ['Rule Set', 'Bộ quy tắc'], ['Open Review', 'Mở đánh giá'],
  ['Project', 'Dự án'], ['Review', 'Đánh giá'], ['Feedback', 'Phản hồi'], ['History', 'Lịch sử'], ['Version', 'Phiên bản'],
  ['Dashboard', 'Tổng quan'], ['Deadline', 'Hạn nộp'], ['Supervisor', 'Giảng viên'], ['Student', 'Sinh viên'],
  ['Evidence', 'Bằng chứng'], ['Upload', 'Tải lên'], ['Download', 'Tải xuống'], ['File', 'Tệp'],
  ['Active', 'Đang áp dụng'], ['Draft', 'Bản nháp'], ['Critical', 'Nghiêm trọng'],
]
function translate(value) {
  if (/Project-based Learning/.test(value)) return value // Persisted teaching-method enum.
  for (const [en,vi] of terms) value = value.replace(new RegExp(`\\b${en}\\b`,'gi'), match => match === match.toUpperCase() ? vi.toUpperCase() : match[0] === match[0].toLowerCase() ? vi[0].toLowerCase()+vi.slice(1) : vi)
  return value
}
const changed=[]
function walk(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,entry.name)
    if(entry.isDirectory()){walk(file);continue}
    if(!/\.tsx?$/.test(file) || /types[\\/]|documentSamples\.ts|demoSeed\.ts|selfServiceSeed\.ts/.test(file))continue
    const source=fs.readFileSync(file,'utf8'), edits=[]
    const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS)
    function visit(n) {
      if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)||ts.isTemplateHead(n)||ts.isTemplateMiddle(n)||ts.isTemplateTail(n)||ts.isJsxText(n)){
        const value=n.text, p=n.parent
        const uiProperty=ts.isPropertyAssignment(p)&&/^(label|title|description|placeholder|message|detail|summary|role|noun|statusTitle|text|nextStep|meta)$/.test(p.name.getText(ast))
        const uiAttr=ts.isJsxAttribute(p)&&/^(label|title|description|placeholder|aria-label|eyebrow|noun|statusTitle|statusGroup|searchPlaceholder|confirmLabel|linkLabel)$/.test(p.name.getText(ast))
        const humanPhrase=/[\u00c0-\u1eff]/.test(value)||/^(?:AI Review|AI Evaluation|My Project|Project Review|Deadline|Version|Feedback|Review|Evidence)(?:\s|$)/.test(value)
        // Never translate paths, identifiers, CSS, enums, or metadata keys.
        const technical=ts.isImportDeclaration(p)||ts.isLiteralTypeNode(p)||ts.isElementAccessExpression(p)||ts.isPropertyAssignment(p)&&p.name===n||ts.isJsxAttribute(p)&&!uiAttr||/^(?:@|\.\.?\/|\/|project-review:)/.test(value)||/\b(?:min-h-|bg-|text-|flex |grid |rounded-|gap-)\b/.test(value)
        if(!technical&&(ts.isJsxText(n)||uiProperty||uiAttr||humanPhrase)) {
          const start=n.getStart(ast), end=n.getEnd(), raw=source.slice(start,end)
          const translated=translate(raw)
          if(translated!==raw)edits.push({start,end,text:translated})
        }
      }
      ts.forEachChild(n,visit)
    }
    visit(ast)
    if(edits.length){let result=source;for(const e of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,e.start)+e.text+result.slice(e.end);fs.writeFileSync(file,result);changed.push([file,edits.length])}
  }
}
walk('src')
console.log(JSON.stringify(changed,null,2))
