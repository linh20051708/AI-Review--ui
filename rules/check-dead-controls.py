#!/usr/bin/env python3
"""rules/check-dead-controls.py — cổng chặn NÚT CHẾT trong `flutter_app`.

VÌ SAO CÓ CỔNG NÀY
------------------
Đợt 4 tìm ra hai nút có mặt trên giao diện mà bấm **không làm gì**:

  1. `Tìm kiếm` trên thanh tiêu đề (`011_CORE_app_shell.dart`) — `onPressed: () {}`,
     có ở MỌI màn.
  2. Thẻ tệp đính kèm (`us04/...workspace_screen.dart`) — `onTap: () {}`, mà khối
     đó còn tự khai `Semantics(button: true, label: 'Mở tài liệu ...')` nên
     **trình đọc màn hình đọc lên như nút mở được tài liệu**. Đây là loại lỗi
     tệ hơn nút chết thường: nó nói dối người dùng.

Cùng họ với "toast báo 'Trạng thái đã cập nhật' mà dữ liệu không đổi" (đợt 3):
giao diện HỨA một hành động rồi không làm gì. Cổng hình thức (mã ID, tầng, số TC)
không bắt được, nên phải có cổng riêng.

LUẬT
----
Trong `flutter_app/lib/`, một handler rỗng
    onPressed: () {}   |   onTap: () {}   |   onLongPress: () {}
là LỖI, trừ khi dòng đó là **chú thích** (bắt đầu bằng `//`) hoặc có
`// ignore: dead-control` trên cùng dòng / dòng ngay trên, kèm lý do.

Ngoại lệ hợp lệ duy nhất đã biết: nút hiển thị nhưng CỐ Ý không hoạt động
(ví dụ nút bị khoá vì thiếu quyền). Khi đó viết:
    onPressed: () {}, // ignore: dead-control — <lý do cụ thể>
Cách này khiến việc bỏ qua trở thành hành động CÓ Ý THỨC và để lại dấu vết,
thay vì vô tình thêm một nút chết nữa.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "flutter_app" / "lib"

# Handler thân rỗng: `() {}` hoặc `() => null` (không làm gì).
EMPTY_HANDLER = re.compile(
    r"""\b(onPressed|onTap|onLongPress|onChanged|onSubmitted)\s*:
        \s*
        ( \( \s* \) \s* \{ \s* \}       # () {}
        | \( \s* \) \s* => \s* null     # () => null
        )""",
    re.VERBOSE,
)

IGNORE_MARK = "ignore: dead-control"
COMMENT_ONLY = re.compile(r"^\s*//")


def main() -> int:
    if not LIB.is_dir():
        print(f"[FAIL] Khong thay {LIB}")
        return 1

    bad: list[str] = []
    checked = 0

    for path in sorted(LIB.rglob("*.dart")):
        lines = path.read_text(encoding="utf-8").splitlines()
        for i, line in enumerate(lines, start=1):
            # Bỏ qua dòng chú thích (regex sẽ khớp cả ví dụ trong docblock).
            if COMMENT_ONLY.match(line):
                continue
            if not EMPTY_HANDLER.search(line):
                continue
            checked += 1
            # Có dấu miễn trừ (cùng dòng hoặc dòng ngay trên)?
            prev = lines[i - 2] if i >= 2 else ""
            if IGNORE_MARK in line or IGNORE_MARK in prev:
                continue
            rel = path.relative_to(ROOT)
            bad.append(f"{rel}:{i}: {line.strip()}")

    print(f"Quet {checked} handler rong trong flutter_app/lib")
    if bad:
        print(f"\n[FAIL] {len(bad)} NUT CHET (bam khong lam gi):")
        for b in bad:
            print(f"  {b}")
        print(
            "\nSua: noi handler vao hanh dong that, hoac neu CO Y khong hoat dong thi\n"
            "them `// ignore: dead-control — <ly do>`."
        )
        return 1

    print("[OK  ] Khong co nut chet")
    return 0


if __name__ == "__main__":
    sys.exit(main())
