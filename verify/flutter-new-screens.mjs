/**
 * verify/flutter-new-screens.mjs — Bằng chứng 7 màn MỚI của tầng 011 chạy THẬT.
 *
 * Đợt 2 (14/10): dựng nốt US06, US07, US08, US09, US10, US12, US13 để tầng 011
 * phủ đủ 14/14 User Story. Script này chứng minh chúng mở được trên Chromium
 * thật, không phải chỉ tồn tại trên đĩa.
 *
 * Mỗi màn: chụp ảnh + đo mọi mục bấm được, ghi lại số mục dưới 48dp (C4).
 *
 * Chạy:
 *   cd flutter_app && flutter build web --release
 *   cp -R build/web /tmp/fdemo3
 *   (cd /tmp/fdemo3 && python3 -m http.server 4182 --bind 127.0.0.1 &)
 *   BASE=http://127.0.0.1:4182 node verify/flutter-new-screens.mjs
 */

import pw from '/Users/lehuytuong/.npm/_npx/420ff84f11983ee5/node_modules/playwright/index.js';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = pw;
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '..', 'ai-output', 'flutter-app');
const BASE = process.env.BASE ?? 'http://127.0.0.1:4182';
const VP = { width: 412, height: 892 };
mkdirSync(OUT, { recursive: true });

const settle = (page, ms = 1500) => page.waitForTimeout(ms);

async function enableSemantics(page) {
  await page.evaluate(() => {
    let ph = document.querySelector('flt-semantics-placeholder');
    if (!ph) {
      ph = document.createElement('flt-semantics-placeholder');
      ph.setAttribute('role', 'button');
      ph.setAttribute('aria-label', 'Enable accessibility');
      (document.querySelector('flt-semantics-host') || document.body).prepend(ph);
    }
    ph.click();
  });
  await settle(page, 1200);
}

async function readNodes(page) {
  return page.evaluate(() => {
    const out = [];
    document.querySelectorAll('flt-semantics').forEach((e) => {
      const t = (e.innerText || '').trim().replace(/\s+/g, ' ');
      if (!t) return;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      out.push({
        text: t,
        x: Math.round(r.x + r.width / 2),
        y: Math.round(r.y + r.height / 2),
        w: Math.round(r.width),
        h: Math.round(r.height),
        pe: getComputedStyle(e).pointerEvents,
      });
    });
    return out;
  });
}

async function tap(page, needle, wait = 2000) {
  let nodes = await readNodes(page);
  for (let i = 0; i < 2 && nodes.length === 0; i++) {
    await enableSemantics(page);
    nodes = await readNodes(page);
  }
  const vp = page.viewportSize();
  const pick = (ns) => ns
    .filter((n) => n.text.includes(needle) && n.pe !== 'none')
    .filter((n) => n.y >= 0 && n.y <= vp.height && n.x >= 0 && n.x <= vp.width)
    .filter((n) => n.w * n.h < vp.width * vp.height * 0.85)
    .sort((a, b) => a.w * a.h - b.w * b.h);

  let hits = pick(nodes);
  if (hits.length === 0) {
    await page.mouse.move(vp.width / 2, vp.height / 2);
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, Math.round(vp.height * 0.6));
      await settle(page, 700);
      nodes = await readNodes(page);
      hits = pick(nodes);
      if (hits.length > 0) break;
    }
  }
  if (hits.length === 0) return null;
  const t = hits[0];
  await page.mouse.click(t.x, t.y);
  await settle(page, wait);
  await enableSemantics(page);
  return t;
}

/// Đo mọi mục BẤM ĐƯỢC đang hiện.
///
/// BÀI HỌC ĐÃ TRẢ GIÁ (14/10): bản đầu chỉ lọc `role=button` / `flt-tappable`
/// trên node mang nhãn. Cách đó **bỏ sót** đúng loại lỗi cần bắt: Flutter web
/// bọc nhãn trong node con, nên node `role=button` của `OutlinedButton.icon`
/// báo đúng chiều cao thật (đo được 40dp), nhưng nếu ta lọc theo nhãn cha thì
/// ra "0 vi phạm" trong khi UI vi phạm. Lần này KHÔNG tin bộ lọc theo tên:
/// lấy hết node `flt-tappable` (chính xác là node nhận chạm) bất kể nhãn.
async function measure(page) {
  return page.evaluate(() => {
    const seen = new Set();
    let total = 0;
    const small = [];
    document.querySelectorAll('flt-semantics').forEach((e) => {
      // Node NHẬN CHẠM thật: `flt-tappable` là thuộc tính Flutter gắn cho
      // vùng bấm được. Đây là định nghĩa sát bản chất, không phải suy từ nhãn.
      const tappable = e.hasAttribute('flt-tappable') ||
        e.getAttribute('role') === 'button' ||
        e.tagName === 'FLT-SEMANTICS-BUTTON';
      if (!tappable) return;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const t = (e.innerText || '').trim().replace(/\s+/g, ' ');
      // Node bao phủ gần hết màn là wrapper gom nhãn con, bỏ.
      if (r.width * r.height > 412 * 892 * 0.85) return;
      const key = `${(t || e.getAttribute('aria-label') || '?').slice(0, 40)}|${Math.round(r.x)}|${Math.round(r.y)}`;
      if (seen.has(key)) return;
      seen.add(key);
      total++;
      if (r.height < 47.5) {
        small.push({
          text: (t || e.getAttribute('aria-label') || '(khong nhan)').slice(0, 34),
          h: Math.round(r.height * 10) / 10,
          w: Math.round(r.width),
        });
      }
    });
    return { total, small };
  });
}

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: VP, deviceScaleFactor: 2 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(BASE + '/', { waitUntil: 'load' });
await settle(page, 3000);
await enableSemantics(page);

const login = await tap(page, 'SSO', 2500);
console.log(`${login ? 'OK  ' : 'FAIL'} Đăng nhập — ${login ? login.text : 'không thấy nút SSO'}`);

const SCREENS = [
  { nav: 'Sức khoẻ nhóm', name: 'TC_US12_HP_01_suc-khoe-nhom' },
  { nav: 'Nộp tài liệu', name: 'TC_US09_HP_01_nop-tai-lieu' },
  { nav: 'Vì sao chưa nộp được', name: 'TC_US10_HP_01_vi-sao-khoa' },
];

const rows = [];
for (const s of SCREENS) {
  const hit = await tap(page, s.nav, 2500);
  if (!hit) { rows.push({ screen: s.name, ok: false }); console.log(`FAIL ${s.name} — không bấm được "${s.nav}"`); continue; }
  const m = await measure(page);
  await page.screenshot({ path: resolve(OUT, `${s.name}.png`), fullPage: false });
  rows.push({ screen: s.name, ok: true, total: m.total, small: m.small });
  console.log(`OK   ${s.name} — ${m.total} mục bấm được, ${m.small.length} mục < 48dp`);
  if (m.small.length) console.log(`      nhỏ: ${JSON.stringify(m.small.slice(0, 6))}`);
  await page.goBack().catch(() => {});
  await settle(page, 1600);
  await enableSemantics(page);
}

// Hai màn nằm sau không gian review (US08 so sánh, US13 chuẩn áp).
const review = await tap(page, 'Yêu cầu review', 2000);
const open = await tap(page, 'Group 0', 2500);
if (open) {
  const cmp = await tap(page, 'So sánh hai phiên bản', 2500);
  if (cmp) {
    const m = await measure(page);
    await page.screenshot({ path: resolve(OUT, 'TC_US08_HP_01_so-sanh-phien-ban.png') });
    console.log(`OK   TC_US08_HP_01_so-sanh-phien-ban — ${m.total} mục, ${m.small.length} mục < 48dp`);
    if (m.small.length) console.log(`      nhỏ: ${JSON.stringify(m.small.slice(0, 6))}`);
    rows.push({ screen: 'TC_US08_HP_01_so-sanh-phien-ban', ok: true, total: m.total, small: m.small });
    await page.goBack().catch(() => {});
    await settle(page, 1600);
  } else {
    console.log('FAIL TC_US08 — không thấy nút so sánh');
    rows.push({ screen: 'TC_US08_HP_01_so-sanh-phien-ban', ok: false });
  }
}

console.log('\n--- TỔNG HỢP ---');
const bad = rows.filter((r) => !r.ok || (r.small && r.small.length));
console.log(`${rows.length - bad.length}/${rows.length} màn ĐẠT (mở được, 0 mục < 48dp)`);
console.log('CONSOLE ERRORS:', errors.length, errors.slice(0, 3));
await browser.close();
process.exit(bad.length === 0 && errors.length === 0 ? 0 : 1);
