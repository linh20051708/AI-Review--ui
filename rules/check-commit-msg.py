#!/usr/bin/env python3
"""rules/check-commit-msg.py — kiểm thông điệp commit theo mã SKU (CMPlan mục 09).

CMPlan yêu cầu commit gắn mã tầng/SKU để `git log` đọc được như mã kho hàng:
nhìn vào dòng đầu là biết commit đó thuộc tầng nào, module nào.

Định dạng bắt buộc:

    <type>(<LAYER>_<MODULE>[_USxx]): <mô tả>

  type    : feat | fix | docs | refactor | test | chore | perf | style
  LAYER   : 001 | 011 | 101 | 111 | 201 | 202   (6 mã hợp lệ của CMPlan)
  MODULE  : AUTH | DASH | REVIEW | SUBMIT | PROFILE | CORE | DOMAIN
  USxx    : tuỳ chọn — chỉ khi commit thuộc đúng một user story

Ví dụ hợp lệ:
    feat(011_REVIEW_US04): them nut phe duyet vao khong gian review
    docs(001_CORE): them CMPlan PRM393 va 140 test case
    fix(202_DOMAIN): sua hang doi khong day khi co mang tro lai

Ví dụ SAI:
    feat(lab2): ...                 -> thieu ma tang
    fix(review): ...                -> thieu ma tang dang 3 chu so
    update stuff                    -> khong co type/scope

Cách bật (một lần cho mỗi bản clone — hook trong .git/ không được commit):

    python3 rules/install-hooks.py

Kiểm thủ công một thông điệp:

    python3 rules/check-commit-msg.py "$(git log -1 --format=%B)"

Exit 0 = hợp lệ · 1 = sai định dạng · 2 = không kiểm được.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

VALID_LAYERS = {"001", "011", "101", "111", "201", "202"}
VALID_MODULES = {"AUTH", "DASH", "REVIEW", "SUBMIT", "PROFILE", "CORE", "DOMAIN"}
VALID_TYPES = {"feat", "fix", "docs", "refactor", "test", "chore", "perf", "style"}

# type(LAYER_MODULE[_USxx]): mo ta
SUBJECT_RE = re.compile(
    r"^(?P<type>[a-z]+)"
    r"\((?P<layer>\d{3})_(?P<module>[A-Z]+)(?:_US(?P<us>\d{2}))?\)"
    r": (?P<desc>.+)$"
)

# Thông điệp được miễn: commit merge, revert, và các commit cũ trước khi áp luật.
EXEMPT_RE = re.compile(r"^(Merge |Revert |Initial commit|chore: initial)", re.IGNORECASE)


def check(subject: str) -> tuple[bool, str]:
    s = subject.strip()
    if not s:
        return False, "thông điệp rỗng"
    if EXEMPT_RE.match(s):
        return True, "được miễn (merge/revert/khởi tạo)"

    m = SUBJECT_RE.match(s)
    if not m:
        return False, (
            "sai định dạng — cần `<type>(<LAYER>_<MODULE>[_USxx]): <mô tả>`\n"
            f"    nhận được: {s!r}"
        )

    t = m.group("type")
    layer = m.group("layer")
    module = m.group("module")

    if t not in VALID_TYPES:
        return False, f"type '{t}' không hợp lệ — dùng một trong {sorted(VALID_TYPES)}"
    if layer not in VALID_LAYERS:
        return False, f"mã tầng '{layer}' không hợp lệ — chỉ có {sorted(VALID_LAYERS)}"
    if module not in VALID_MODULES:
        return False, f"mã module '{module}' không hợp lệ — dùng một trong {sorted(VALID_MODULES)}"

    us = m.group("us")
    if us is not None and not (1 <= int(us) <= 14):
        return False, f"US{us} ngoài khoảng hợp lệ (01–14)"

    return True, f"hợp lệ: tầng {layer}, module {module}" + (f", US{us}" if us else "")


def main(argv: list[str]) -> int:
    # Git truyền đường dẫn file thông điệp (`$1` = .git/COMMIT_EDITMSG), KHÔNG
    # phải nội dung. Ca thật: truyền thẳng `$1` làm checker đọc chuỗi
    # ".git/COMMIT_EDITMSG" thành thông điệp -> chặn oan cả commit hợp lệ.
    if len(argv) > 1:
        arg = argv[1]
        p = Path(arg)
        text = p.read_text(encoding="utf-8", errors="replace") if p.is_file() else arg
    else:
        text = sys.stdin.read()

    if not text.strip():
        print("CHUA KIEM DUOC: khong co thong diep commit", file=sys.stderr)
        return 2

    # Đọc dòng đầu (subject); bỏ qua dòng comment của git.
    subject = ""
    for line in text.splitlines():
        if line.startswith("#"):
            continue
        if line.strip():
            subject = line
            break

    ok, msg = check(subject)
    if ok:
        print(f"OK: {msg}")
        return 0
    print(f"SAI: {msg}", file=sys.stderr)
    print(
        "\nĐịnh dạng đúng:\n"
        "    feat(011_REVIEW_US04): them nut phe duyet\n"
        "    docs(001_CORE): them CMPlan PRM393\n"
        "    fix(202_DOMAIN): sua hang doi khi co mang tro lai",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
