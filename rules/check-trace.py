#!/usr/bin/env python3
"""rules/check-trace.py — kiểm tính truy vết (Chuẩn chung C7).

Kiểm 4 thứ:
  1. Mọi test case `4-TC-xx` trong docs/test-cases.md có cột nguồn trỏ về
     `1-US-xx` và/hoặc `1-UC-xx` CÓ THẬT (được định nghĩa ở file gốc).
  2. Mọi use case `1-UC-xx` có ít nhất 1 test loại `HP` (đường bình thường)
     — quy tắc "happy path trước, bao phủ sau".
  3. Mọi user story `1-US-xx` trỏ về ít nhất 1 use case có thật (không mồ côi).
  4. Mọi use case có ít nhất 1 user story trỏ tới (không mồ côi ngược).

Exit 0 = sạch · 1 = vi phạm · 2 = chưa kiểm được.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CODE_PAT = r"[1-4]-(?:PS|SH|UC|US|E|IN|PN|FL|SC|ST|CP|TK|TC|AI|RG)-\d{2}"
UC_RE = re.compile(r"\b1-UC-\d{2}\b")

# Khai báo khoảng trống ĐÃ BIẾT: phải nằm trong file này với lý do.
# Định dạng: dòng chứa `KHONG-TEST: <mã> — <lý do>` hoặc `KHONG-STORY: <mã> — <lý do>`
KNOWN_GAP_RE = re.compile(r"^\s*(KHONG-TEST|KHONG-STORY|KHONG-HP):\s*(" + CODE_PAT + r")\s*[—-]\s*(.+)$")
US_RE = re.compile(r"\b1-US-\d{2}\b")
TC_RE = re.compile(r"\b4-TC-\d{2}\b")


def read(rel: str) -> str:
    p = ROOT / rel
    return p.read_text(encoding="utf-8") if p.exists() else ""


def defined_codes(text: str) -> set[str]:
    """Mã được định nghĩa: cột 1 của dòng bảng, hoặc tiêu đề."""
    out: set[str] = set()
    for line in text.splitlines():
        m = re.match(r"^\|\s*`(" + CODE_PAT + r")`", line)
        if m:
            out.add(m.group(1))
            continue
        m = re.match(r"^#+.*?\b(" + CODE_PAT + r")\b", line)
        if m:
            out.add(m.group(1))
        m = re.match(r"^-\s*\[[ x!]\]\s*\*\*(" + CODE_PAT + r")\*\*", line)
        if m:
            out.add(m.group(1))
    return out


def known_gaps() -> dict[str, dict[str, str]]:
    """Đọc khai báo khoảng trống đã biết từ docs/test-cases.md."""
    out: dict[str, dict[str, str]] = {}
    for line in read("docs/test-cases.md").splitlines():
        m = KNOWN_GAP_RE.match(line)
        if m:
            out.setdefault(m.group(2), {})[m.group(1)] = m.group(3).strip()
    return out


def main() -> int:
    gaps = known_gaps()
    uc_text = read("ux/use-cases.md")
    us_text = read("ux/user-stories.md")
    tc_text = read("docs/test-cases.md")

    if not (uc_text and us_text and tc_text):
        missing = [
            r
            for r in ("ux/use-cases.md", "ux/user-stories.md", "docs/test-cases.md")
            if not (ROOT / r).exists()
        ]
        print(f"CHUA KIEM DUOC: thieu file {missing}", file=sys.stderr)
        return 2

    uc_defined = {c for c in defined_codes(uc_text) if c.startswith("1-UC")}
    us_defined = {c for c in defined_codes(us_text) if c.startswith("1-US")}
    tc_defined = {c for c in defined_codes(tc_text) if c.startswith("4-TC")}

    problems: list[str] = []

    # --- 1. Mỗi TC có nguồn thật ---
    tc_rows = 0
    tc_sources: dict[str, tuple[set[str], set[str], str]] = {}
    for line in tc_text.splitlines():
        m = re.match(r"^\|\s*`(4-TC-\d{2})`\s*\|(.*)$", line)
        if not m:
            continue
        code, rest = m.group(1), m.group(2)
        tc_rows += 1
        cells = [c.strip() for c in rest.split("|")]
        src_us, src_uc = set(), set()
        for cell in cells[:2]:
            src_us |= set(US_RE.findall(cell))
            src_uc |= set(UC_RE.findall(cell))
        # Loại test nằm ở cột "Loại" (cột thứ 4 sau khi tách)
        kind = ""
        for cell in cells:
            if cell in ("HP", "AF", "ER", "BV", "EP", "ST", "AC", "PF"):
                kind = cell
                break
        tc_sources[code] = (src_us, src_uc, kind)

        for us in src_us:
            if us not in us_defined:
                problems.append(f"NGUON MA: {code} tro toi {us} khong ton tai")
        for uc in src_uc:
            if uc not in uc_defined:
                problems.append(f"NGUON MA: {code} tro toi {uc} khong ton tai")
        if not src_us and not src_uc:
            if "KHONG-STORY" in gaps.get(code, {}):
                continue
            problems.append(f"THIEU NGUON: {code} khong tro toi user story nao")
        if not kind:
            problems.append(f"THIEU LOAI: {code} khong ghi loai (HP/AF/ER/...)")

    # --- 2. Mỗi UC có ít nhất 1 test HP ---
    uc_with_hp = {
        uc
        for _tc, (_us, ucs, kind) in tc_sources.items()
        if kind == "HP"
        for uc in ucs
    }
    # Fallback: quét cả text (bảng bao phủ §2.1)
    for line in tc_text.splitlines():
        m = re.match(r"^\|\s*`(1-UC-\d{2})`.*$", line)
        if m:
            # Dòng bảng bao phủ: cột chứa `4-TC-xx` ✅ là HP
            if "✅" in line:
                uc_with_hp.add(m.group(1))

    for uc in sorted(uc_defined):
        if uc not in uc_with_hp:
            if "KHONG-HP" in gaps.get(uc, {}) or "KHONG-TEST" in gaps.get(uc, {}):
                print(f"  [da biet] {uc}: thieu HP — {gaps[uc].get('KHONG-HP', '')}")
                continue
            problems.append(f"THIEU HP: {uc} khong co test duong binh thuong (HP) nao")

    # --- 3. Mỗi US trỏ về UC thật ---
    for line in us_text.splitlines():
        m = re.match(r"^\|\s*`(1-US-\d{2})`\s*\|(.*)$", line)
        if not m:
            continue
        code, rest = m.group(1), m.group(2)
        ucs = set(UC_RE.findall(rest))
        if not ucs:
            problems.append(f"US MO COI: {code} khong tro toi use case nao")
        for uc in ucs:
            if uc not in uc_defined:
                problems.append(f"NGUON MA: {code} tro toi {uc} khong ton tai")

    # --- 4. Mỗi UC có user story trỏ tới ---
    uc_with_us: set[str] = set()
    for line in us_text.splitlines():
        if not re.match(r"^\|\s*`1-US-\d{2}`", line):
            continue
        uc_with_us |= set(UC_RE.findall(line))

    for uc in sorted(uc_defined):
        if uc not in uc_with_us:
            if "KHONG-STORY" in gaps.get(uc, {}):
                print(f"  [da biet] {uc}: thieu user story — {gaps[uc]['KHONG-STORY']}")
                continue
            problems.append(f"UC MO COI: {uc} khong co user story nao tro toi")

    print(f"Use case   : {len(uc_defined)}")
    print(f"User story : {len(us_defined)}")
    print(f"Test case  : {len(tc_defined)} (dong bang: {tc_rows})")

    if problems:
        print(f"\n{len(problems)} VI PHAM:")
        for p in problems:
            print(f"  - {p}")
        return 1

    print("\nSACH: moi TC co nguon that, moi UC co HP, khong UC/US mo coi.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
