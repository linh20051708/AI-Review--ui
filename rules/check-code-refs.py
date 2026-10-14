#!/usr/bin/env python3
"""rules/check-code-refs.py — kiểm tài liệu trỏ tới file code CÓ THẬT.

Lý do tồn tại: khi viết tài liệu, tên file dễ bị bịa (đã xảy ra 6 lần:
`AiResultPage.tsx`, `ReviewListPage.tsx`, `ProjectsPage.tsx`... không tồn tại).
Tài liệu trỏ tới file không có là **tham chiếu giả** — nguy hiểm hơn cả thiếu tài liệu.

Kiểm:
  1. Mọi tham chiếu dạng `app/.../X.tsx` hoặc `flutter_app/.../x.dart` phải tồn tại.
  2. Mọi tên file `.tsx`/`.ts` được nhắc trong backtick, nếu trùng dạng tên trang
     (`*Page.tsx`, `*Store.ts`, ...), phải khớp một file thật trong repo.

Exit 0 = sạch · 1 = có tham chiếu giả · 2 = chưa kiểm được.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# File tài liệu cần kiểm (không kiểm chính script này)
DOC_GLOBS = ("rules/*.md", "docs/*.md", "ux/*.md", "*.md")

SKIP_DIRS = {"node_modules", "build", ".dart_tool", ".git", ".company"}

# Tham chiếu đường dẫn đầy đủ
PATH_REF_RE = re.compile(r"`((?:app|flutter_app)/[\w/\.\-]+\.(?:tsx?|dart))`")
# Tên file trần trong backtick (chỉ loại có khả năng là file thật)
BARE_REF_RE = re.compile(r"`([A-Za-z][\w]*\.(?:tsx|ts|dart))`")

# Hậu tố cho thấy đây là tên file cụ thể (không phải ví dụ chung)
FILE_LIKE_SUFFIXES = (
    "Page.tsx", "Store.ts", "Navigation.tsx", "Card.tsx", "Section.tsx",
    "router.tsx", "config.ts", "time.ts", "academic.ts",
    "smartFilter.ts", "mockData.ts", "types.ts", "index.ts",
)


def real_files() -> tuple[set[str], set[str]]:
    """Trả (đường dẫn tương đối, tập basename) của mọi file code thật."""
    rel_paths: set[str] = set()
    basenames: set[str] = set()
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        if p.suffix not in (".tsx", ".ts", ".dart"):
            continue
        rel = p.relative_to(ROOT).as_posix()
        rel_paths.add(rel)
        basenames.add(p.name)
    return rel_paths, basenames


def main() -> int:
    if not (ROOT / "app" / "src").exists() and not (ROOT / "flutter_app" / "lib").exists():
        print("CHUA KIEM DUOC: khong thay app/src hoac flutter_app/lib", file=sys.stderr)
        return 2

    rel_paths, basenames = real_files()
    if not rel_paths:
        print("CHUA KIEM DUOC: khong tim thay file code nao", file=sys.stderr)
        return 2

    docs: list[Path] = []
    for g in DOC_GLOBS:
        docs.extend(ROOT.glob(g))
    docs = sorted({d for d in docs if d.is_file()})

    problems: list[str] = []
    checked_refs = 0

    for doc in docs:
        rel_doc = doc.relative_to(ROOT).as_posix()
        text = doc.read_text(encoding="utf-8")

        for m in PATH_REF_RE.finditer(text):
            checked_refs += 1
            ref = m.group(1)
            if ref not in rel_paths:
                problems.append(f"THAM CHIEU GIA: {rel_doc} -> `{ref}` khong ton tai")

        for m in BARE_REF_RE.finditer(text):
            name = m.group(1)
            if not name.endswith(FILE_LIKE_SUFFIXES):
                continue
            checked_refs += 1
            if name not in basenames:
                problems.append(
                    f"TEN FILE BIA: {rel_doc} -> `{name}` khong khop file nao trong repo"
                )

    print(f"Quet {len(docs)} file tai lieu")
    print(f"  File code that   : {len(rel_paths)}")
    print(f"  Tham chieu code  : {checked_refs}")

    if problems:
        print(f"\n{len(problems)} VI PHAM:")
        for p in sorted(set(problems)):
            print(f"  - {p}")
        return 1

    print("\nSACH: moi tham chieu code trong tai lieu deu co that.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
