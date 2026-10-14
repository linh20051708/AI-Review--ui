#!/usr/bin/env python3
"""rules/check-ids.py — kiểm mã định danh (ID scheme) toàn repo.

Kiểm 3 thứ:
  1. Mọi mã nhắc tới trong file .md đều có ĐỊNH NGHĨA ở đúng file của loại nó.
  2. Không có mã mồ côi (nhắc tới nhưng không định nghĩa ở đâu).
  3. Tầng của file không được ĐỊNH NGHĨA LẠI mã tầng thấp hơn.

Định nghĩa nằm ở: nơi mã xuất hiện trong bảng "| `MÃ`" (đầu dòng bảng) hoặc
tiêu đề "### `MÃ`".

Exit 0 = sạch · 1 = vi phạm · 2 = chưa kiểm được.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Loại -> (tầng, file được phép định nghĩa)
KINDS: dict[str, tuple[int, tuple[str, ...]]] = {
    "PS": (1, ("ux/persona.md",)),
    "SH": (1, ("ux/stakeholder-map.md", "ux/use-cases.md")),
    "UC": (1, ("ux/use-cases.md",)),
    "US": (1, ("ux/user-stories.md",)),
    "E": (1, ("ux/affinity-board.md", "ux/persona-decisions.md")),
    "IN": (1, ("ux/affinity-board.md", "ux/persona-decisions.md")),
    "PN": (1, ("ux/persona-decisions.md",)),
    "FL": (2, ("ux/user-flow.md",)),
    "SC": (3, ("ux/final-ui-spec.md", "ux/user-flow.md")),
    "ST": (3, ("ux/final-ui-spec.md",)),
    "CP": (3, ("design-system.md",)),
    "TK": (3, ("design-system.md",)),
    "TC": (4, ("docs/test-cases.md",)),
    "AI": (4, ("ai-design-log.md",)),
    "RG": (4, ("rules/QUALITY-RULES.md",)),
}

# Tầng của folder chứa file
def folder_layer(rel: str) -> int | None:
    if rel.startswith("ux/"):
        return None  # ux/ chứa cả tầng 1, 2, 3 -> không suy từ folder
    if rel.startswith(("docs/", "rules/", "verify/")):
        return 4
    if rel in ("design-system.md", "ai-design-log.md"):
        return 4 if rel == "ai-design-log.md" else 3
    if rel.startswith("figma-svg/"):
        return 3
    return None


CODE_RE = re.compile(r"\b([1-4])-(PS|SH|UC|US|E|IN|PN|FL|SC|ST|CP|TK|TC|AI|RG)-(\d{2})\b")
CODE_PAT = r"[1-4]-(?:PS|SH|UC|US|E|IN|PN|FL|SC|ST|CP|TK|TC|AI|RG)-\d{2}"
# Mã được ĐỊNH NGHĨA, 3 dạng:
#   | `4-TC-01` | ...        (cột đầu bảng)
#   ### `1-UC-05` — ...      (tiêu đề)
#   - [x] **4-RG-01** — ...  (mục checkbox)
DEF_TABLE_RE = re.compile(r"^\|\s*`(" + CODE_PAT + r")`")
DEF_HEAD_RE = re.compile(r"^#+.*?\b(" + CODE_PAT + r")\b")
DEF_MARK_RE = re.compile(r"^-\s*\[[ x!]\]\s*\*\*(" + CODE_PAT + r")\*\*")


SKIP_DIRS = {"node_modules", "build", ".dart_tool", ".git", ".company", "app", "flutter_app"}

# File chi de TRA CUU: xuat hien ma o cot dau bang la de tro, KHONG phai dinh nghia.
LOOKUP_ONLY = {"docs/traceability.md", "docs/ARCHITECTURE-LAYERS.md", "rules/ID-SCHEME.md"}


def owns_kind(rel: str, kind: str) -> bool:
    """File này có chịu trách nhiệm ĐỊNH NGHĨA loại `kind` không?"""
    if rel in LOOKUP_ONLY:
        return False
    return rel in KINDS[kind][1]


def md_files() -> list[Path]:
    out = []
    for p in ROOT.rglob("*.md"):
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        out.append(p)
    return sorted(out)


def main() -> int:
    files = md_files()
    if not files:
        print("CHUA KIEM DUOC: khong tim thay file .md nao", file=sys.stderr)
        return 2

    defined: dict[str, str] = {}  # mã -> file định nghĩa
    head_defined: dict[str, str] = {}  # mã định nghĩa bằng TIÊU ĐỀ
    mentioned: dict[str, set[str]] = {}  # mã -> các file nhắc tới
    problems: list[str] = []

    for path in files:
        rel = path.relative_to(ROOT).as_posix()
        for line in path.read_text(encoding="utf-8").splitlines():
            head_m = DEF_HEAD_RE.match(line)
            is_lookup = rel in LOOKUP_ONLY
            # Bảng ở file khác LOOKUP_ONLY: dòng "| `MÃ` | ..." là ĐỊNH NGHĨA.
            table_m = None if is_lookup else DEF_TABLE_RE.match(line)
            for m in (table_m, head_m, DEF_MARK_RE.match(line)):
                if m:
                    code = m.group(1)
                    if not owns_kind(rel, code.split("-")[1]):
                        continue
                    if code in defined and defined[code] != rel:
                        problems.append(
                            f"MA DINH NGHIA 2 NOI: {code} o ca {defined[code]} va {rel}"
                        )
                    defined[code] = rel
                    if m is head_m:
                        head_defined[code] = rel
            for m in CODE_RE.finditer(line):
                code = m.group(0)
                mentioned.setdefault(code, set()).add(rel)

    # 1. Kiểm mã được định nghĩa ở đúng file của loại
    for code, rel in defined.items():
        kind = code.split("-")[1]
        layer, allowed = KINDS[kind]
        if rel not in allowed:
            problems.append(
                f"SAI FILE DINH NGHIA: {code} dinh nghia o {rel}, phai o {allowed}"
            )

    # 2. Mã mồ côi: nhắc tới nhưng không định nghĩa
    for code, where in sorted(mentioned.items()):
        if code not in defined:
            listing = ", ".join(sorted(where)[:3])
            problems.append(f"MA MO COI: {code} duoc nhac o {listing} nhung khong dinh nghia")

    # 3. Tầng không được định nghĩa lại mã tầng thấp hơn.
    #    Chỉ xét mã định nghĩa bằng TIÊU ĐỀ (## ...) — đó mới là "định nghĩa" thật.
    #    Bảng tra (| `MÃ` |) và mục checkbox chỉ LIỆT KÊ, không tính.
    for code, rel in head_defined.items():
        kind = code.split("-")[1]
        code_layer = KINDS[kind][0]
        file_layer = folder_layer(rel)
        if file_layer is not None and file_layer > code_layer:
            problems.append(
                f"DINH NGHIA LAI TANG THAP: {code} (tang {code_layer}) "
                f"dinh nghia bang tieu de trong {rel} (tang {file_layer})"
            )

    print(f"Quet {len(files)} file .md")
    print(f"  Ma dinh nghia : {len(defined)}")
    print(f"  Ma nhac toi   : {len(mentioned)}")

    if problems:
        print(f"\n{len(problems)} VI PHAM:")
        for p in problems:
            print(f"  - {p}")
        return 1

    print("\nSACH: moi ma deu co dinh nghia, dung file, dung tang.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
