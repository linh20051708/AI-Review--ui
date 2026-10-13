#!/usr/bin/env python3
"""set-links.py — Dien link GitHub va Figma vao README.md + README_ANSWER.md.

Dung:
    python3 set-links.py --github https://github.com/user/repo \
                         --figma  https://www.figma.com/design/XXXX/PRM323-Lab2

Khong truyen tham so: chi in trang thai hien tai cua cac cho trong.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PLACEHOLDER = re.compile(r"<điền link>|`<điền link>`")

TARGETS = [
    ("README.md", "GitHub repository"),
    ("README.md", "Figma file (6 page)"),
    ("README_ANSWER.md", "GitHub repository"),
    ("README_ANSWER.md", "Figma file"),
]


def show() -> int:
    print("Trang thai cac cho can dien link:\n")
    n = 0
    for rel in ["README.md", "README_ANSWER.md"]:
        t = (ROOT / rel).read_text(encoding="utf-8")
        for i, line in enumerate(t.split("\n"), 1):
            if not PLACEHOLDER.search(line):
                continue
            # bo qua dong huong dan (khong phai o trong bang)
            if "thay hai chỗ" in line or line.strip().startswith("Sau đó"):
                continue
            n += 1
            print(f"  [{rel}:{i}] {line.strip()}")
    print(f"\nTong: {n} cho chua dien")
    return 0 if n == 0 else 1


def fill(kind: str, url: str) -> int:
    changed = 0
    for rel in ["README.md", "README_ANSWER.md"]:
        p = ROOT / rel
        t = p.read_text(encoding="utf-8")
        lines = t.split("\n")
        for i, line in enumerate(lines):
            if not PLACEHOLDER.search(line):
                continue
            if "thay hai chỗ" in line or line.strip().startswith("Sau đó"):
                continue
            # chi dien dong co nhan dung loai
            low = line.lower()
            wants_github = "github" in low
            wants_figma = "figma" in low
            if kind == "github" and not wants_github:
                continue
            if kind == "figma" and not wants_figma:
                continue
            lines[i] = PLACEHOLDER.sub(url, line)
            changed += 1
        p.write_text("\n".join(lines), encoding="utf-8")
    print(f"Da dien {changed} cho bang {kind}: {url}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--github")
    ap.add_argument("--figma")
    a = ap.parse_args()

    if not a.github and not a.figma:
        return show()

    if a.github:
        if "github.com" not in a.github:
            print(f"CANH BAO: '{a.github}' khong phai link GitHub — van dien")
        fill("github", a.github)
    if a.figma:
        if "figma.com" not in a.figma:
            print(f"CANH BAO: '{a.figma}' khong phai link Figma — van dien")
        fill("figma", a.figma)

    print()
    return show()


if __name__ == "__main__":
    sys.exit(main())
