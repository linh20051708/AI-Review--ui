#!/usr/bin/env python3
"""rules/check-trace-map.py — kiểm bảng truy vết dọc trong docs/CMPlan-MAP.md.

Vì sao có script này: bảng truy vết là chỗ dễ bịa nhất. Cột "Figma ID" và "Code
package" nghe rất cụ thể, nhưng trước đây KHÔNG cổng nào kiểm chúng có thật.
Đo 14/10/2026: 7 trong 14 dòng trỏ tới file/thư mục không tồn tại.

Script kiểm hai chiều cho từng dòng bảng:

  XUÔI (khai báo -> thực tế)
    - Use Case `1-UC-xx` phải được định nghĩa trong ux/use-cases.md
    - User Story `1-US-xx` phải được định nghĩa trong ux/user-stories.md
    - Persona `P0x` phải có trong ux/persona.md
    - Code package phải là thư mục CÓ THẬT dưới flutter_app/lib/
    - Mã `TC_USxx_*` phải xuất hiện trong docs/test-cases-cmplan.md

  NGƯỢC (thực tế -> khai báo)
    - Mỗi màn Flutter có thật phải được nhắc tới trong bảng (không có màn mồ côi)
    - Mỗi US có TC trong bảng TC phải có mặt trong bảng truy vết

Cột "Code package" được phép ghi `—` (chưa code) — đó là khai báo trung thực,
KHÔNG phải lỗi. Điều bị chặn là ghi một đường dẫn không tồn tại.

Exit 0 = sạch · 1 = vi phạm · 2 = chưa kiểm được.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "flutter_app" / "lib"
SVG_DIR = ROOT / "figma-svg" / "output" / "03-final"

MAP_FILE = "docs/CMPlan-MAP.md"
TC_FILE = "docs/test-cases-cmplan.md"
UC_FILE = "ux/use-cases.md"
US_FILE = "ux/user-stories.md"
PS_FILE = "ux/persona.md"

UC_RE = re.compile(r"^1-UC-\d{2}$")
US_RE = re.compile(r"^1-US-\d{2}$")
PS_RE = re.compile(r"^P\d{2}$")
TC_RE = re.compile(r"^TC_US(\d{2})_(\*|(?:HP|AP|BV|EX|UI)_\d{2})$")

# Ô đánh dấu "chưa có" — trung thực, không phải lỗi.
# So theo TIỀN TỐ vì ô thật có thể là `— *(chưa code)*`.
NONE_PREFIXES = ("—", "–", "-", "n/a", "(chưa có)", "chua co")


def is_none_mark(cell: str) -> bool:
    s = cell.strip().strip("`").strip().lower()
    return any(s.startswith(p) for p in NONE_PREFIXES)


def read(rel: str) -> str:
    p = ROOT / rel
    return p.read_text(encoding="utf-8") if p.exists() else ""


def defined_codes(text: str) -> set[str]:
    """Mã ở cột 1 dòng bảng, hoặc trong tiêu đề `# ... 1-UC-01 ...`."""
    out: set[str] = set()
    for line in text.splitlines():
        m = re.match(r"^\|\s*`([1-4]-(?:PS|SH|UC|US|E|IN|PN|FL|SC|ST|CP|TK|TC|AI|RG)-\d{2})`", line)
        if m:
            out.add(m.group(1))
            continue
        m = re.match(r"^#+.*?\b(1-(?:UC|US)-\d{2})\b", line)
        if m:
            out.add(m.group(1))
    return out


def parse_map() -> list[dict[str, str]]:
    """Đọc bảng truy vết: 8 cột, dòng có cột Use Case bắt đầu bằng `1-UC`."""
    rows: list[dict[str, str]] = []
    for line in read(MAP_FILE).splitlines():
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != 8:
            continue
        uc = cells[2].strip("`").strip()
        if not UC_RE.match(uc):
            continue
        rows.append(
            {
                "persona": cells[0].strip("`").strip(),
                "scenario": cells[1].strip("`").strip(),
                "uc": uc,
                "us": cells[3].strip("`").strip(),
                "figma": cells[4].strip("`").strip(),
                "svg": cells[5].strip("`").strip(),
                "code": cells[6].strip("`").strip(),
                "tc": cells[7].strip("`").strip(),
            }
        )
    return rows


def real_screens() -> set[str]:
    """Tên file màn hình Flutter có thật (bỏ phần mở rộng)."""
    if not LIB.is_dir():
        return set()
    return {p.stem for p in LIB.rglob("*.dart")}


def main() -> int:
    for r in (MAP_FILE, TC_FILE, UC_FILE, US_FILE, PS_FILE):
        if not (ROOT / r).exists():
            print(f"CHUA KIEM DUOC: thieu {r}", file=sys.stderr)
            return 2

    rows = parse_map()
    if not rows:
        print("CHUA KIEM DUOC: khong doc duoc dong nao trong bang truy vet", file=sys.stderr)
        return 2

    uc_defined = {c for c in defined_codes(read(UC_FILE)) if c.startswith("1-UC")}
    us_defined = {c for c in defined_codes(read(US_FILE)) if c.startswith("1-US")}
    ps_defined = set(re.findall(r"\bP\d{2}\b", read(PS_FILE)))
    tc_text = read(TC_FILE)
    us_with_tc = set(re.findall(r"TC_US(\d{2})_", tc_text))
    screens = real_screens()

    problems: list[str] = []
    declared_us: set[str] = set()
    declared_screens: set[str] = set()
    unverifiable_figma: list[str] = []

    for r in rows:
        tag = r["us"] or r["uc"]

        # --- persona ---
        for ps in re.findall(r"\bP\d{2}\b", r["persona"]):
            if ps not in ps_defined:
                problems.append(f"PERSONA MA: {tag} tro toi {ps} khong co trong {PS_FILE}")

        # --- use case / user story phai duoc dinh nghia ---
        if r["uc"] not in uc_defined:
            problems.append(f"UC MA: {tag} tro toi {r['uc']} khong co trong {UC_FILE}")
        if not US_RE.match(r["us"]):
            problems.append(f"US SAI DANG: {tag} cot User Story = '{r['us']}'")
        elif r["us"] not in us_defined:
            problems.append(f"US MA: {tag} tro toi {r['us']} khong co trong {US_FILE}")
        else:
            declared_us.add(r["us"])

        # --- code: '—' la trung thuc; duong dan phai la FILE co that ---
        # Đợt 13: cột code ghi đường dẫn từ GỐC REPO
        # (`flutter_app/lib/features/login/login_screen.dart`) cho rõ ràng.
        code_cell = r["code"].strip().strip("`")
        target = ROOT / code_cell
        if not is_none_mark(code_cell):
            if not target.is_file():
                problems.append(
                    f"CODE MA: {tag} tro toi '{code_cell}' nhung file khong ton tai"
                )
            else:
                declared_screens.add(target.stem)

        # --- wireframe SVG phai co that ---
        svg = r["svg"]
        if not is_none_mark(svg):
            if not (SVG_DIR / svg).is_file():
                problems.append(
                    f"SVG MA: {tag} tro toi '{svg}' nhung khong co trong {SVG_DIR.relative_to(ROOT)}/"
                )

        # --- test case ---
        tc = r["tc"]
        if not is_none_mark(tc):
            m = TC_RE.match(tc)
            if not m:
                problems.append(f"TC SAI DANG: {tag} cot Test Cases = '{tc}'")
            else:
                num = m.group(1)
                if num not in us_with_tc:
                    problems.append(f"TC MA: {tag} ghi '{tc}' nhung {TC_FILE} khong co TC_US{num}_")

        # --- Figma ID: ghi nhan de kiem cheo, khong tu choi vi ten sinh ra ---
        if not is_none_mark(r["figma"]):
            unverifiable_figma.append(f"{tag} -> {r['figma']}")

    # --- CHIEU NGUOC: man Flutter gan voi mot US cu the phai duoc khai bao ---
    # Chỉ xét file MÀN HÌNH (`*_screen.dart`). Bỏ qua:
    #   - widget dùng chung (không có `_US`) hoặc file CORE/shared
    #   - component con tên `*_card.dart`, `*_chip.dart`...: chúng phục vụ nhiều
    #     US (ca thật: `011_REVIEW_US03_review_card.dart` dùng ở CẢ US02 lẫn US03)
    #     nên không thuộc riêng một dòng nào trong bảng.
    for s in sorted(screens):
        if not s.endswith("_screen"):
            continue
        if s.startswith("011_CORE"):
            continue
        if s not in declared_screens:
            problems.append(
                f"MAN MO COI: '{s}.dart' co that trong code nhung khong xuat hien trong bang truy vet"
            )

    # --- CHIEU NGUOC: US co TC phai co mat trong bang truy vet ---
    for num in sorted(us_with_tc):
        code = f"1-US-{num}"
        if code not in declared_us:
            problems.append(f"US THIEU DONG: {code} co TC nhung khong co dong trong bang truy vet")

    print(f"Bang truy vet : {len(rows)} dong")
    print(f"Persona dinh nghia : {len(ps_defined)}")
    print(f"Use case dinh nghia: {len(uc_defined)}")
    print(f"User story dinh nghia: {len(us_defined)}")
    print(f"US co TC      : {len(us_with_tc)}")
    print(f"Man Flutter man hinh: {len([s for s in screens if s.endswith("_screen")])}")
    print(f"Figma ID khai bao: {len(unverifiable_figma)} (ten sinh ra, khong doi chieu file duoc)")

    if problems:
        print(f"\n{len(problems)} VI PHAM:")
        for p in problems:
            print(f"  - {p}")
        return 1

    print("\nSACH: moi dong bang truy vet tro toi thu co that; khong man/US mo coi.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
