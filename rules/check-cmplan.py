#!/usr/bin/env python3
"""rules/check-cmplan.py — cổng kiểm CMPlan (PRM393).

Kiểm 4 nhóm luật theo `docs/CMPlan.md`:

  A. Mã tầng hợp lệ — chỉ 6 mã 001/011/101/111/201/202 tồn tại.
  B. Khai báo tầng — mỗi file .dart dưới lib/ (trừ main.dart) phải khai báo
     mã tầng bằng dòng `// CMPlan: tầng 011 ...` ở đầu file.
     LÝ DO ĐỔI (đợt 13): trước đây mã tầng bắt buộc nằm trong TÊN FILE và TÊN
     FOLDER (`011_presentation/review/us03/011_REVIEW_US03_...`). Cách đó khiến
     cây code chỉ là chuỗi số — không đọc được, ngược với architectural-overview
     của Flutter (chia theo trang → widget → state). Nay đường dẫn mang tên tính
     năng (`features/review_workspace/`), mã tầng chuyển vào dòng khai báo;
     luật CÔ LẬP TẦNG không hề nới.
  C. Cô lập tầng — import KHÔNG được đi ngược từ tầng thấp lên tầng cao.
     Đây là luật mục 07 [CRITICAL] của checklist.
  D. Định mức ≥10 test case / 1 user story, đủ 5 nhóm HP/AP/BV/EX/UI (≥2 mỗi nhóm).

Exit 0 = sạch · 1 = có vi phạm · 2 = chưa kiểm được.
"""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "flutter_app" / "lib"
TESTS = ROOT / "flutter_app" / "test"
TC_DOC = ROOT / "docs" / "test-cases-cmplan.md"

# --- A. Mã tầng hợp lệ -------------------------------------------------------
VALID_LAYERS = {"001", "011", "101", "111", "201", "202"}

# --- C. Bản đồ tầng cho luật import -----------------------------------------
# Cây `lib/` giờ chia THEO TÍNH NĂNG (theo architectural-overview của Flutter) nên
# không còn folder mang mã tầng. Mã tầng được KHAI BÁO bằng dòng comment ở đầu
# mỗi file, dạng: `// CMPlan: tầng 011 · ...` hoặc `// CMPlan: tầng 001 ...`.
DECL_RE = re.compile(r"^\s*//\s*CMPlan:\s*tầng\s+(\d{3})\b")

# Quan hệ cho phép: tầng này được import những tầng nào (theo docs/CMPlan-MAP.md §3)
ALLOWED_IMPORTS = {
    "001": {"001"},
    "101": {"101"},
    "111": {"101", "111"},
    "201": {"101", "201"},
    "202": {"101", "111", "201", "202"},
    "011": {"001", "101", "111", "201", "202", "011"},  # tầng trên cùng
}

# File được miễn trừ (điểm vào, không thuộc tầng) — so theo đường dẫn từ gốc repo
EXEMPT_FILES = {"flutter_app/lib/main.dart"}

# Tầng 011 KHÔNG được gọi thẳng nguồn thô 201 — phải qua 202 Repository.
# Lý do: docs/CMPlan.md mục 07 [CRITICAL] "mọi giao tiếp đi qua interface rõ ràng".
# 202 là nơi chuẩn hoá dữ liệu, cache và phục hồi khi mất mạng (giải pain point P03/An).
FORBIDDEN_DIRECT = {
    "011": {"201"},
}

# --- D. Nhóm test case bắt buộc ---------------------------------------------
TC_GROUPS = ("HP", "AP", "BV", "EX", "UI")
TC_MIN_PER_GROUP = 2
TC_MIN_PER_US = 10

TC_CODE_RE = re.compile(r"\bTC_US(\d{2})_(HP|AP|BV|EX|UI)_(\d{2})\b")

LAYER_PREFIX_RE = re.compile(r"^(\d{3})_")


def rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def layer_of(path: Path) -> str | None:
    """Suy mã tầng của một file .dart từ DÒNG KHAI BÁO trong file.

    Đợt 13: trước đây đọc tên folder (`011_presentation/...`). Nay cây chia theo
    tính năng nên mã tầng nằm ở dòng `// CMPlan: tầng 011 ...` đầu mỗi file.
    Chỉ nhìn 10 dòng đầu — nếu khai báo nằm tít dưới thì coi như không khai báo.
    """
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None
    for line in text.splitlines()[:10]:
        m = DECL_RE.match(line)
        if m:
            return m.group(1)
    return None


def check_naming() -> list[str]:
    """B. Mỗi file .dart dưới lib/ phải KHAI BÁO mã tầng hợp lệ."""
    problems: list[str] = []
    if not LIB.exists():
        return problems
    for dart in sorted(LIB.rglob("*.dart")):
        r = rel(dart)
        if r in EXEMPT_FILES:
            continue
        code = layer_of(dart)
        if code is None:
            problems.append(
                f"THIEU KHAI BAO TANG: {r} — phai co dong `// CMPlan: tầng <ma>` "
                f"o 10 dong dau, voi ma trong {sorted(VALID_LAYERS)}"
            )
            continue
        if code not in VALID_LAYERS:
            problems.append(
                f"MA TANG KHONG HOP LE: {r} — `{code}` khong nam trong {sorted(VALID_LAYERS)}"
            )
    return problems


def check_imports() -> list[str]:
    """C. Không import ngược tầng."""
    problems: list[str] = []
    if not LIB.exists():
        return problems
    for dart in sorted(LIB.rglob("*.dart")):
        src_layer = layer_of(dart)
        if src_layer is None:
            continue
        text = dart.read_text(encoding="utf-8")
        for m in re.finditer(r"^import\s+'([^']+)'", text, re.M):
            target = m.group(1)
            if target.startswith("package:") or target.startswith("dart:"):
                continue
            # Phân giải đường dẫn tương đối
            resolved = (dart.parent / target).resolve()
            try:
                resolved.relative_to(LIB.resolve())
            except ValueError:
                continue
            dst_layer = layer_of(resolved)
            if dst_layer is None:
                continue
            allowed = ALLOWED_IMPORTS.get(src_layer, set())
            if dst_layer not in allowed:
                problems.append(
                    f"IMPORT NGUOC TANG: {rel(dart)}  [tang {src_layer}]"
                    f" -> {rel(resolved)}  [tang {dst_layer}]"
                    f"  (tang {src_layer} chi duoc import: {sorted(allowed)})"
                )
    return problems


def check_direct_source_access() -> list[str]:
    """Tầng 011 không được import thẳng 201 — phải qua 202."""
    problems: list[str] = []
    if not LIB.exists():
        return problems
    for dart in sorted(LIB.rglob("*.dart")):
        src_layer = layer_of(dart)
        if src_layer is None:
            continue
        forbidden = FORBIDDEN_DIRECT.get(src_layer, set())
        if not forbidden:
            continue
        text = dart.read_text(encoding="utf-8")
        for m in re.finditer(r"^import\s+'([^']+)'", text, re.M):
            target = m.group(1)
            if target.startswith("package:") or target.startswith("dart:"):
                continue
            resolved = (dart.parent / target).resolve()
            try:
                resolved.relative_to(LIB.resolve())
            except ValueError:
                continue
            dst_layer = layer_of(resolved)
            if dst_layer in forbidden:
                problems.append(
                    f"GOI THANG NGUON THO: {rel(dart)}  [tang {src_layer}]"
                    f" -> {rel(resolved)}  [tang {dst_layer}]"
                    f"  (tang {src_layer} phai di qua 202 Repository)"
                )
    return problems


def check_testcases() -> tuple[list[str], dict[str, dict[str, int]]]:
    """D. ≥10 TC mỗi US, đủ 5 nhóm, mỗi nhóm ≥2."""
    problems: list[str] = []
    counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    if not TC_DOC.exists():
        return ([f"THIEU TAI LIEU: {rel(TC_DOC)}"], counts)

    text = TC_DOC.read_text(encoding="utf-8")
    seen: set[str] = set()
    for m in TC_CODE_RE.finditer(text):
        code = m.group(0)
        us = m.group(1)
        group = m.group(2)
        if code in seen:
            problems.append(f"MA TC TRUNG LAP: {code} xuat hien nhieu lan")
            continue
        seen.add(code)
        counts[us][group] += 1

    for us in sorted(counts):
        total = sum(counts[us].values())
        if total < TC_MIN_PER_US:
            problems.append(f"THIEU TC: US{us} chi co {total} test case, dinh muc >= {TC_MIN_PER_US}")
        for g in TC_GROUPS:
            n = counts[us].get(g, 0)
            if n < TC_MIN_PER_GROUP:
                problems.append(
                    f"THIEU NHOM: US{us} nhom `{g}` chi co {n} test case, dinh muc >= {TC_MIN_PER_GROUP}"
                )
    if not counts:
        problems.append(f"KHONG TIM THAY MA TC nao trong {rel(TC_DOC)}")
    return problems, counts


def main() -> int:
    if not LIB.exists():
        print(f"CHUA KIEM DUOC: khong thay {rel(LIB)}", file=sys.stderr)
        return 2

    name_problems = check_naming()
    import_problems = check_imports()
    direct_problems = check_direct_source_access()
    tc_problems, counts = check_testcases()

    n_dart = len(list(LIB.rglob("*.dart")))

    print("=== CMPlan gate ===")
    print(f"  File .dart duoi lib/ : {n_dart}")
    print(f"  Ma tang hop le       : {sorted(VALID_LAYERS)}")
    print()

    def section(title: str, problems: list[str], ok_msg: str) -> None:
        if problems:
            print(f"[LOI ] {title} — {len(problems)} vi pham")
            for p in problems:
                print(f"        - {p}")
        else:
            print(f"[OK  ] {title}")
            print(f"        {ok_msg}")
        print()

    section("A+B. Dat ten file theo ma tang", name_problems,
            "moi file .dart mang ma tang khop folder (mien tru main.dart)")

    section("C. Co lap tang (muc 07 CRITICAL)", import_problems,
            "khong co import nguoc tang")

    section("C2. Khong goi thang nguon tho 201", direct_problems,
            "tang 011 di qua 202 Repository, khong cham 201 truc tiep")

    if counts:
        total_tc = sum(sum(g.values()) for g in counts.values())
        n_us = len(counts)
        section("D. Dinh muc test case", tc_problems,
                f"{total_tc} test case tren {n_us} user story — moi US >= {TC_MIN_PER_US}, "
                f"moi nhom >= {TC_MIN_PER_GROUP}")
        print("        Chi tiet theo US:")
        for us in sorted(counts):
            parts = " ".join(f"{g}={counts[us].get(g, 0)}" for g in TC_GROUPS)
            print(f"          US{us}: {parts}  (tong {sum(counts[us].values())})")
        print()
    else:
        section("D. Dinh muc test case", tc_problems, "(khong co du lieu)")

    all_problems = name_problems + import_problems + direct_problems + tc_problems
    print("=" * 62)
    if all_problems:
        print(f"KET QUA: {len(all_problems)} VI PHAM")
        return 1
    print("KET QUA: SACH toan bo")
    return 0


if __name__ == "__main__":
    sys.exit(main())
