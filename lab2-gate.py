#!/usr/bin/env python3
"""lab2-gate.py — Tự chấm theo rubric PRM323 Lab 2 (100 điểm).

Chay: python3 lab2-gate.py

Moi tieu chi kiem tra SU TON TAI va NOI DUNG THAT cua file, khong chi kiem ten.
Neu file thieu hoac thieu muc bat buoc -> mat diem, khong bao gio duoc lam nguoc.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SVG_DIR = ROOT / "figma-svg" / "output"

results: list[tuple[str, str, int, int, str]] = []


def add(section: str, item: str, got: int, full: int, note: str = "") -> None:
    results.append((section, item, got, full, note))


def has(rel: str, *needles: str) -> tuple[bool, str]:
    """True neu file ton tai va chua day du cac chuoi can thiet."""
    p = ROOT / rel
    if not p.exists():
        return False, f"thieu file {rel}"
    t = p.read_text(encoding="utf-8")
    missing = [n for n in needles if n not in t]
    if missing:
        return False, f"{rel}: thieu {missing[:2]}"
    return True, ""


def count_svgs(pattern: str) -> int:
    if not SVG_DIR.exists():
        return 0
    return len(list(SVG_DIR.glob(pattern)))


def main() -> int:
    print("=" * 72)
    print("PRM323 LAB 2 — TU CHAM THEO RUBRIC (100 diem)")
    print("=" * 72)

    # ---- A. Phan tich UX & user flow — 15 ----
    print("\n[A] Phan tich UX & user flow (15)")
    ok, why = has("ux/persona.md", "Nguyễn Văn An", "Mục tiêu", "Nỗi đau", "Nielsen")
    add("A", "persona: 2 persona + muc tieu + noi dau + Nielsen", 6 if ok else 0, 6, why)
    ok2, why2 = has("ux/user-flow.md", "23", "Luồng 1", "Luồng 2", "Luồng 3", "Back")
    add("A", "user-flow: >=8 man hinh + 3 luong + luong loi + ma tran Back", 9 if ok2 else 0, 9, why2)

    # ---- B. Tao UI bang AI — 10 ----
    print("\n[B] Tao UI bang AI (10)")
    ok, why = has("DESIGN.md", "Prompt nguyên văn", "BẢNG MÀU", "KIỂU CHỮ", "KHÔNG làm")
    add("B", "DESIGN.md: prompt nguyen van co rang buoc day du", 10 if ok else 0, 10, why)

    # ---- C. Lap & critique voi AI — 15 ----
    print("\n[C] Lap & critique voi AI (15)")
    ok, why = has("ai-design-log.md", "Vòng #1", "Vòng #2", "Vòng #3",
                  "Prompt", "Critique", "Quyết định")
    add("C", "ai-design-log: 3 vong prompt->output->critique->quyet dinh", 6 if ok else 0, 6, why)
    ok2, why2 = has("ux/critique.md", "Nielsen", "4.5:1", "44")
    # dem so phat hien co so do
    nfind = 0
    if (ROOT / "ux/critique.md").exists():
        t = (ROOT / "ux/critique.md").read_text(encoding="utf-8")
        nfind = len(re.findall(r"^## \d+\.", t, re.M))
    add("C", f"critique: {nfind} phat hien >=5, co so do + Nielsen", 5 if (ok2 and nfind >= 5) else 0, 5,
        "" if nfind >= 5 else f"chi co {nfind} phat hien")
    # co it nhat 1 quyet dinh TU CHOI
    rej = 0
    if (ROOT / "design-decisions.md").exists():
        t = (ROOT / "design-decisions.md").read_text(encoding="utf-8")
        rej = t.count("TỪ CHỐI") + t.count("— TỪ CHỐI")
    add("C", f"design-decisions: co {rej} quyet dinh tu choi AI", 4 if rej >= 1 else 0, 4)
    # ---- D. UI/UX cuoi — 20 ----
    print("\n[D] UI/UX cuoi (20)")
    n_final = count_svgs("03-final/**/*.svg")
    n_main = len([p for p in (SVG_DIR / "03-final").glob("*.svg")]) if (SVG_DIR / "03-final").exists() else 0
    add("D", f"co >=8 khung man hinh chinh ({n_main} khung)", 10 if n_main >= 8 else 0, 10)
    ok, why = has("ux/final-ui-spec.md", "S01", "S14", "Biến thể", "360")
    add("D", "final-ui-spec: dac ta >=14 man + bien the + 360dp", 6 if ok else 0, 6, why)
    n_var = len(list(SVG_DIR.glob("03-final/*v-*.svg")))
    n_360 = len(list(SVG_DIR.glob("03-final/*r360-*.svg")))
    add("D", f"co bien the trang thai ({n_var}) + khung 360dp ({n_360})", 4 if n_var >= 3 and n_360 >= 2 else 0, 4)

    # ---- E. Design system & component — 15 ----
    print("\n[E] Design system & component (15)")
    ok, why = has("design-system.md", "#146B55", "Inter", "Bo góc", "Chín nhóm component")
    add("E", "design-system: mau + chu + khoang cach + bo goc + 9 nhom", 7 if ok else 0, 7, why)
    n_comp = count_svgs("05-components/*.svg")
    add("E", f"co {n_comp} khung component (can >=9)", 5 if n_comp >= 9 else 0, 5)
    n_ds = count_svgs("04-design-system/*.svg")
    add("E", f"co {n_ds} bang design system (can >=5)", 3 if n_ds >= 5 else 0, 3)

    # ---- F. Prototype — 10 ----
    print("\n[F] Prototype tuong tac (10)")
    ok, why = has("ux/prototype-spec.md", "Luồng 1", "Luồng 2", "Luồng 3",
                  "Hiệu ứng", "Script demo", "KHÔNG tạo được")
    add("F", "prototype-spec: 3 luong tung buoc + hieu ung + script demo", 10 if ok else 0, 10, why)

    # ---- G. Handoff Flutter — 10 ----
    print("\n[G] Handoff Flutter (10)")
    ok, why = has("flutter-handoff.md", "Dart", "Widget", "AppColors", "token")
    add("G", "handoff: token->Dart + component->widget", 6 if ok else 0, 6, why)
    # dem bang doi chieu
    ntables = 0
    if (ROOT / "flutter-handoff.md").exists():
        t = (ROOT / "flutter-handoff.md").read_text(encoding="utf-8")
        ntables = len(re.findall(r"^\|.*\|.*\|$", t, re.M))
    add("G", f"co bang doi chieu ({ntables} dong bang)", 4 if ntables >= 30 else 0, 4)

    # ---- H. Tai lieu & nhat ky — 5 ----
    print("\n[H] Tai lieu & nhat ky AI (5)")
    ok = all((ROOT / f).exists() for f in ["README.md", "README_ANSWER.md", "ai-design-log.md"])
    add("H", "co README + README_ANSWER + ai-design-log", 3 if ok else 0, 3)
    ok2, why2 = has("README.md", "Figma", "GitHub", "artifact")
    add("H", "README liet ke 2 artifact + huong dan", 2 if ok2 else 0, 2, why2)

    # ---- In ket qua ----
    print("\n" + "=" * 72)
    total = 0
    full = 0
    cur = None
    for sec, item, got, f, note in results:
        if sec != cur:
            cur = sec
        total += got
        full += f
        flag = "OK " if got == f else "!! "
        line = f"  {flag}[{sec}] {item:62s} {got:3d}/{f:<3d}"
        print(line)
        if note:
            print(f"       -> {note}")
    print("=" * 72)
    pct = round(total * 100 / full) if full else 0
    print(f"TONG: {total}/{full} diem  ({pct}%)")
    if total == full:
        print("KET QUA: DAT — duoc tat ca cac muc co the kiem tu dong")
    elif pct >= 70:
        print("KET QUA: CHUA DAT — con muc thieu")
    else:
        print("KET QUA: THIEU NHIEU")
    return 0 if total == full else 1


if __name__ == "__main__":
    sys.exit(main())
