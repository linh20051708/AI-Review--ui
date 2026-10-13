"""Do text bang font THAT trong Chrome + render kiem tra.

Chay: python3 measure.py   (can `npx playwright` da cai chromium)
"""
from __future__ import annotations

import base64
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"

MEASURE_JS = r"""
const { chromium } = require('playwright');
(async () => {
  const items = JSON.parse(process.argv[2]);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('data:text/html,<html><head><style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");</style></head><body></body></html>');
  await p.waitForTimeout(1500);
  const res = await p.evaluate((items) => {
    const c = document.createElement('canvas').getContext('2d');
    return items.map(it => {
      c.font = `${it.weight} ${it.size}px Inter, sans-serif`;
      return c.measureText(it.text).width;
    });
  }, items);
  await b.close();
  console.log(JSON.stringify(res));
})();
"""

CALIB = r"""
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('data:text/html,<html><head><style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");</style></head><body></body></html>');
  await p.waitForTimeout(1500);
  const w = await p.evaluate(() => {
    const c = document.createElement('canvas').getContext('2d');
    c.font = '400 14px Inter, sans-serif';
    return c.measureText('Xin chào, đây là tiếng Việt có dấu').width;
  });
  await b.close();
  console.log(w);
})();
"""


def run_js(js, arg=None):
    with tempfile.NamedTemporaryFile("w", suffix=".cjs", delete=False, encoding="utf-8") as f:
        f.write(js)
        path = f.name
    cmd = ["node", path] + ([arg] if arg else [])
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    Path(path).unlink(missing_ok=True)
    if r.returncode != 0:
        print("node loi:", r.stderr[-800:])
        sys.exit(2)
    return r.stdout.strip()


def main():
    # calibration — neu font khong nap duoc thi do dai vo nghia
    # 33 ky tu Inter 14px: mong doi ~180-260px (binh quan 5.5-7.9px/ky tu co dau)
    calib = float(run_js(CALIB))
    if not (150.0 <= calib <= 300.0):
        print(f"HIEU CHUAN THAT BAI: 33 ky tu Inter 14px do duoc {calib:.1f}px (mong doi 150-300)")
        return 2
    print(f"Hieu chuan: 33 ky tu Inter 14px = {calib:.1f}px ({calib/33:.2f}px/ky tu)")

    # thu thap moi text
    items, meta = [], []
    for p in sorted(OUT.rglob("*.svg")):
        raw = p.read_text(encoding="utf-8")
        m = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', raw)
        vw, vh = (float(m.group(1)), float(m.group(2))) if m else (0, 0)
        for tm in re.finditer(r'<text([^>]*)>([^<]*)</text>', raw):
            attrs, txt = tm.group(1), tm.group(2)
            g = lambda k, d=None: (re.search(rf'{k}="([^"]*)"', attrs).group(1)
                                   if re.search(rf'{k}="([^"]*)"', attrs) else d)
            items.append({"text": txt, "size": float(g("font-size", 14)),
                          "weight": g("font-weight", "400")})
            meta.append((p, txt, float(g("x", 0)), float(g("y", 0)), g("text-anchor", "start"),
                         float(g("font-size", 14)), vw, vh))

    print(f"Do {len(items)} doan text trong {len(list(OUT.rglob('*.svg')))} file")
    widths = []
    B = 400
    for i in range(0, len(items), B):
        r = run_js(MEASURE_JS, json.dumps(items[i:i + B], ensure_ascii=False))
        widths.extend(json.loads(r))

    bad = 0
    for (p, txt, x, y, anchor, size, vw, vh), w in zip(meta, widths):
        if anchor == "middle":
            x1, x2 = x - w / 2, x + w / 2
        elif anchor == "end":
            x1, x2 = x - w, x
        else:
            x1, x2 = x, x + w
        if x2 > vw + 1 or x1 < -1 or y > vh + 1:
            bad += 1
            if bad <= 10:
                print(f"  ✗ {p.name}: '{txt[:28]}' x=[{x1:.0f},{x2:.0f}]/{vw:.0f} y={y:.0f}/{vh:.0f}")
    if bad:
        print(f"KET QUA: {bad} doan tran khung (do bang font that)")
        return 1
    print("SACH: khong tran khung, khong chu de len chu (do bang font that)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
