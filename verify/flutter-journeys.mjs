/**
 * verify/flutter-journeys.mjs — Bằng chứng app Flutter chạy THẬT.
 *
 * Mở bản build web của `flutter_app/` bằng Chromium thật, đi qua các màn và
 * chụp ảnh. Đây là bằng chứng cho mục G (handoff) của Lab 2: bản handoff
 * không chỉ là tài liệu, mà dựng được thành app chạy.
 *
 * Cách bấm: Flutter web vẽ vào canvas. Để bấm tin được, script **đọc toạ độ
 * thật từ semantics tree** của Flutter (bật bằng cách click
 * `flt-semantics-placeholder`) rồi bấm theo toạ độ đó — không dùng hằng số
 * đoán tay. Mỗi bước còn kiểm màn hình đã đổi bằng so sánh hash ảnh.
 *
 * Chạy:
 *   cd flutter_app && flutter build web --release
 *   cp -R build/web /tmp/flutterdemo_web
 *   (cd /tmp/flutterdemo_web && python3 -m http.server 4180 --bind 127.0.0.1 &)
 *   node verify/flutter-journeys.mjs
 *
 * Xuất ảnh vào: prm323-lab2/ai-output/flutter-app/
 */

import pw from '/Users/lehuytuong/.npm/_npx/420ff84f11983ee5/node_modules/playwright/index.js';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = pw;

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '..', 'ai-output', 'flutter-app');
const BASE = process.env.BASE ?? 'http://127.0.0.1:4180';
const VP = { width: 412, height: 892 };

mkdirSync(OUT, { recursive: true });

const steps = [];
const log = (ok, name, extra = '') => {
  steps.push({ ok, name, extra });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
};

const settle = (page, ms = 1500) => page.waitForTimeout(ms);

/// Bật semantics tree để đọc được nhãn + toạ độ thật của widget.
async function enableSemantics(page) {
  await page.evaluate(() => {
    document.querySelector('flt-semantics-placeholder')?.click();
  });
  await settle(page, 1500);
}

/// Đọc mọi nhãn trong semantics tree kèm tâm và kích thước (CSS px).
async function readNodes(page) {
  return page.evaluate(() => {
    const out = [];
    document.querySelectorAll('flt-semantics').forEach((e) => {
      const t = (e.innerText || '').trim().replace(/\s+/g, ' ');
      if (!t) return;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const pe = getComputedStyle(e).pointerEvents;
      out.push({
        text: t,
        x: Math.round(r.x + r.width / 2),
        y: Math.round(r.y + r.height / 2),
        w: Math.round(r.width),
        h: Math.round(r.height),
        pe,
      });
    });
    return out;
  });
}

/// Bấm phần tử khả dụng có nhãn chứa `needle`. Trả về node đã bấm, hoặc null.
async function tap(page, needle, wait = 2000) {
  let nodes = await readNodes(page);
  // Flutter web tắt semantics sau mỗi lần điều hướng -> bật lại rồi đọc.
  if (nodes.length === 0) {
    await enableSemantics(page);
    nodes = await readNodes(page);
  }
  if (nodes.length === 0) {
    await enableSemantics(page);
    nodes = await readNodes(page);
  }

  // Ưu tiên node nhỏ nhất (khớp chính xác nhất) và bấm được.
  const hits = nodes
    .filter((n) => n.text.includes(needle) && n.pe !== 'none')
    .sort((a, b) => a.w * a.h - b.w * b.h);

  if (hits.length === 0) return null;

  const target = hits[0];
  await page.mouse.click(target.x, target.y);
  await settle(page, wait);
  // Điều hướng làm Flutter tắt semantics -> bật lại cho bước kế tiếp.
  await enableSemantics(page);
  return target;
}

async function shot(page, name) {
  const file = resolve(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  const hash = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
  return { file, hash };
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: VP,
  deviceScaleFactor: 2,
  locale: 'vi-VN',
});

const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

try {
  await page.goto(BASE, { waitUntil: 'load', timeout: 60_000 });
  await settle(page, 6000);
  await enableSemantics(page);

  const nodes = await readNodes(page);
  log(nodes.length > 0, 'Đọc được semantics tree', `${nodes.length} phần tử`);

  const shots = [];
  const capture = async (name) => {
    const s = await shot(page, name);
    shots.push({ name, ...s });
    return s;
  };

  const login = await capture('01-login');

  // --- Đăng nhập bằng SSO trường ---
  const sso = await tap(page, 'Đăng nhập bằng SSO trường', 2500);
  const dash = await capture('02-dashboard');
  log(
    sso !== null && dash.hash !== login.hash,
    'Bấm SSO trường → màn Tổng quan',
    sso ? `nút ${sso.w}x${sso.h} @(${sso.x},${sso.y})` : 'không thấy nhãn',
  );

  // --- Tab Review ---
  const tab = await tap(page, 'Review', 2000);
  const list = await capture('03-review-list');
  log(tab !== null && list.hash !== dash.hash, 'Mở tab Yêu cầu review');

  // --- Mở thẻ review đầu tiên (nhãn bắt đầu bằng "Group") ---
  const card = await tap(page, 'Group', 2500);
  const ws = await capture('04-workspace');
  log(card !== null && ws.hash !== list.hash, 'Mở không gian review');

  // --- Xem tất cả phát hiện AI ---
  const ai = await tap(page, 'Xem tất cả', 2500);
  const aiShot = await capture('05-ai-result');
  log(ai !== null && aiShot.hash !== ws.hash, 'Mở kết quả AI');

  // --- Quay lại rồi sang tab Hồ sơ ---
  await tap(page, 'Back', 1800);
  const prof = await tap(page, 'Hồ sơ', 2200);
  const profShot = await capture('06-profile');
  log(prof !== null && profShot.hash !== aiShot.hash, 'Mở tab Hồ sơ');

  const unique = new Set(shots.map((s) => s.hash)).size;
  log(
    unique >= 4,
    'Các màn render KHÁC nhau (không phải cùng một ảnh)',
    `${unique}/${shots.length} ảnh khác nhau`,
  );

  const realErrors = consoleErrors.filter(
    (e) => !/favicon|net::ERR_|Deprecat|wasm/i.test(e),
  );
  log(realErrors.length === 0, 'Không có lỗi console', realErrors.slice(0, 3).join(' | '));
} catch (err) {
  log(false, 'Ngoại lệ khi chạy luồng', String(err));
} finally {
  await browser.close();
}

const failed = steps.filter((s) => !s.ok).length;
console.log('');
console.log(`${steps.length - failed}/${steps.length} bước OK, ${failed} thất bại`);
console.log(`Ảnh lưu ở: ${OUT}`);
process.exit(failed === 0 ? 0 : 1);
