#!/usr/bin/env python3
"""rules/check-all.py — cổng tổng cho bộ quy tắc.

Chạy mọi cổng con và tổng hợp. Exit 0 chỉ khi TẤT CẢ cổng con exit 0.

Dùng:
    python3 rules/check-all.py
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RULES = ROOT / "rules"

GATES = [
    ("Mã định danh", "check-ids.py"),
    ("Truy vết", "check-trace.py"),
    ("Tầng / folder", "check-layers.py"),
]

# Rò ký tự CJK vào văn bản tiếng Việt là lỗi đã gặp nhiều lần.
CJK_RE = re.compile(r"[\u4e00-\u9fff]")
CJK_SKIP = {"node_modules", "build", ".dart_tool", ".git", ".company", "app", "flutter_app"}


def run_gate(name: str, script: str) -> tuple[bool, str]:
    path = RULES / script
    if not path.exists():
        return False, f"CHUA KIEM DUOC: thieu {script}"
    proc = subprocess.run(
        [sys.executable, str(path)],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    out = (proc.stdout + proc.stderr).strip()
    return proc.returncode == 0, out


def check_cjk() -> tuple[bool, str]:
    hits: list[str] = []
    count = 0
    for path in sorted(ROOT.rglob("*.md")):
        rel = path.relative_to(ROOT)
        if any(p in CJK_SKIP for p in rel.parts):
            continue
        count += 1
        text = path.read_text(encoding="utf-8")
        for i, line in enumerate(text.splitlines(), 1):
            if CJK_RE.search(line):
                found = CJK_RE.findall(line)
                hits.append(f"{rel.as_posix()}:{i} -> {''.join(found[:5])}")
    if hits:
        return False, "\n".join(hits)
    return True, f"{count} file markdown — 0 rò CJK"


def main() -> int:
    print("=" * 62)
    print("CỔNG TỔNG — BỘ QUY TẮC LAB 2")
    print("=" * 62)

    all_ok = True
    for name, script in GATES:
        ok, out = run_gate(name, script)
        mark = "OK  " if ok else "FAIL"
        print(f"\n[{mark}] {name}  ({script})")
        for line in out.splitlines():
            print(f"        {line}")
        if not ok:
            all_ok = False

    ok, out = check_cjk()
    mark = "OK  " if ok else "FAIL"
    print(f"\n[{mark}] Rò CJK")
    for line in out.splitlines():
        print(f"        {line}")
    if not ok:
        all_ok = False

    print("\n" + "=" * 62)
    print("KẾT QUẢ: SẠCH toàn bộ" if all_ok else "KẾT QUẢ: CÓ VI PHẠM")
    print("=" * 62)
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
