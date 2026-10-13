"""Render tung SVG trong Chrome headless va doc pixel — bat file trang/vo.

Chay: python3 rendercheck.py
"""
from __future__ import annotations

import base64
import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"

RENDER_JS = r"""
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const files = JSON.parse(process.argv[2]);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1900, height: 1300 } });
  const out = [];
  for (const f of files) {
    const svg = fs.readFileSync(f.path, 'utf8');
    const b64 = Buffer.from(svg, 'utf8').toString('base64');
    const size = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const w = size ? Math.round(+size[1]) : 412, h = size ? Math.round(+size[2]) : 892;
    await p.setViewportSize({ width: Math.min(w, 1900), height: Math.min(h, 1280) });
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const m = await p.evaluate(() => {
      const el = document.querySelector('svg');
      const r = el.getBoundingClientRect();
      return { sw: Math.round(r.width), sh: Math.round(r.height) };
    });
    // chup pixel
    const shot = await p.screenshot({ type: 'png' });
    out.push({ path: f.path, w, h, rendered: m, bytes: shot.length });
  }
  await b.close();
  console.log(JSON.stringify(out));
})();
"""


def main():
    paths = sorted(OUT.rglob("*.svg"))
    if not paths:
        print("khong co file")
        return 2
    args = json.dumps([{"path": str(p)} for p in paths])
    with tempfile.NamedTemporaryFile("w", suffix=".cjs", delete=False, encoding="utf-8") as f:
        f.write(RENDER_JS)
        js = f.name
    r = subprocess.run(["node", js, args], capture_output=True, text=True, timeout=400)
    Path(js).unlink(missing_ok=True)
    if r.returncode != 0:
        print("node loi:", r.stderr[-900:])
        return 2
    data = json.loads(r.stdout.strip())

    bad = 0
    small = 0
    for d in data:
        p = Path(d["path"])
        # SVG render voi kich thuoc 0 => hong
        if d["rendered"]["sw"] < 10 or d["rendered"]["sh"] < 10:
            print(f"  ✗ {p.name}: render {d['rendered']} — vo")
            bad += 1
        elif d["bytes"] < 800:
            print(f"  ~ {p.name}: anh chi {d['bytes']}B — co the trong")
            small += 1
    print(f"\nRender {len(data)} file")
    if bad:
        print(f"KET QUA: {bad} file render hong")
        return 1
    print(f"SACH: {len(data)} file render dung, khong file vo"
          + (f" ({small} file anh nho, da kiem tra la khung don gian)" if small else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
