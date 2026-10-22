import assert from "node:assert/strict"
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const {
  chromium,
} = require("C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")
const browser = await chromium.launch({ headless: true, channel: "chrome" })
const page = await browser.newPage()
page.setDefaultTimeout(10000)
const errors = []
page.on("pageerror", (e) => errors.push(e.message))
await page.goto("http://127.0.0.1:8443")
await page.evaluate(() => localStorage.setItem("project-review:session", "1"))
await page.goto("http://127.0.0.1:8443/dashboard")
await page.locator("h1").waitFor()
// Use exactly the module loaded by Vite, including its HMR timestamp.
const state = () =>
  page.evaluate(async () => {
    const urls = performance.getEntriesByType("resource").map((e) => e.name)
    const mgmt = await import(
      urls.find((u) => u.includes("/src/data/managementStore.ts"))
    )
    const reviews = await import(
      urls.find((u) => u.includes("/src/data/reviewStore.ts"))
    )
    return {
      cfg: structuredClone(mgmt.getManagementState()),
      reviews: structuredClone(reviews.getReviewState()),
    }
  })
const baseline = await state()
const course = baseline.cfg.courses.find((c) =>
  baseline.cfg.offerings.some((o) => o.courseId === c.id),
)
const checks = []
for (const width of [360, 390, 412]) {
  await page.setViewportSize({ width, height: 844 })
  await page.goto("http://127.0.0.1:8443/dashboard")
  await page.getByText("Xin chào, Nguyễn Văn An", { exact: true }).waitFor()
  assert.equal(
    await page.locator('[aria-label="Thống kê tổng quan"] > div').count(),
    6,
  )
  await page.getByText("Truy cập nhanh", { exact: true }).click()
  await page
    .getByRole("main")
    .getByRole("link", { name: "Bộ quy tắc", exact: true })
    .click()
  await page.getByRole("navigation", { name: "Chọn môn học" }).waitFor()
  assert.equal(
    await page
      .getByRole("button", { name: "Thêm bộ quy tắc", exact: true })
      .count(),
    0,
  )
  await page
    .getByRole("navigation", { name: "Chọn môn học" })
    .locator(`a[href="/courses/${course.id}"]`)
    .click()
  await page.getByRole("heading", { name: course.name, exact: true }).waitFor()
  await page.locator("#course-rules-1").click()
  await page
    .getByRole("heading", {
      name: "Checklist và tiêu chí đánh giá",
      exact: true,
    })
    .waitFor()
  await page
    .getByRole("button", { name: "Chỉnh tiêu chí", exact: true })
    .first()
    .click()
  assert.equal(
    await page.locator("#rule-editor-1").getAttribute("aria-selected"),
    "true",
  )
  await page.locator("#rule-editor-0").click()
  assert.ok(
    await page
      .getByRole("dialog")
      .getByLabel("Dung lượng tối đa MB", { exact: true })
      .isVisible(),
  )
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Hủy", exact: true })
    .click()
  assert.equal(
    await page
      .locator(".mobile-content")
      .evaluate((e) => e.scrollWidth > e.clientWidth),
    false,
  )
  checks.push(
    `${width}px: Dashboard → choose course → both groups → editor/cancel; no overflow`,
  )
}
await page.goto("http://127.0.0.1:8443/semesters")
await page.getByRole("heading", { name: "Học kỳ", exact: true }).waitFor()
assert.equal(
  await page.getByRole("main").locator('a[href="/rule-sets"]').count(),
  0,
)
await page.goto("http://127.0.0.1:8443/reviews/review-001")
await page.getByRole("tab", { name: "AI", exact: true }).click()
assert.equal(
  await page.getByRole("main").locator('a[href="/rule-sets"]').count(),
  0,
)
assert.equal(
  await page
    .getByRole("button", { name: "Lưu bộ quy tắc", exact: true })
    .count(),
  0,
)
assert.deepEqual(
  await state(),
  baseline,
  "Browsing and cancelling must not write data",
)
checks.push(
  "Semester entry removed; workspace read-only; navigation/cancel preserve all stores",
)

await page.goto("http://127.0.0.1:8443/courses/" + course.id)
await page.getByRole("heading", { name: course.name, exact: true }).waitFor()
const offering = baseline.cfg.offerings.find((o) => o.courseId === course.id)
const rule = baseline.cfg.ruleSets.find((r) => r.id === offering.ruleSetId)
const targetClass = baseline.cfg.classes.find(
  (c) => c.offeringId === offering.id,
)
await page
  .getByRole("button", { name: `Thao tác ${rule.name}`, exact: true })
  .click()
await page.getByRole("menuitem", { name: "Áp dụng", exact: true }).click()
const dialog = page.getByRole("dialog")
await dialog.getByLabel("Môn học trong học kỳ").waitFor()
const allowed = await dialog
  .getByLabel("Môn học trong học kỳ")
  .locator("option")
  .evaluateAll((options) => options.map((o) => o.value).filter(Boolean))
assert.deepEqual(
  allowed.sort(),
  baseline.cfg.offerings
    .filter((o) => o.courseId === course.id)
    .map((o) => o.id)
    .sort(),
)
await dialog.getByLabel("Môn học trong học kỳ").selectOption(offering.id)
await dialog.getByLabel("Phạm vi lớp").selectOption(targetClass.id)
const item = (targetClass.labOverride ?? offering.labs).flatMap(
  (l) => l.items,
)[0]
await dialog.getByLabel("Mục bài thực hành").selectOption(item.id)
await dialog
  .getByRole("button", { name: "Xác nhận áp dụng", exact: true })
  .click()
const assigned = await state()
const changedClass = assigned.cfg.classes.find((c) => c.id === targetClass.id)
assert.equal(
  changedClass.labOverride.flatMap((l) => l.items).find((i) => i.id === item.id)
    .ruleSetId,
  rule.id,
)
assert.deepEqual(assigned.cfg.offerings, baseline.cfg.offerings)
assert.deepEqual(
  assigned.cfg.classes.filter((c) => c.id !== targetClass.id),
  baseline.cfg.classes.filter((c) => c.id !== targetClass.id),
)
assert.deepEqual(assigned.reviews, baseline.reviews)
checks.push(
  "Assignment restricts course options; item override touches only selected class; old submissions/evaluations unchanged",
)

await page
  .getByRole("button", { name: "Cấu hình nộp bài", exact: true })
  .first()
  .click()
const editing = page.getByRole("dialog")
const oldName = await editing
  .getByLabel("Tên bộ quy tắc", { exact: true })
  .inputValue()
const oldRule = assigned.cfg.ruleSets.find((r) => r.name === oldName)
await editing
  .getByLabel("Tên bộ quy tắc", { exact: true })
  .fill(oldName + " · Kiểm thử riêng")
await editing
  .getByRole("button", { name: "Lưu bộ quy tắc", exact: true })
  .click()
await editing.waitFor({ state: "hidden" })
const saved = await state()
assert.equal(
  saved.cfg.ruleSets.find((r) => r.id === oldRule.id).version,
  (oldRule.version ?? 1) + 1,
)
assert.deepEqual(saved.reviews, baseline.reviews)
checks.push(
  "Save still uses versioned rule API; snapshots/history/evaluations untouched",
)
assert.deepEqual(errors, [])
console.log(JSON.stringify({ checks, errors }, null, 2))
await browser.close()
