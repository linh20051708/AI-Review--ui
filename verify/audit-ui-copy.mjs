import ts from 'typescript'
import fs from 'node:fs'
import path from 'node:path'
const words = /\b(project|review|dashboard|feedback|history|version|deadline|supervisor|workspace|upload|download|pending|active|draft|evidence|evaluation|finding|rule set|login|logout|search|filter|major|minor|critical|file|demo|reset)\b/i
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name)
    if(entry.isDirectory()) { walk(file); continue }
    if(!/\.tsx?$/.test(file)) continue
    const source = fs.readFileSync(file,'utf8')
    const ast = ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS)
    function visit(n) {
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n) || ts.isJsxText(n)) {
        const value = n.text
        if (words.test(value) && !/[\n]/.test(value) && !/^(?:@|\.\.?\/|\/|project-review:)/.test(value)) {
          const p = n.parent
          const uiProperty = (ts.isPropertyAssignment(p) && /^(label|title|description|placeholder|message|detail|summary|name|role|noun|statusTitle|text|nextStep|meta)$/.test(p.name.getText(ast))) || (ts.isJsxAttribute(p) && !/^(id|className|to|href|value|key|viewKey|role|type)$/.test(p.name.getText(ast)))
          if(ts.isJsxText(n) || uiProperty || /[\u00c0-\u1eff\s]/.test(value)) console.log(`${file}:${ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1}\t${JSON.stringify(value)}`)
        }
      }
      ts.forEachChild(n,visit)
    }
    visit(ast)
  }
}
walk('src')
