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
    // Flutter web xoá `flt-semantics-placeholder` sau khi bật semantics lần đầu,
    // và tắt semantics sau mỗi lần điều hướng. Xoá/thiếu placeholder thì
    // `.click()` không làm gì -> semantics tree rỗng -> không bấm được.
    // Vá: nếu thiếu thì tự tạo lại placeholder đúng aria-label rồi click.
    let ph = document.querySelector('flt-semantics-placeholder');
    if (!ph) {
      ph = document.createElement('flt-semantics-placeholder');
      ph.setAttribute('role', 'button');
      ph.setAttribute('aria-label', 'Enable accessibility');
      const host = document.querySelector('flt-semantics-host') || document.body;
      host.prepend(ph);
    }
    ph.click();
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

  // Chỉ lấy node BẤM ĐƯỢC và NẰM TRONG viewport.
  // Lỗi thật đã gặp: node nhỏ nhất khớp `Group` là thẻ thứ 6 ở y=1046,
  // dưới viewport 892 -> bấm vào khoảng trống, không có gì xảy ra.
  // LƯU Ý: `readNodes` trả `x`,`y` là TÂM node (đã cộng nửa kích thước),
  // nên chỉ cần kiểm tâm nằm trong viewport — KHÔNG cộng thêm w/h.
  const vp = page.viewportSize();
  const clickable = nodes
    .filter((n) => n.text.includes(needle) && n.pe !== 'none')
    .filter((n) => n.y >= 0 && n.y <= vp.height && n.x >= 0 && n.x <= vp.width)
    // Bỏ node boa phủ gần hết màn hình: đó là wrapper gom mọi nhãn con, KHÔNG
    // phải nút thật. Ca thật: nhãn "Back" khớp cả node 412x892 lẫn nút 48x48;
    // sắp theo diện tích thì node 48x48 thắng, nhưng phải chặn từ đây cho chắc.
    .filter((n) => n.w * n.h < vp.width * vp.height * 0.85);

  // Ưu tiên node nhỏ nhất (khớp chính xác nhất) trong số đã lọc.
  const hits = clickable
    .sort((a, b) => a.w * a.h - b.w * b.h);

  // Không thấy node -> có thể nó nằm dưới trong một danh sách chưa cuộn tới.
  // Flutter chỉ dựng semantics cho phần ĐÃ render, nên node chưa tồn tại trong
  // DOM chứ không phải "ngoài viewport". Phải cuộn dần và đọc lại nhiều lần.
  if (hits.length === 0) {
    await page.mouse.move(vp.width / 2, vp.height / 2);
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, Math.round(vp.height * 0.6));
      await settle(page, 700);
      // BẮT BUỘC bật lại semantics TRƯỚC KHI đọc: Flutter web tắt semantics sau
      // mỗi lần có tương tác/scroll, nên `readNodes` lúc này trả rỗng và ta tưởng
      // "cuộn hết vẫn không thấy". Ca thật (14/10): nút "Xem tất cả 5 phát hiện"
      // nằm cuối màn workspace; thiếu dòng này thì script báo FAIL oan cho app.
      await enableSemantics(page);
      const after = await readNodes(page);
      const found = after
        .filter((n) => n.text.includes(needle) && n.pe !== 'none')
        .filter((n) => n.y >= 0 && n.y <= vp.height)
        .sort((a, b) => a.w * a.h - b.w * b.h);
      if (found.length > 0) {
        const tgt = found[0];
        await page.mouse.click(tgt.x, tgt.y);
        await settle(page, wait);
        return tgt;
      }
    }
    console.log(`      (da cuon het danh sach nhung khong thay "${needle}")`);
    return null;
  }

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

  // Tên ảnh mang MÃ TEST CASE để bằng chứng truy vết được về
  // `docs/test-cases-cmplan.md` (checklist mục 10).
  const login = await capture('TC_US01_HP_01_dang-nhap-sso-truong');

  // --- Đăng nhập bằng SSO trường ---
  const sso = await tap(page, 'Đăng nhập bằng SSO trường', 2500);
  const dash = await capture('TC_US02_HP_01_tong-quan-giang-vien');
  log(
    sso !== null && dash.hash !== login.hash,
    'Bấm SSO trường → màn Tổng quan',
    sso ? `nút ${sso.w}x${sso.h} @(${sso.x},${sso.y})` : 'không thấy nhãn',
  );

  // --- Tab Review ---
  const tab = await tap(page, 'Review', 2000);
  const list = await capture('TC_US03_HP_01_danh-sach-yeu-cau-review');
  log(tab !== null && list.hash !== dash.hash, 'Mở tab Yêu cầu review');

  // --- Mở thẻ review đầu tiên (nhãn bắt đầu bằng "Group") ---
  const card = await tap(page, 'Group', 2500);
  const ws = await capture('TC_US04_HP_01_khong-gian-review');
  log(card !== null && ws.hash !== list.hash, 'Mở không gian review');

  // --- Xem tất cả phát hiện AI ---
  const ai = await tap(page, 'Xem tất cả', 2500);
  const aiShot = await capture('TC_US05_HP_01_ket-qua-ai');
  log(ai !== null && aiShot.hash !== ws.hash, 'Mở kết quả AI');

  // --- Quay lại rồi sang tab Hồ sơ ---
  // Màn AI là route riêng -> Back về workspace; Back lần nữa mới về shell có thanh tab.
  // Bấm Back bằng toạ độ nút AppBar (48x48 @28,28) thay vì `tap`: `tap` có thể
  // cuộn trang để tìm nhãn, làm thanh tab dưới bị đẩy khỏi tầm đọc semantics.
  //
  // CHỈ 1500ms LA KHÔNG ĐỦ (14/10): sau mỗi lần điều hướng Flutter web TẮT
  // semantics rồi dựng lại; 1500ms vừa đủ để `settle` hết nhưng chưa đủ để
  // semantics tree trở lại. Lần click toạ độ thứ hai vì thế rơi vào khoảng trống,
  // app đứng lại ở màn đăng nhập -> báo FAIL oan "Hồ sơ". Đo được: 2500+ mở
  // khung đọc đủ cả hai lần Back.
  await tap(page, 'Back', 2500);
  await enableSemantics(page);
  await page.mouse.click(28, 28);
  await settle(page, 2500);
  await enableSemantics(page);
  const prof = await tap(page, 'Hồ sơ', 2500);
  const profShot = await capture('TC_US14_HP_01_ho-so-giang-vien');
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
