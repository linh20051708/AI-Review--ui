import { createRequire } from 'node:module'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const require = createRequire(import.meta.url)
const { chromium } = require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const stage = process.argv[2] ?? 'after'
const dir = 'evidence/ui-vietnamese'
fs.mkdirSync(dir, { recursive: true })
const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://localhost:8443')
await page.evaluate(() => localStorage.setItem('project-review:session', '1'))
await page.goto('http://localhost:8443/dashboard')
await page.locator('h1').waitFor()
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: `${dir}/${stage}-dashboard.png` })
await page.locator('.mobile-header').screenshot({ path: `${dir}/${stage}-header.png` })
const detail = await page.locator('a[href^="/reviews/"]').first().getAttribute('href')
await page.goto('http://localhost:8443' + detail)
await page.locator('[role="tablist"]').waitFor()
await page.screenshot({ path: `${dir}/${stage}-review-detail.png` })
const checks = []
if (stage === 'after') {
  for (const width of [360, 390, 412]) {
    await page.setViewportSize({ width, height: 844 })
    for (const route of ['/dashboard', '/reviews', detail]) {
      await page.goto('http://localhost:8443' + route)
      await page.locator('h1').waitFor()
      assert.equal(await page.locator('.mobile-header').innerText(), 'SRS Review AI')
      assert.equal(await page.locator('.mobile-app > div .lucide-bell').count(), 1)
      const overflow = await page.locator('.mobile-content').evaluate(el => el.scrollWidth > el.clientWidth)
      assert.equal(overflow, false, `${width}px ${route}: horizontal overflow`)
      assert.equal((await page.locator('.mobile-header').boundingBox()).height, 57)
      if (route === '/dashboard') assert.equal(await page.locator('[aria-label="Thống kê tổng quan"] > div').count(), 6)
      checks.push(`${width}px ${route}`)
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://localhost:8443' + detail)
  for (const name of ['AI', 'Phản hồi', 'Lịch sử', 'Tài liệu']) {
    await page.getByRole('tab', {name, exact: true}).click()
    assert.equal(await page.getByRole('tab', {name, exact: true}).getAttribute('aria-selected'), 'true')
  }
  await page.getByRole('button', {name:'Thông tin', exact:true}).click()
  assert.ok(await page.getByRole('dialog').getByText('Phiên bản', {exact:true}).isVisible())
  await page.getByRole('dialog').getByRole('button', {name:/Đóng/}).click()
  await page.getByRole('tab', {name:'Phản hồi',exact:true}).click()
  await page.getByRole('button', {name:'Quan trọng',exact:true}).click()
  await page.getByPlaceholder('Quan hệ giữa sinh viên và tác vụ nộp tài liệu chưa đúng.').fill('Kiểm tra phản hồi tiếng Việt.')
  await page.getByRole('button', {name:'Thêm phản hồi',exact:true}).click()
  assert.ok(await page.locator('#review-panel-feedback').getByText('Kiểm tra phản hồi tiếng Việt.', {exact:false}).isVisible())
  const persisted = await page.evaluate(() => Object.entries(localStorage).filter(([k]) => k.includes('review') && !k.includes('session')))
  assert.ok(persisted.some(([,v]) => v.includes('"severity":"Major"')))
  checks.push('4 tabs, context dialog, Vietnamese severity preserves Major enum, feedback creation')
  await page.evaluate(() => document.documentElement.style.setProperty('--app-safe-top','44px'))
  assert.equal((await page.locator('.mobile-header').boundingBox()).height, 101)
  checks.push('44px device safe area retained')
  // Fresh context preserves the original waiting state in screenshots and checks the rest of the app.
  const sweep = await browser.newPage({viewport:{width:390,height:844}})
  await sweep.goto('http://localhost:8443')
  await sweep.evaluate(() => localStorage.setItem('project-review:session','1'))
  const routes = ['/projects','/classes','/groups','/students','/semesters','/courses','/rule-sets','/documents','/notifications','/profile','/project-registrations','/review-history',`${detail}/versions`,`${detail}/history`,`${detail}/ai-result`]
  for (const route of routes) {
    await sweep.goto('http://localhost:8443'+route)
    assert.ok(await sweep.locator('h1').count(), route)
    checks.push(route)
  }
  await sweep.evaluate(() => localStorage.setItem('project-review:session',JSON.stringify({role:'student',studentId:'s1'})))
  for(const route of ['/student/dashboard','/student/projects','/student/groups','/student/documents','/student/notifications','/student/profile']) {
    await sweep.goto('http://localhost:8443'+route)
    assert.equal(await sweep.locator('.mobile-header').innerText(),'SRS Review AI')
    assert.ok(await sweep.locator('h1').count(),route)
    checks.push(route)
  }
  await sweep.close()
}
fs.writeFileSync(`${dir}/${stage}-checks.json`,JSON.stringify({stage,detail,checks,errors},null,2))
console.log(JSON.stringify({ stage, detail, checks, errors }))
await browser.close()
