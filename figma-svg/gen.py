"""Orchestrator sinh bo khung SVG cho 6 page Figma — PRM323 Lab 2.

Chay: python3 gen.py  ->  output/ + output/MANIFEST.md
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

import gen_flow
import gen_screens
import gen_system
import svglib

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"

PAGE_ORDER = ["01 User Flow", "02 Wireframe", "03 Final UI", "04 Design System", "05 Components"]
PAGE_DIR = {
    "01 User Flow": "01-user-flow",
    "02 Wireframe": "02-wireframe",
    "03 Final UI": "03-final",
    "04 Design System": "04-design-system",
    "05 Components": "05-components",
}


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    svglib.MANIFEST.clear()
    n = 0
    n += gen_flow.build()      # page 01 + 02
    n += gen_screens.build()   # page 03
    n += gen_system.build()    # page 04 + 05

    items = list(svglib.MANIFEST)
    # sap xep theo page roi theo ten
    items.sort(key=lambda m: (PAGE_ORDER.index(m["page"]), m["file"]))

    lines = ["# MANIFEST — bộ khung SVG cho 6 page Figma", "",
             f"Tổng: **{len(items)} file SVG** sinh tự động bởi `gen.py`.", "",
             "Mỗi dòng là một khung dán được vào Figma. Cột **Page** là page cần dán vào.", "",
             "| # | Page | File | Khung | Kích thước | Ghi chú |",
             "|---|---|---|---|---|---|"]
    for i, m in enumerate(items, 1):
        rel = f"output/{PAGE_DIR[m['page']]}/{m['file']}"
        lines.append(f"| {i} | {m['page']} | `{rel}` | {m['label']} | {m['w']}×{m['h']} | {m['note']} |")

    # thong ke theo page
    lines += ["", "## Phân bố theo page", "", "| Page | Số khung |", "|---|---|"]
    for p in PAGE_ORDER:
        c = sum(1 for m in items if m["page"] == p)
        lines.append(f"| {p} | {c} |")
    lines.append(f"| **Tổng** | **{len(items)}** |")

    (OUT / "MANIFEST.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (OUT / "manifest.json").write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"Tong: {len(items)} file SVG")
    for p in PAGE_ORDER:
        print(f"  {p}: {sum(1 for m in items if m['page'] == p)}")


if __name__ == "__main__":
    main()
