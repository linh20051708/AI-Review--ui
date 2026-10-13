"""Kiem dinh bo SVG — XML hop le, khong CJK, khong tinh nang Figma cat bo, khong tran khung.

Chay: python3 check.py
"""
from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"

CJK = re.compile(r"[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")
# Figma bo qua khi dan SVG: filter/mask/gradient/clip-path (theo tai lieu Figma).
BAD = re.compile(r"<(filter|mask|clipPath|linearGradient|radialGradient|foreignObject)\b")
BAD_ATTR = re.compile(r"\b(filter|mask|clip-path)\s*=")
URL_REF = re.compile(r"url\(#")

CW = 0.52  # em/ky tu trung binh do bang Chrome that (Inter 400)


def measure(txt, size, weight):
    """Uoc luong be rong chu: he so day hon khi weight cao."""
    k = CW * (1.0 + 0.06 * (int(weight or 400) - 400) / 100)
    return len(txt) * size * k


def check_file(p: Path):
    errs = []
    raw = p.read_text(encoding="utf-8")

    # 1. CJK
    if CJK.search(raw):
        errs.append(f"CJK leak: {set(CJK.findall(raw))}")

    # 2. XML hop le
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as e:
        errs.append(f"XML loi: {e}")
        return errs

    # 3. tinh nang Figma cat bo
    for tag in BAD.findall(raw):
        errs.append(f"the bi cat bo: <{tag}>")
    for a in BAD_ATTR.findall(raw):
        errs.append(f"thuoc tinh bi cat bo: {a}")
    if URL_REF.search(raw):
        errs.append("tham chieu url(#...)")

    # 4. tran khung: moi <text> phai nam trong viewBox
    vb = root.get("viewBox", "")
    if vb:
        _, _, vw, vh = [float(x) for x in vb.split()]
        for t in root.iter("{http://www.w3.org/2000/svg}text"):
            try:
                x = float(t.get("x", 0))
                y = float(t.get("y", 0))
            except ValueError:
                errs.append(f"toa do text khong phai so: {t.get('x')},{t.get('y')}")
                continue
            size = float(t.get("font-size", 14))
            s = t.text or ""
            anchor = t.get("text-anchor", "start")
            w = measure(s, size, t.get("font-weight", "400"))
            if anchor == "middle":
                x1, x2 = x - w / 2, x + w / 2
            elif anchor == "end":
                x1, x2 = x - w, x
            else:
                x1, x2 = x, x + w
            if x2 > vw + 1 or x1 < -1:
                errs.append(f"text tran ngang: '{s[:30]}' x=[{x1:.0f},{x2:.0f}] > {vw:.0f}")
            if y > vh + 1 or y < 0:
                errs.append(f"text tran doc: '{s[:30]}' y={y:.0f} > {vh:.0f}")
    return errs


def main():
    files = sorted(OUT.rglob("*.svg"))
    if not files:
        print("Khong co file SVG nao")
        return 2
    total_err = 0
    bad_files = 0
    n_text = 0
    for p in files:
        errs = check_file(p)
        n_text += sum(1 for _ in p.read_text(encoding="utf-8").split("<text"))
        if errs:
            bad_files += 1
            total_err += len(errs)
            print(f"\n✗ {p.relative_to(OUT)}  ({len(errs)} loi)")
            for e in errs[:6]:
                print(f"    - {e}")
    print(f"\nKiem {len(files)} file · {n_text} doan text")
    if bad_files:
        print(f"KET QUA: {bad_files} file co loi, tong {total_err} loi")
        return 1
    print("SACH: XML hop le, khong CJK, khong tran khung, khong dung tinh nang bi cat bo")
    return 0


if __name__ == "__main__":
    sys.exit(main())
