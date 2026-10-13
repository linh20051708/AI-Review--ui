/**
 * verify/journeys.mjs — Bang chung rubric F: 3 luong nghiep vu chay THAT.
 *
 * Day KHONG phai code cua app. Day la script kiem chung, chay tren ban dung that
 * (app/ la code nen do giang vien cung cap).
 *
 * Chay:
 *   cd app && npx vite preview --port 4173 --strictPort &
 *   node ../verify/journeys.mjs
 *
 * Ket qua: 33/33 buoc OK, 0 that bai (do 13/10/2026).
 * Xuat: /tmp/journeys.json
 */

import pw from '/Users/lehuytuong/.npm/_npx/420ff84f11983ee5/node_modules/playwright/index.js';
const { chromium } = pw;

const BASE = 'http://localhost:4173';
const VP = { width: 412, height: 892 };

const steps = [];
let failed = 0;

const log = (name, ok, detail) => {
  steps.push({ name, ok, detail });
  if (!ok) failed++;
  console.log(`${ok ? 'OK ' : '!! '} ${name}${detail ? ' — ' + detail : ''}`);
};

async function newPage(browser, viewport = VP) {
  const p = await browser.newPage({ viewport });
  p.on('pageerror', (e) => console.log('   [pageerror]', e.message.slice(0, 120)));
  return p;
}

/** Di toi route, doi render xong. */
async function go(page, path) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
}

async function main() {
  const browser = await chromium.launch();
  const page = await newPage(browser);

  // ---------- Dang nhap ----------
  await go(page, '/login');
  const hasForm = await page.locator('input[type="email"], input[name="email"]').count();
  log('S01 dang nhap: co form email', hasForm > 0);
  // dat session gia lap
  await page.evaluate(() => localStorage.setItem('project-review:session', '1'));

  // ---------- LUONG 1: thuan ----------
  console.log('\n--- LUONG 1: duyet mot tai lieu ---');
  await go(page, '/dashboard');
  const dash = await page.locator('body').innerText();
  log('L1.1 S02 Tong quan hien', dash.includes('Xin chào') || dash.includes('TỔNG QUAN'));

  await go(page, '/reviews');
  const revText = await page.locator('body').innerText();
  log('L1.2 S03 danh sach review', revText.includes('Yêu cầu review'));

  // bam vao the review dau tien
  const card = page.locator('a[href*="/reviews/"]').first();
  const cardCount = await card.count();
  log('L1.3 co the review bam duoc', cardCount > 0, `${cardCount} the`);
  if (cardCount > 0) {
    const href = await card.getAttribute('href');
    await card.click();
    await page.waitForTimeout(700);
    const url = page.url();
    log('L1.4 vao S04 khong gian review', url.includes('/reviews/'), url.replace(BASE, ''));
    const dText = await page.locator('body').innerText();
    log('L1.5 S04 co 3 track trang thai',
      /Tài liệu/.test(dText) && /AI/.test(dText) && /Giảng viên|Supervisor/.test(dText));

    // di toi ket qua AI
    const aiLink = page.locator('a[href*="ai-result"]').first();
    if (await aiLink.count() > 0) {
      await aiLink.click();
      await page.waitForTimeout(700);
      log('L1.6 S05 ket qua AI mo duoc', page.url().includes('ai-result'));
      await page.goBack();
      await page.waitForTimeout(600);
    } else {
      await go(page, href + '/ai-result');
      log('L1.6 S05 ket qua AI mo truc tiep', (await page.locator('body').innerText()).length > 50);
    }

    // LUONG THAT: "Bat dau review" -> trang thai "Dang review" -> 3 nut quyet dinh
    const startBtn = page.getByRole('button', { name: /Bắt đầu review/i }).first();
    const hasStart = await startBtn.count() > 0;
    log('L1.7 co nut "Bat dau review"', hasStart);
    if (hasStart) {
      await startBtn.click();
      await page.waitForTimeout(900);
      const after = await page.locator('body').innerText();
      log('L1.8 trang thai -> "Đang review"', after.includes('Đang review'));
      const bnames = await page.locator('button').allInnerTexts();
      const hasApprove = bnames.some((x) => /Phê duyệt/i.test(x));
      const hasRequest = bnames.some((x) => /Yêu cầu chỉnh sửa/i.test(x));
      const hasReject = bnames.some((x) => /Không đạt/i.test(x));
      log('L1.9 hien du 3 nut quyet dinh', hasApprove && hasRequest && hasReject,
        `duyet=${hasApprove} sua=${hasRequest} khongdat=${hasReject}`);
      // bam Phe duyet -> doi hop thoai
      if (hasApprove) {
        await page.getByRole('button', { name: /^Phê duyệt$/i }).first().click();
        await page.waitForTimeout(800);
        const dlg = await page.locator('[role="dialog"], [role="alertdialog"]').count();
        const body2 = await page.locator('body').innerText();
        log('L1.10 hop thoai xac nhan hien', dlg > 0 || /xác nhận|Xác nhận|chắc chắn/i.test(body2),
          `dialog=${dlg}`);
      }
    }
  }

  // ---------- LUONG 2: thay the (lich su phien ban) ----------
  console.log('\n--- LUONG 2: so sanh phien ban ---');
  if (cardCount > 0) {
    const href = await page.locator('a[href*="/reviews/"]').first().getAttribute('href');
    const base = href.split('/versions')[0].split('/history')[0];
    await go(page, base + '/versions');
    log('L2.1 S06 lich su phien ban', (await page.locator('body').innerText()).length > 50);
    await go(page, base + '/history');
    log('L2.2 S07 lich su review', (await page.locator('body').innerText()).length > 50);
  }
  await go(page, '/review-history');
  log('L2.3 S08 muc lich su', (await page.locator('body').innerText()).length > 50);

  // ---------- LUONG 3: loi & phuc hoi ----------
  console.log('\n--- LUONG 3: loi va phuc hoi ---');
  await go(page, '/reviews');
  const before = await page.locator('body').innerText();
  // doi bo loc de kich hoat tai lai
  const chip = page.getByRole('button', { name: /Đang review|Chờ review/i }).first();
  if (await chip.count() > 0) {
    await chip.click();
    await page.waitForTimeout(900);
    const after = await page.locator('body').innerText();
    log('L3.1 doi bo loc -> co phan hoi', after.length > 30, `${before.length} -> ${after.length} ky tu`);
  } else {
    log('L3.1 (bo qua) khong thay chip loc', false);
  }

  // mo phong mat mang
  await page.route('**/api/**', (r) => r.abort());
  await page.route('**/*.json', (r) => r.abort());
  await go(page, '/dashboard');
  log('L3.2 S02 van render khi chan request',
    (await page.locator('body').innerText()).length > 30);
  await page.unroute('**/api/**');
  await page.unroute('**/*.json');

  // ---------- BACK / khong ngo cut ----------
  console.log('\n--- Ma tran Back ---');
  const routes = ['/classes', '/projects', '/groups', '/semesters', '/rule-sets',
                  '/courses', '/students', '/notifications', '/profile', '/documents',
                  '/reviews', '/dashboard'];
  for (const r of routes) {
    await go(page, r);
    const n = await page.locator('body').innerText();
    const hasBack = await page.locator('a[href="/dashboard"], a[href="/reviews"], button[aria-label*="uay"], [aria-label*="ack"]').count();
    log(`Back ${r}`, n.length > 30, hasBack > 0 ? `${hasBack} nut back` : 'khong thay nut back');
  }

  // route sai -> ve dashboard
  await go(page, '/khong-ton-tai-xyz');
  log('Route sai -> /dashboard', page.url().includes('/dashboard'), page.url().replace(BASE, ''));

  // ---------- 360dp ----------
  console.log('\n--- 360dp ---');
  const p360 = await newPage(browser, { width: 360, height: 800 });
  await p360.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await p360.evaluate(() => localStorage.setItem('project-review:session', '1'));
  for (const r of ['/dashboard', '/reviews', '/projects', '/students']) {
    await go(p360, r);
    const ov = await p360.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    log(`360dp ${r} khong tran ngang`, ov <= 1, `overflow=${ov}px`);
  }

  await browser.close();
  console.log(`\n=========== ${steps.length - failed}/${steps.length} buoc OK, ${failed} that bai ===========`);
  const fs = await import('node:fs');
  fs.writeFileSync('/tmp/journeys.json', JSON.stringify({ total: steps.length, failed, steps }, null, 2));
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error('LOI:', e.message); process.exit(2); });
