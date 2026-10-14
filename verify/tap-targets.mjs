#!/usr/bin/env node
/**
 * verify/tap-targets.mjs — đo vùng chạm thật của app nền React (Chuẩn chung C4).
 *
 * Vì sao cần script này: `facts/MEASUREMENTS.md` §3 từng đo bằng một script tạm ở /tmp
 * và script đó đã mất, nên không ai chạy lại được. Script này nằm trong repo để số đo
 * tái lập được, và để chứng minh bản vá có tác dụng thật chứ không chỉ nói suông.
 *
 * Dùng thật (đo bằng getBoundingClientRect trên trình duyệt thật):
 *   cd app && npm run preview -- --port 4173 &
 *   node verify/tap-targets.mjs http://127.0.0.1:4173
 *
 * Ngưỡng: 48×48 CSS px (Chuẩn chung C4 — Material 3 nói 48dp; WCAG 2.5.8 nói 24px là sàn).
 * Lưu ý: 1 CSS px ở đây coi như 1 dp vì app đo ở tỉ lệ 1:1, không zoom.
 */

import { createRequire } from "node:module"
import { pathToFileURL } from "node:url"

const BASE = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/$/, "")

// 23 route trong app/src/app/router.tsx (đọc thật, không đoán).
const ROUTES = [
  "/", "/dashboard", "/reviews", "/reviews/new", "/students", "/students/new",
  "/classes", "/groups", "/projects", "/documents", "/notifications", "/profile",
  "/settings", "/rule-sets", "/semesters", "/courses", "/checkpoints", "/rubrics",
  "/analytics", "/reports", "/templates", "/help", "/login",
]

const MIN = 48

const require = createRequire(import.meta.url)
const PW_CACHE = "/Users/lehuytuong/.npm/_npx/420ff84f11983ee5/node_modules/playwright"

let chromium
try {
  ;({ chromium } = require("playwright"))
} catch {
  // Playwright chỉ có trong cache npx trên máy này. Nạp qua index.mjs (ESM thật) —
  // `import()` thẳng index.js trả về object nội bộ, không có .launch().
  const mod = await import(pathToFileURL(`${PW_CACHE}/index.mjs`).href)
  chromium = (mod.default ?? mod).chromium
}
if (!chromium?.launch) {
  console.error("LOI: khong nap duoc playwright (thieu chromium.launch)")
  process.exit(2)
}

// Playwright bản này KHÔNG nhận evaluate() dạng CHUỖI (trả undefined lặng lẽ) —
// phải truyền hàm thật. Đã đo: dạng chuỗi -> undefined, dạng hàm -> số đúng.
const MEASURE = () => {
  const sel = 'button, a, [role=button], input, select, [role=tab], [tabindex]:not([tabindex="-1"])'
  const out = []
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) continue          // ẩn hẳn
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    if (el.disabled) continue
    out.push({
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 42),
      w: Math.round(r.width),
      h: Math.round(r.height),
    })
  }
  return out
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// App chặn sau đăng nhập (app/src/app/auth.ts: localStorage['project-review:session'] === '1').
// Không đặt cờ này thì MỌI route đều chuyển hướng về màn đăng nhập và ta đo nhầm
// đúng 3 target của form login 23 lần — đã mắc đúng lỗi này ở lần đo đầu.
await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" })
await page.evaluate(() => localStorage.setItem("project-review:session", "1"))

let total = 0
let bad = 0
const worst = []

for (const route of ROUTES) {
  let targets = []
  try {
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 20000 })
    await page.waitForTimeout(350)
    targets = await page.evaluate(MEASURE)
  } catch (e) {
    console.log(`${route.padEnd(16)} LỖI TẢI: ${String(e.message).slice(0, 60)}`)
    continue
  }

  const offenders = targets.filter((t) => t.w < MIN || t.h < MIN)
  total += targets.length
  bad += offenders.length

  for (const o of offenders) {
    worst.push({ route, ...o, score: MIN - Math.min(o.w, o.h) })
  }

  const flag = offenders.length === 0 ? "OK " : "VI PHẠM"
  console.log(
    `${route.padEnd(16)} ${flag}  target=${String(targets.length).padStart(4)}  <${MIN}px=${String(offenders.length).padStart(4)}`
  )
}

console.log("\n=== TỔNG ===")
console.log(`Tổng target đo được : ${total}`)
console.log(`Vi phạm <${MIN}×${MIN}px  : ${bad}`)
if (total > 0) {
  const pct = ((bad / total) * 100).toFixed(1)
  console.log(`Tỉ lệ vi phạm      : ${pct}%`)
}

if (worst.length) {
  worst.sort((a, b) => b.score - a.score)
  console.log(`\n=== 12 chỗ tệ nhất ===`)
  for (const w of worst.slice(0, 12)) {
    console.log(`  ${w.route.padEnd(14)} ${w.w}×${w.h}  ${w.tag.padEnd(7)} ${w.text}`)
  }
}

await browser.close()
process.exit(bad === 0 ? 0 : 1)
