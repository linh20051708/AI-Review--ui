#!/usr/bin/env python3
"""paste-plan.py — Sinh huong dan dan 48 SVG vao Figma theo toa do.

Muc dich: khi dan khung vao Figma, cac frame de chong len nhau. File nay tinh
san toa do x/y cho tung khung trong moi page de dan xong la co bo cuc gon.

Chay: python3 paste-plan.py
Xuat: output/PASTE-PLAN.md
"""
from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"

# Khe ho giua cac khung khi dat canh nhau tren canvas
GAP = 80
# So cot toi da moi hang (tranh hang qua dai)
MAX_COLS = 6


def main() -> int:
    mf = OUT / "manifest.json"
    if not mf.exists():
        print(f"thieu {mf} — chay gen.py truoc")
        return 2
    items = json.loads(mf.read_text(encoding="utf-8"))

    # nhom theo page, giu thu tu
    by_page: dict[str, list[dict]] = {}
    for it in items:
        by_page.setdefault(it["page"], []).append(it)

    lines = [
        "# PASTE-PLAN — Hướng dẫn dán 48 khung vào Figma",
        "",
        "Mỗi khung dưới đây có **toạ độ đặt sẵn** để dán xong là có bố cục gọn,",
        "không chồng lên nhau. Toạ độ tính từ góc trên-trái của page.",
        "",
        "**Cách dán một khung:**",
        "1. Mở file SVG (bằng trình duyệt hoặc editor văn bản)",
        "2. Copy toàn bộ nội dung XML",
        "3. Vào Figma, chọn đúng page, bấm vào canvas",
        "4. `Cmd+V` — Figma tạo frame + vector + text sửa được",
        "5. Đặt frame về toạ độ ghi trong bảng (kéo thả, hoặc chỉnh X/Y trong panel)",
        "",
        f"Khe giữa các khung: **{GAP}px**, tối đa **{MAX_COLS}** khung mỗi hàng.",
        "",
    ]

    grand = 0
    for page in sorted(by_page, key=lambda p: [int(x) for x in re.findall(r"\d+", p)[:1]] or [99]):
        group = by_page[page]
        lines += [f"## {page}", "", f"_{len(group)} khung_", "",
                  "| # | Đặt tại X,Y | Kích thước | File | Tên khung |",
                  "|---|---|---|---|---|"]
        for i, it in enumerate(group):
            row, col = divmod(i, MAX_COLS)
            # chieu cao hang = max h trong hang truoc (don gian: dung h cua chinh no + gap)
            x = 100
            # tinh x theo cot: cong don w cua cac khung truoc trong cung hang
            for j in range(col):
                x += group[row * MAX_COLS + j]["w"] + GAP
            y = 100
            for r in range(row):
                y += max(g["h"] for g in group[r * MAX_COLS:(r + 1) * MAX_COLS]) + GAP
            lines.append(
                f"| {i+1} | `{x}, {y}` | {it['w']}×{it['h']} | `{it['file']}` | {it.get('label','')} |")
        lines.append("")
        grand += len(group)

    lines += [
        "---",
        "",
        "## Sau khi dán xong — việc phải làm tay",
        "",
        "Paste SVG tạo được frame + text sửa được, nhưng **KHÔNG** tạo được:",
        "",
        "| Thiếu | Cách làm |",
        "|---|---|",
        "| Auto Layout | Chọn frame → `Shift+A` → đặt hướng và khe |",
        "| Variables | Page `04 Design System` → panel Variables → tạo theo `design-system.md` §10 |",
        "| Component | Chọn nhóm → `Ctrl+Alt+K` |",
        "| Biến thể | Thêm property cho component set |",
        "| Prototype link | Mode Prototype → nối theo `ux/prototype-spec.md` §2–§4 |",
        "| Drop shadow | SVG mất filter → chọn frame → Effects → Drop shadow |",
        "| Ảnh thật | Chỗ ảnh là khung xám ghi \"Ảnh mẫu\" |",
        "| Page 06 Prototype | Tự tạo thêm — page thứ 6 theo brief |",
        "",
        "Tên 6 page phải đúng và đúng thứ tự:",
        "`01 User Flow` · `02 Wireframe` · `03 Final UI` · `04 Design System` · `05 Components` · `06 Prototype`",
    ]

    (OUT / "PASTE-PLAN.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"da ghi output/PASTE-PLAN.md — {grand} khung, {len(by_page)} page")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
