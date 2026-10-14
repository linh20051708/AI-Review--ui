#!/usr/bin/env python3
"""rules/install-hooks.py — bật hook `commit-msg` kiểm mã SKU (CMPlan mục 09).

Vì sao cần script cài: hook trong `.git/hooks/` **không** được commit, nên mỗi
bản clone đều mất. Script này ghi lại hook trỏ về `rules/check-commit-msg.py`
(bản nằm trong repo, có version) để luật đi theo code.

Chạy một lần sau khi clone:

    python3 rules/install-hooks.py

Tắt lại:

    python3 rules/install-hooks.py --uninstall
"""

from __future__ import annotations

import os
import stat
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHECKER = ROOT / "rules" / "check-commit-msg.py"

HOOK_BODY = """#!/bin/sh
# Sinh boi rules/install-hooks.py — kiem thong diep commit theo ma SKU (CMPlan muc 09).
# Sua luat o rules/check-commit-msg.py, dung sua file nay.
exec python3 "$(git rev-parse --show-toplevel)/rules/check-commit-msg.py" "$1"
"""


def hooks_dir() -> Path | None:
    """Thư mục hook thật (tôn trọng core.hooksPath nếu có)."""
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--git-path", "hooks"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    p = Path(out.stdout.strip())
    return p if p.is_absolute() else (ROOT / p)


def main(argv: list[str]) -> int:
    if not CHECKER.is_file():
        print(f"LOI: khong thay {CHECKER.relative_to(ROOT)}", file=sys.stderr)
        return 2

    hd = hooks_dir()
    if hd is None:
        print("LOI: khong phai git repo (hoac thieu git)", file=sys.stderr)
        return 2

    hook = hd / "commit-msg"
    uninstall = "--uninstall" in argv[1:]

    if uninstall:
        if hook.exists():
            hook.unlink()
            print(f"Da go hook: {hook}")
        else:
            print("Khong co hook de go.")
        return 0

    hd.mkdir(parents=True, exist_ok=True)
    if hook.exists() and "install-hooks.py" not in hook.read_text(errors="replace"):
        print(f"CANH BAO: {hook} da ton tai va khong phai do script nay tao.")
        print("  Khong ghi de. Xoa thu cong roi chay lai neu chac chan.")
        return 1

    hook.write_text(HOOK_BODY, encoding="utf-8")
    hook.chmod(hook.stat().st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)

    print(f"Da bat hook: {hook}")
    print(f"  -> goi {CHECKER.relative_to(ROOT)}")
    print("\nThu: git commit -m 'feat(lab2): sai dinh dang'  (phai bi chan)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
