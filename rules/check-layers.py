#!/usr/bin/env python3
"""rules/check-layers.py — kiểm cấu trúc folder khớp tầng thông tin.

Quy tắc (docs/ARCHITECTURE-LAYERS.md §4):
  - Tầng 1, 2, 3 sống trong `ux/`, `design-system.md`, `figma-svg/`
  - Tầng 4 sống trong `docs/`, `rules/`, `verify/`
  - File ở tầng nào chỉ được ĐỊNH NGHĨA mã của tầng đó (hoặc tầng thấp hơn để tham chiếu)

Kiểm 2 thứ:
  1. Mọi file `.md` tài liệu nằm trong folder hợp lệ.
  2. Không có mã nào bị định nghĩa bằng TIÊU ĐỀ trong folder có tầng cao hơn tầng của mã.

Exit 0 = sạch · 1 = vi phạm · 2 = chưa kiểm được.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Folder hợp lệ cho tài liệu markdown (ngoài các file gốc repo)
ALLOWED_ROOTS = {"ux", "docs", "rules", "verify", "figma-svg", "ai-output", "facts"}

CODE_PAT = r"[1-4]-(?:PS|SH|UC|US|E|IN|PN|FL|SC|ST|CP|TK|TC|AI|RG)-\d{2}"

# Tầng sống ở folder nào
FOLDER_LAYER = {
    "ux": (1, 2, 3),
    # facts/ la BANG CHUNG THO do tu code that -> tang 1 (nguon goc)
    "facts": (1,),
    "docs": (4,),
    "rules": (4,),
    "verify": (4,),
}

SKIP_DIRS = {"node_modules", "build", ".dart_tool", ".git", ".company", "app", "flutter_app"}


def main() -> int:
    problems: list[str] = []
    checked = 0

    for path in sorted(ROOT.rglob("*.md")):
        rel = path.relative_to(ROOT)
        parts = rel.parts
        if any(p in SKIP_DIRS for p in parts):
            continue
        if len(parts) == 1:
            continue  # file gốc repo (README.md, DESIGN.md...) — ở gốc là hợp lệ
        top = parts[0]
        if top not in ALLOWED_ROOTS:
            problems.append(f"FOLDER LA: {rel.as_posix()} nam trong '{top}' khong thuoc tang nao")
            continue
        if top in FOLDER_LAYER:
            checked += 1
            text = path.read_text(encoding="utf-8")
            allowed = FOLDER_LAYER[top]
            for line in text.splitlines():
                m = re.match(r"^#+.*?\b(" + CODE_PAT + r")\b", line)
                if not m:
                    continue
                code = m.group(1)
                code_layer = int(code[0])
                if code_layer not in allowed:
                    problems.append(
                        f"DINH NGHIA LAI TANG THAP: {code} (tang {code_layer}) "
                        f"dinh nghia bang tieu de trong {rel.as_posix()} (tang {allowed})"
                    )

    print(f"Quet {checked} file trong folder co tang")

    if problems:
        print(f"\n{len(problems)} VI PHAM:")
        for p in problems:
            print(f"  - {p}")
        return 1

    print("\nSACH: file nam dung folder cua tang, khong dinh nghia lai tang thap.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
