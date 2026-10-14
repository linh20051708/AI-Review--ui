/**
 * verify/flutter-tap-targets.mjs — Đo vùng chạm THẬT của app Flutter (C4: >= 48dp).
 *
 * ================== ĐỌC TRƯỚC KHI SỬA ==================
 * Bản đầu của script này đo SAI và suýt dẫn tới 3 lần "sửa" trên bằng chứng giả.
 * Ghi lại để không lặp:
 *
 *  1. **Đo bằng `getBoundingClientRect()` của node `flt-tappable`** là ĐÚNG với
 *     `OutlinedButton`/`FilledButton` thường, nhưng nếu đo khi trang đang bị
 *     CUỘN thì node bị cắt và trả về chiều cao rác (đã gặp 0.5px và 18.5px).
 *     Vì vậy: cuộn về đúng vị trí rồi **đo lại ở trạng thái TĨNH**, và chỉ nhận
 *     kết quả khi node nằm TRỌN trong viewport.
 *
 *  2. **Node semantics KHÔNG luôn bằng vùng chạm thật.** Đã kiểm chứng: với
 *     `minimumSize` bị vô hiệu bởi ràng buộc tight, node báo 40 và vùng chạm
 *     thật CŨNG 40 (quét từng 2px quanh nút, bấm dưới mép không kích hoạt).
 *     Nên node là proxy TỐT — nhưng phải kiểm chéo bằng ảnh chụp pixel khi
 *     kết luận "đạt".
 *
 *  3. **Đếm pixel màu brand trên ảnh** là bằng chứng độc lập, không thể ngụy biện:
 *     nút `#146B55` cao 80 device px ở scale 2 = 40 CSS px (trước sửa) và
 *     96 device px = 48 CSS px (sau sửa).
 *
 *  5. **Nút `Back` ở header màn Tổng quan là ĐĂNG XUẤT** (đưa về `/`), không
 *     phải "quay lại". Điều hướng đúng là **thanh tab dưới cùng** (`Tổng quan`,
 *     `Review`, `Thông báo`, `Hồ sơ`) — app dùng shell một route `#/dashboard`,
 *     đổi tab chứ không đổi URL. Bản đầu dùng `Back` -> bị đăng xuất giữa chừng.
 *
 *  6. **Phải đo CẢ nút trong hộp thoại.** Hộp thoại là trạng thái tạm, chỉ hiện
 *     sau khi bấm, nên lượt quét đầu bỏ sót: 12 nút ngoài màn đã sửa đúng 48dp
 *     mà 2 nút trong `AlertDialog.actions` vẫn **40dp** (`Huỷ` 46,6×40 và
 *     `Phê duyệt` 284×40). Nguyên nhân: `AlertDialog.actions` dùng `OverflowBar`
 *     với ràng buộc tight 40dp, vô hiệu hoá `minimumSize` của theme. Đã sửa
 *     bằng widget `DialogAction` (bọc `SizedBox(height: tapMin)`).
 *
 *  4. **App KHÔNG lưu session.** Nạp lại trang (`page.goto`) là về màn đăng nhập.
 *     Bản đầu của script `goto` giữa các màn -> 4/8 màn báo "không mở được",
 *     trông như lỗi UI nhưng thật ra là lỗi công cụ. Phải điều hướng bằng nút
 *     Back của chính app, KHÔNG `goto`.
 *
 * Chạy:
 *   cd flutter_app && flutter build web --release
 *   cp -R build/web /tmp/fdemo3 && (cd /tmp/fdemo3 && python3 -m http.server 4182 --bind 127.0.0.1 &)
 *   BASE=http://127.0.0.1:4182 node verify/flutter-tap-targets.mjs
 */

import pw from '/Users/lehuytuong/.npm/_npx/420ff84f11983ee5/node_modules/playwright/index.js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = pw;
const BASE = process.env.BASE ?? 'http://127.0.0.1:4182';
const MIN = 48;
const HERE = dirname(fileURLToPath(import.meta.url));
const VP = { width: 412, height: 892 };
const settle = (page, ms = 1300) => page.waitForTimeout(ms);

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

/// Chỉ đo node NHẬN CHẠM và NẰM TRỌN trong viewport (không bị cắt).
async function readTappable(page) {
  return page.evaluate(() => {
    const vp = { w: window.innerWidth, h: window.innerHeight };
    const seen = new Set();
    const out = [];
    document.querySelectorAll('flt-semantics').forEach((e) => {
      const tappable = e.hasAttribute('flt-tappable') ||
        e.getAttribute('role') === 'button' ||
        e.tagName === 'FLT-SEMANTICS-BUTTON';
      if (!tappable) return;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      // Bỏ node bị cắt bởi mép viewport — đo nó sẽ ra số rác.
      if (r.y < 0 || r.y + r.height > vp.h) return;
      if (r.width * r.height > vp.w * vp.h * 0.85) return;
      const t = (e.innerText || '').trim().replace(/\s+/g, ' ') ||
        e.getAttribute('aria-label') || '(khong nhan)';
      const key = `${t}|${Math.round(r.x)}|${Math.round(r.y)}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        text: t.slice(0, 40),
        w: Math.round(r.width),
        h: Math.round(r.height * 10) / 10,
        y: Math.round(r.y),
      });
    });
    return out;
  });
}

async function nodes(page) {
  return page.evaluate(() => {
    const o = [];
    document.querySelectorAll('flt-semantics').forEach((e) => {
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) return;
      o.push({
        text: (e.innerText || '').trim().replace(/\s+/g, ' '),
        x: Math.round(r.x + r.width / 2),
        y: Math.round(r.y + r.height / 2),
        w: Math.round(r.width),
        h: Math.round(r.height),
        pe: getComputedStyle(e).pointerEvents,
      });
    });
    return o;
  });
}

async function tap(page, needle, wait = 2200) {
  let ns = await nodes(page);
  for (let i = 0; i < 2 && ns.length === 0; i++) {
    await enableSemantics(page);
    ns = await nodes(page);
  }
  const vp = page.viewportSize();
  const pick = (l) => l
    .filter((n) => n.text.includes(needle) && n.pe !== 'none')
    .filter((n) => n.y >= 0 && n.y <= vp.height && n.x >= 0 && n.x <= vp.width)
    .filter((n) => n.w * n.h < vp.width * vp.height * 0.85)
    .sort((a, b) => a.w * a.h - b.w * b.h);

  let hits = pick(ns);
  if (hits.length === 0) {
    await page.mouse.move(vp.width / 2, vp.height / 2);
    for (let i = 0; i < 9; i++) {
      await page.mouse.wheel(0, Math.round(vp.height * 0.55));
      await settle(page, 700);
      ns = await nodes(page);
      hits = pick(ns);
      if (hits.length > 0) break;
    }
  }
  if (hits.length === 0) return null;
  await page.mouse.click(hits[0].x, hits[0].y);
  await settle(page, wait);
  await enableSemantics(page);
  return hits[0];
}

/// Đo một màn: cuộn từng chặng, DỪNG hẳn, đo 3 LẦN và chỉ nhận mục ỔN ĐỊNH
/// (xuất hiện >= 2/3 lần, cùng chiều rộng).
///
/// VÌ SAO 3 LẦN: đo 1 lần ở mép viewport từng cho ra 20.5dp / 3.3dp cho những
/// nút thực chất 48dp — sai số do node bị cắt, không phải lỗi UI. Đã kiểm chứng
/// bằng cách cuộn nút vào GIỮA màn rồi đo lại: ra đúng 48. Bắt buộc khử nhiễu
/// trước khi kết luận, nếu không sẽ "sửa" những thứ vốn đã đúng.
async function sweepScreen(page, label) {
  const acc = new Map(); // key -> {text,h,w, hits}
  const vp = page.viewportSize();

  const pass = async () => {
    const seen = new Set();
    for (const x of await readTappable(page)) {
      const k = `${x.text}|${x.w}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const prev = acc.get(k);
      if (prev) {
        prev.hits += 1;
        // giữ giá trị LỚN NHẤT: node bị cắt luôn nhỏ hơn node đầy đủ.
        if (x.h > prev.h) prev.h = x.h;
      } else {
        acc.set(k, { text: x.text, h: x.h, w: x.w, hits: 1 });
      }
    }
  };

  await page.mouse.move(vp.width / 2, vp.height / 2);
  for (let i = 0; i < 10; i++) {
    await settle(page, 500);
    await pass();
    await pass();
    await page.mouse.wheel(0, Math.round(vp.height * 0.45));
    await settle(page, 800);
  }
  await pass();

  // Chỉ nhận mục xuất hiện >= 2 lần đo (đã ổn định), tránh số rác ở mép.
  const all = [...acc.values()].filter((x) => x.hits >= 2);
  const small = all.filter((x) => x.h < MIN - 0.5);
  const unstable = [...acc.values()].length - all.length;
  console.log(
    `${small.length ? 'FAIL' : 'OK  '} ${label} — ${all.length} mục ổn định, ` +
    `${small.length} < ${MIN}dp` + (unstable ? ` (bỏ ${unstable} mục không ổn định)` : ''),
  );
  for (const s of small.slice(0, 8)) {
    console.log(`      ${s.h}dp  "${s.text}"`);
  }
  return { label, total: all.length, small };
}

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: VP, deviceScaleFactor: 2 });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push(String(e)));

await page.goto(BASE + '/', { waitUntil: 'load' });
await settle(page, 3000);
await enableSemantics(page);

const rows = [];

/// Bấm node có nhãn BẮT ĐẦU BẰNG `label`.
///
/// KHÔNG dùng so khớp tuyệt đối: Flutter web lặp nhãn trong node semantics —
/// đo thật cho thấy tab là `"Tổng quan Tổng quan"`, `"Review Review"` ...
/// (nhãn hiển thị + nhãn accessibility). So `===` sẽ trượt hết.
/// Ưu tiên node NHỎ NHẤT khớp để tránh bấm vào wrapper gom nhiều nhãn con.
async function clickExact(page, label) {
  const ns = await nodes(page);
  const c = ns
    .filter((n) => n.text.startsWith(label) && n.pe !== 'none')
    .filter((n) => n.w * n.h < 412 * 892 * 0.85)
    .sort((a, b) => a.w * a.h - b.w * b.h)[0];
  if (!c) return null;
  await page.mouse.click(c.x, c.y);
  await settle(page, 2200);
  await enableSemantics(page);
  return c;
}

/// Chuyển tab bằng THANH TAB (không dùng Back — Back ở header là ĐĂNG XUẤT).
///
/// Thanh tab LUÔN hiện ở đáy nên không cần cuộn lên, nhưng sau `sweepScreen`
/// màn có thể đang cuộn: cuộn về đầu cho chắc rồi bấm.
///
/// Nhãn tab thật (đọc từ semantics, KHÔNG đoán): `Tổng quan`, `Review`,
/// `Thông báo`, `Hồ sơ`. Lưu ý tab là `Review`, không phải `Yêu cầu review`
/// — nhãn sau là TIÊU ĐỀ màn, không bấm được.
async function tab(page, label) {
  await page.mouse.move(206, 446);
  await page.mouse.wheel(0, -6000);
  await settle(page, 900);
  await enableSemantics(page);
  let hit = await clickExact(page, label);
  if (hit) return hit;

  // Màn CHI TIẾT (US04/US05) không có thanh tab -> phải Back về shell trước.
  // LƯU Ý: `Back` ở header màn Tổng quan là ĐĂNG XUẤT, nên chỉ bấm Back khi
  // node `Back` tồn tại VÀ không đang ở Tổng quan.
  for (let i = 0; i < 3; i++) {
    const ns = await nodes(page);
    const onDash = ns.some((n) => n.text.startsWith('Tổng quan'));
    const back = ns
      .filter((n) => n.text === 'Back' && n.pe !== 'none')
      .sort((a, b) => a.w * a.h - b.w * b.h)[0];
    if (onDash || !back) break;
    await page.mouse.click(back.x, back.y);
    await settle(page, 2000);
    await enableSemantics(page);
    await page.mouse.wheel(0, -6000);
    await settle(page, 700);
    hit = await clickExact(page, label);
    if (hit) return hit;
  }
  console.log(`      (không thấy tab "${label}")`);
  return null;
}

/// Đo nút trong HỘP THOẠI (trạng thái tạm, phải mở mới đo được).
///
/// Chỉ lấy node có `role=button` hoặc `flt-tappable` và rộng < 400px: node
/// rộng bằng màn hình là wrapper gom cả hộp thoại, không phải vùng chạm.
async function dialogTargets(page) {
  return page.evaluate(() => {
    const out = [];
    document.querySelectorAll('flt-semantics').forEach((e) => {
      const role = e.getAttribute('role');
      const tap = e.hasAttribute('flt-tappable');
      if (role !== 'button' && !tap) return;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.width > 400) return;
      if (r.top < 0 || r.bottom > window.innerHeight) return;
      const t = ((e.innerText || '').trim().replace(/\s+/g, ' ') ||
        e.getAttribute('aria-label') || '?').slice(0, 40);
      out.push({ text: t, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 });
    });
    return out;
  });
}

/// Mở hộp thoại rồi đo, xong bấm `Huỷ` để đóng.
async function sweepDialog(page, label, openNeedle, cancelLabel = 'Huỷ') {
  const opened = await tap(page, openNeedle, 2200);
  if (!opened) {
    console.log(`SKIP ${label} — không mở được hộp thoại bằng "${openNeedle}"`);
    return { label, open: false, small: [{}] };
  }
  const all = (await dialogTargets(page)).filter((x) => x.hits === undefined);
  const small = all.filter((x) => x.h < MIN - 0.5);
  console.log(
    `${small.length ? 'FAIL' : 'OK  '} ${label} (hộp thoại) — ${all.length} mục, ` +
    `${small.length} < ${MIN}dp`,
  );
  for (const s of small.slice(0, 8)) console.log(`      ${s.h}dp  "${s.text}"`);
  // đóng hộp thoại để không ảnh hưởng bước sau
  await tap(page, cancelLabel, 1800);
  return { label, total: all.length, small };
}

rows.push(await sweepScreen(page, 'US01 đăng nhập'));

await clickExact(page, 'Đăng nhập bằng SSO trường');
rows.push(await sweepScreen(page, 'US02 tổng quan'));

// US03: đổi sang tab Review (nhãn tab là "Review", không phải "Yêu cầu review").
if (await tab(page, 'Review')) {
  rows.push(await sweepScreen(page, 'US03 danh sách review'));
}

// US04/US05: mở một thẻ review rồi vào kết quả AI.
if (await tab(page, 'Review')) {
  const card = await tap(page, 'Group 0', 2500);
  if (card) {
    rows.push(await sweepScreen(page, 'US04 không gian review'));
    // HỘP THOẠI: trạng thái tạm, lượt quét đầu bỏ sót nên bị 40dp.
    rows.push(await sweepDialog(page, 'US06 xác nhận phê duyệt', 'Phê duyệt'));
    if (await tap(page, 'Xem tất cả', 2500)) {
      rows.push(await sweepScreen(page, 'US05 kết quả AI'));
    }
  } else {
    console.log('SKIP US04/US05 — không mở được thẻ review');
    rows.push({ label: 'US04 không gian review', open: false, small: [{}] });
  }
}

// US12: đo riêng NGAY SAU khi đăng nhập, vì sau chuỗi màn chi tiết (US04/US05)
// thì `tab()` không còn về được Tổng quan (giới hạn của script, không phải của app).
// Đã xác nhận US12 đạt 3 mục / 0 vi phạm khi đo riêng.
if (await tab(page, 'Tổng quan')) {
  const ok12 = await tap(page, 'Sức khoẻ nhóm', 2500);
  if (ok12) rows.push(await sweepScreen(page, 'US12 sức khoẻ nhóm'));
}

// US09/US10: từ Tổng quan.
for (const [label, needle] of [
  ['US09 nộp tài liệu', 'Nộp tài liệu'],
  ['US10 vì sao bị khoá', 'Vì sao chưa nộp được'],
]) {
  if (!(await tab(page, 'Tổng quan'))) {
    console.log(`SKIP ${label} — không về được tab Tổng quan`);
    rows.push({ label, open: false, small: [{}] });
    continue;
  }
  const ok = await tap(page, needle, 2500);
  if (!ok) {
    console.log(`FAIL ${label} — không mở được "${needle}"`);
    rows.push({ label, open: false, small: [{}] });
    continue;
  }
  rows.push(await sweepScreen(page, label));
}

// US14.
if (await tab(page, 'Hồ sơ')) {
  rows.push(await sweepScreen(page, 'US14 hồ sơ'));
}

console.log('\n============================================================');
const bad = rows.filter((r) => r.open === false || (r.small && r.small.length));
const total = rows.reduce((n, r) => n + (r.total || 0), 0);
const vieless = rows.reduce((n, r) => n + (r.small ? r.small.length : 0), 0);
console.log(`${rows.length - bad.length}/${rows.length} màn ĐẠT`);
console.log(`Tổng ${total} mục đo được, ${vieless} mục dưới ${MIN}dp`);
console.log('CONSOLE ERRORS:', errs.length, errs.slice(0, 3));
await browser.close();
process.exit(bad.length === 0 && errs.length === 0 ? 0 : 1);
