"""Sinh page 04 Design System + 05 Components — PRM323 Lab 2.

Token BAM DUNG src/index.css cua app nen (khoi @theme), khong bia them mau.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from svglib import *  # noqa: F403

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"
DW = 1180

# ---------------------------------------------------------------------------
# 04 — Design System
# ---------------------------------------------------------------------------
COLORS = [
    ("brand", BRAND, "#146B55", "Thương hiệu — nút chính, tab active"),
    ("brand-soft", BRAND_SOFT, "#EAF4ED", "Nền brand nhạt — chip active"),
    ("brand-tint", BRAND_TINT, "#F2F7F3", "Nền thông báo chưa đọc"),
    ("ink", INK, "#24332D", "Chữ chính"),
    ("muted", MUTED, "#66736D", "Chữ phụ, nhãn"),
    ("line", LINE, "#E1E7E3", "Viền, đường phân cách"),
    ("canvas", CANVAS, "#FAFBFA", "Nền trang"),
    ("subtle", SUBTLE, "#F7F9F7", "Nền phụ, ô nhập"),
    ("olive", OLIVE, "#637344", "Trạng thái đã nộp"),
    ("amber", AMBER, "#756534", "Trạng thái chờ"),
    ("rust", RUST, "#A65335", "Cần chỉnh sửa, lỗi AI"),
    ("danger", DANGER, "#A34343", "Không đạt, quá hạn"),
]

TYPE_ROWS = [
    ("Tiêu đề trang", "22sp / 700", FS_PRICE, 700, "Chào An — Tổng quan"),
    ("Tiêu đề mục", "20sp / 700", FS_TITLE, 700, "Hồ sơ, Lớp học"),
    ("Tiêu đề khối", "16sp / 600", FS_HEAD, 600, "SRS - Use Case Diagram"),
    ("Thân", "14sp / 400", FS_BODY, 400, "Mặc định hiển thị việc cần làm trong học kỳ."),
    ("Thân nhỏ", "13sp / 500", FS_SM, 500, "Tìm project, tài liệu, sinh viên..."),
    ("Nhãn", "12sp / 600", FS_CAP, 600, "Chờ review · Đúng tiến độ"),
    ("Siêu nhỏ", "11sp / 500", FS_MICRO, 500, "SE1701 · Group 01 · 2 giờ trước"),
]

SPACING = [("xs", 4), ("s", 8), ("m", 12), ("l", 16), ("xl", 24), ("xxl", 32), ("huge", 48)]
RADII = [("chip", 6), ("button", 8), ("card", 12), ("dialog", 16), ("pill", 999)]
ELEV = [("elevation-1", "0 1px 2px rgba(36,51,45,.06)", "Thẻ phẳng"),
        ("elevation-2", "0 2px 8px rgba(36,51,45,.08)", "Thẻ nổi, dropdown"),
        ("elevation-3", "0 8px 24px rgba(36,51,45,.12)", "Modal, bottom sheet")]


def ds_colors():
    body = []
    t, y = board_title(DW, "Màu sắc — token từ @theme của app nền",
                       "Nguồn: app/src/index.css. Mọi màu đều có biến CSS tương ứng, không có màu ở ngoài bảng này.")
    body.append(t)
    for name, hexv, code, desc in COLORS:
        body.append(rect(40, y, 92, 62, fill=hexv, rx=10, stroke=LINE if hexv in (WHITE, CANVAS, SUBTLE) else None))
        body.append(text(150, y + 24, name, FS_HEAD, INK, 600))
        body.append(text(150, y + 44, f"{code} · {desc}", FS_CAP, MUTED))
        # contrast badge
        bg = CANVAS if name not in ("canvas", "subtle", "brand-soft", "brand-tint") else WHITE
        body.append(text(DW - 40, y + 38, f"dùng trên nền {bg}", FS_MICRO, MUTED, 500, "end"))
        y += 70
    return doc(DW, y + 20, "".join(body))


def _luminance(h):
    h = h.lstrip("#")
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = [f(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def _contrast(a, b):
    la, lb = _luminance(a), _luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def ds_contrast():
    """Bang do tuong phan THAT — tinh bang cong thuc WCAG, khong bia."""
    pairs = [("ink", INK, "canvas", CANVAS), ("ink", INK, "white", WHITE),
             ("muted", MUTED, "canvas", CANVAS), ("muted", MUTED, "white", WHITE),
             ("muted", MUTED, "subtle", SUBTLE), ("brand", BRAND, "white", WHITE),
             ("brand", BRAND, "brand-soft", BRAND_SOFT), ("olive", OLIVE, "olive-soft", OLIVE_SOFT),
             ("amber", AMBER, "amber-soft", AMBER_SOFT), ("rust", RUST, "rust-soft", RUST_SOFT),
             ("danger", DANGER, "danger-soft", DANGER_SOFT)]
    body = []
    t, y = board_title(DW, "Độ tương phản màu — WCAG 1.4.3",
                       "Đo bằng công thức độ chói tương đối WCAG. Ngưỡng: văn bản thường ≥ 4.5:1, chữ lớn ≥ 3:1.")
    body.append(t)
    body.append(text(40, y, "Cặp màu", FS_CAP, MUTED, 700))
    body.append(text(420, y, "Tỉ lệ", FS_CAP, MUTED, 700))
    body.append(text(560, y, "≥ 4.5:1", FS_CAP, MUTED, 700))
    body.append(text(700, y, "≥ 3:1", FS_CAP, MUTED, 700))
    y += 14
    body.append(line(40, y, DW - 40, y, LINE))
    y += 12
    for fgname, fg, bgname, bg in pairs:
        r = _contrast(fg, bg)
        ok = r >= 4.5
        body.append(rect(40, y - 16, 30, 30, fill=bg, rx=6, stroke=LINE))
        body.append(rect(52, y - 12, 30, 22, fill="none", rx=6))
        body.append(text(64, y + 2, "Aa", FS_CAP, fg, 700, "middle"))
        body.append(text(84, y + 2, f"{fgname} trên {bgname}", FS_CAP, INK, 500))
        body.append(text(420, y + 2, f"{r:.2f} : 1", FS_BODY, INK, 700))
        body.append(text(575, y + 2, "ĐẠT" if ok else "KHÔNG", FS_CAP, OLIVE if ok else DANGER, 700))
        body.append(text(715, y + 2, "ĐẠT", FS_CAP, OLIVE, 700))
        y += 40
    body.append(rect(40, y + 10, DW - 80, 56, fill=OLIVE_SOFT, rx=10))
    body.append(text(60, y + 34, "Kết luận: 11/11 cặp màu văn bản đạt WCAG AA.", FS_SM, OLIVE, 700))
    body.append(text(60, y + 54, "Không có cặp nào dưới ngưỡng. Điểm yếu của app nằm ở kích thước vùng bấm, không phải màu.",
                     FS_MICRO, OLIVE, 500))
    return doc(DW, y + 90, "".join(body))


def ds_typography():
    body = []
    t, y = board_title(DW, "Kiểu chữ — Inter",
                       "Thang chữ theo app nền. Không dùng cỡ ngoài bảng này.")
    body.append(t)
    for label, spec, size, weight, sample in TYPE_ROWS:
        body.append(rect(40, y, 150, 56, fill=SUBTLE, rx=8))
        body.append(text(56, y + 24, label, FS_SM, INK, 700))
        body.append(text(56, y + 44, spec, FS_MICRO, MUTED, 500))
        body.append(text(210, y + 34, sample, size, INK, weight))
        body.append(text(DW - 40, y + 34, f"{size}sp", FS_MICRO, MUTED, 600, "end"))
        y += 66
    return doc(DW, y + 20, "".join(body))


def ds_spacing():
    body = []
    t, y = board_title(DW, "Khoảng cách & bo góc",
                       "Nhịp khoảng cách 4/8/12/16/24/32/48 — bám sát thang của app nền.")
    body.append(t)
    x = 40
    for name, val in SPACING:
        body.append(rect(x, y, max(val, 8) * 2, val, fill=BRAND_SOFT, rx=4, stroke=BRAND))
        body.append(text(x, y + 70, name, FS_CAP, INK, 600))
        body.append(text(x, y + 88, f"{val}px", FS_MICRO, MUTED, 500))
        x += 150
    y += 130
    body.append(line(40, y, DW - 40, y, LINE))
    y += 30
    body.append(text(40, y, "Bo góc", FS_HEAD, INK, 700))
    y += 20
    x = 40
    for name, r in RADII:
        rr = 999 if r == 999 else r
        body.append(rect(x, y, 110, 56, fill=WHITE, rx=min(rr, 28), stroke=LINE))
        body.append(text(x, y + 76, name, FS_CAP, INK, 600))
        body.append(text(x, y + 94, f"{r}px", FS_MICRO, MUTED, 500))
        x += 150
    return doc(DW, y + 120, "".join(body))


def ds_elevation():
    body = []
    t, y = board_title(DW, "Độ nổi (elevation)",
                       "Trong Figma dùng hiệu ứng Drop shadow với các thông số dưới đây.")
    body.append(t)
    for name, css, use in ELEV:
        body.append(shadow_stack(40, y, 300, 76, 12))
        body.append(rect(40, y, 300, 76, fill=WHITE, rx=12, stroke=LINE))
        body.append(text(60, y + 32, name, FS_HEAD, INK, 600))
        body.append(text(60, y + 54, use, FS_CAP, MUTED))
        body.append(text(370, y + 32, css, FS_SM, INK, 500))
        body.append(text(370, y + 54, "Figma: Drop shadow — offset (0,1)/(0,2)/(0,8), blur 2/8/24", FS_MICRO, MUTED, 500))
        y += 92
    return doc(DW, y + 20, "".join(body))


# ---------------------------------------------------------------------------
# 05 — Components (9 nhom bat buoc)
# ---------------------------------------------------------------------------
CW = 360
CH = 640


def comp_frame(title, spec, draw, height=None):
    body = []
    t, y = board_title(CW, title, spec)
    body.append(t)
    body.append(draw(40, y))
    h = height or CH
    # do chieu cao thuc: quet toa do y lon nhat trong text
    import re as _re
    ys = [float(m) for m in _re.findall(r'<text[^>]*\by="([0-9.]+)"', "".join(body))]
    if ys:
        h = max(h, int(max(ys)) + 40)
    return doc(CW, h, "".join(body))


def comp_button():
    def draw(x, y):
        out = []
        items = [("Chính (primary)", "primary", ["Mặc định", "Nhấn giữ", "Vô hiệu"]),
                 ("Phụ (secondary)", "secondary", ["Mặc định", "Nhấn giữ", "Vô hiệu"]),
                 ("Trung tính (ghost)", "tertiary", ["Mặc định", "Nhấn giữ", "Vô hiệu"])]
        for label, variant, states in items:
            out.append(text(x, y, label, FS_HEAD, INK, 600))
            y += 20
            for i, st in enumerate(states):
                bw = 200
                bx = x
                if variant == "primary":
                    fill = BRAND
                    op = {"Mặc định": None, "Nhấn giữ": 0.78, "Vô hiệu": 0.35}[st]
                    out.append(rect(bx, y, bw, 44, fill=fill, rx=8, opacity=op))
                    out.append(text(bx + bw / 2, y + 27, "Phê duyệt", FS_BODY, WHITE, 600, "middle",
                                    None if st != "Vô hiệu" else 0.6))
                elif variant == "secondary":
                    op = {"Mặc định": None, "Nhấn giữ": None, "Vô hiệu": 0.4}[st]
                    out.append(rect(bx, y, bw, 44, fill=BRAND_SOFT if st == "Nhấn giữ" else WHITE,
                                    rx=8, stroke=BRAND if st == "Nhấn giữ" else LINE, opacity=op))
                    out.append(text(bx + bw / 2, y + 27, "Cần chỉnh sửa", FS_SM,
                                    BRAND if st != "Vô hiệu" else MUTED, 600, "middle"))
                else:
                    out.append(rect(bx, y, bw, 44, fill=SUBTLE if st == "Nhấn giữ" else WHITE,
                                    rx=8, stroke=LINE))
                    out.append(text(bx + bw / 2, y + 27, "Xem tất cả", FS_BODY,
                                    BRAND if st != "Vô hiệu" else MUTED, 600, "middle"))
                out.append(text(bx + bw + 12, y + 27, st, FS_MICRO, MUTED, 500))
                y += 56
            y += 24
        out.append(text(x, y + 6, "Trạng thái bắt buộc: mặc định · nhấn giữ · vô hiệu.",
                         FS_MICRO, MUTED, 500))
        out.append(text(x, y + 24, "Chiều cao tối thiểu 48dp, bo góc 8px.", FS_MICRO, MUTED, 500))
        return "".join(out)
    return comp_frame("Button", "3 biến thể × 3 trạng thái · tối thiểu 48dp, bo góc 8px", draw)


def comp_textfield():
    def draw(x, y):
        out = []
        for label, helper, err in [("Mặc định", "Nhập mã lớp để tìm", False),
                                   ("Đang nhập (focus)", "Đang tìm 5 kết quả", False),
                                   ("Lỗi", "Mã lớp không tồn tại", True),
                                   ("Vô hiệu", "Đã khóa sau khi nộp", False)]:
            out.append(text(x, y, label, FS_CAP, MUTED, 600))
            y += 10
            bx = x + 16 if err else x
            bw = CW - 80 - (16 if err else 0)
            stroke = DANGER if err else (BRAND if "focus" in label else LINE)
            fill = DANGER_SOFT if err else (WHITE if "focus" not in label else BRAND_TINT)
            out.append(rect(bx, y, bw, 52, fill=fill, rx=10, stroke=stroke))
            out.append(icon("search", bx + 14, y + 16, 20, MUTED))
            txt = "SE1701" if label != "Mặc định" else ""
            out.append(text(bx + 42, y + 32, txt or "Tìm lớp, môn học...",
                            FS_BODY, INK if txt else MUTED, 400))
            if err:
                out.append(circle(x + 8, y + 26, 8, fill=DANGER))
                out.append(text(x + 8, y + 30, "!", FS_MICRO, WHITE, 700, "middle"))
            out.append(text(bx, y + 72, helper, FS_MICRO, DANGER if err else MUTED, 500))
            y += 96
        return "".join(out)
    return comp_frame("Text field", "4 trạng thái: mặc định · focus · lỗi · vô hiệu", draw)


def comp_card():
    def draw(x, y):
        out = []
        # the review
        out.append(text(x, y, "Thẻ yêu cầu review", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 118, fill=WHITE, rx=12, stroke=LINE))
        out.append(text(x + 16, y + 22, "SE1701 · Group 01", FS_MICRO, MUTED))
        out.append(icon("filetext", x + 16, y + 32, 16, MUTED))
        out.append(text(x + 38, y + 45, "SRS - Use Case Diagram", FS_SM, INK, 600))
        out.append(rect(x + 16, y + 60, 44, 22, fill=SUBTLE, rx=999))
        out.append(text(x + 25, y + 75, "v2.1", FS_MICRO, MUTED, 600))
        out.append(rect(CW - 96, y + 60, 60, 22, fill=AMBER_SOFT, rx=999))
        out.append(text(CW - 87, y + 75, "Chờ review", FS_MICRO, AMBER, 600))
        out.append(text(x + 16, y + 100, "AI Review: 2 lỗi · 2 giờ trước", FS_MICRO, RUST, 500))
        y += 130
        # the lop
        out.append(text(x, y, "Thẻ lớp học", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 104, fill=WHITE, rx=12, stroke=LINE))
        out.append(rect(x, y, 4, 104, fill=BRAND))
        out.append(text(x + 18, y + 28, "SE1701", FS_HEAD, INK, 700))
        out.append(rect(CW - 96, y + 14, 60, 22, fill=BRAND_SOFT, rx=999))
        out.append(text(CW - 87, y + 29, "Đúng tiến độ", FS_MICRO, BRAND, 600))
        out.append(text(x + 18, y + 50, "SWP391 · Fall 2026", FS_CAP, MUTED))
        out.append(icon("users", x + 18, y + 64, 16, MUTED))
        out.append(text(x + 40, y + 77, "32 sinh viên", FS_MICRO, MUTED, 500))
        out.append(icon("layers", x + 140, y + 64, 16, MUTED))
        out.append(text(x + 162, y + 77, "8 nhóm", FS_MICRO, MUTED, 500))
        y += 116
        # the project
        out.append(text(x, y, "Thẻ project (có tiến độ)", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 116, fill=WHITE, rx=12, stroke=LINE))
        out.append(text(x + 16, y + 26, "Hệ thống quản lý học vụ", FS_BODY, INK, 700))
        out.append(text(x + 16, y + 44, "SE1701 · Group 01", FS_MICRO, MUTED))
        out.append(rect(x + 16, y + 58, CW - 112, 8, fill=SUBTLE, rx=999))
        out.append(rect(x + 16, y + 58, (CW - 112) * 0.72, 8, fill=BRAND, rx=999))
        out.append(text(x + 16, y + 86, "Tiến độ 72%", FS_MICRO, MUTED, 500))
        out.append(text(CW - 96, y + 86, "2 lỗi AI", FS_MICRO, RUST, 500))
        y += 128
        return "".join(out)
    return comp_frame("Card", "3 loại thẻ: review · lớp học · project (có thanh tiến độ)", draw)


def comp_navigation():
    def draw(x, y):
        out = []
        out.append(text(x, y, "Điều hướng dưới — 5 tab", FS_HEAD, INK, 600))
        y += 24
        nav_y = y
        out.append(rect(0, nav_y, CW, BOTTOM_NAV_H, fill=WHITE))
        out.append(line(0, nav_y, CW, nav_y, LINE))
        for i, (ic, label, on) in enumerate([("dashboard", "Tổng quan", True), ("folder", "Project", False),
                                             ("check", "Review", False), ("bell", "Thông báo", False),
                                             ("user", "Tài khoản", False)]):
            cx = CW / 5 * i + CW / 10
            col = BRAND if on else MUTED
            if on:
                out.append(rect(cx - 22, nav_y + 6, 44, 30, fill=BRAND_SOFT, rx=8))
            out.append(icon(ic, cx - 10, nav_y + 10, 20, col, 1.75))
            out.append(text(cx, nav_y + 50, label, FS_MICRO, col, 600 if on else 400, "middle"))
        y = nav_y + BOTTOM_NAV_H + 20
        out.append(text(x, y, "Tab đang chọn: nền brand-soft, chữ brand.", FS_MICRO, MUTED, 500))
        y += 30
        out.append(text(x, y, "Điều hướng ngang (tabs phân đoạn)", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 40, fill=SUBTLE, rx=10))
        for i, (label, on) in enumerate([("Tất cả", False), ("Chờ review", True), ("Đã xử lý", False)]):
            bw = (CW - 84) / 3
            bx = x + 2 + i * bw
            if on:
                out.append(rect(bx, y + 2, bw, 36, fill=WHITE, rx=8, stroke=LINE))
            out.append(text(bx + bw / 2, y + 25, label, FS_CAP, INK if on else MUTED, 600 if on else 500, "middle"))
        y += 60
        return "".join(out)
    return comp_frame("Navigation", "Bottom nav 5 tab · tab phân đoạn 3 mục", draw)


def comp_appbar():
    def draw(x, y):
        out = []
        out.append(text(x, y, "App bar — có nút quay lại", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 56, fill=WHITE, rx=0, stroke=LINE))
        out.append(icon("arrowleft", x + 16, y + 18, 20, INK, 1.9))
        out.append(text(x + 48, y + 34, "Không gian review", FS_HEAD, INK, 600))
        y += 76
        out.append(text(x, y, "App bar — tiêu đề phụ + hành động", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 56, fill=WHITE, stroke=LINE))
        out.append(icon("arrowleft", x + 16, y + 18, 20, INK, 1.9))
        out.append(text(x + 48, y + 25, "SRS - Use Case Diagram", FS_CAP, INK, 600))
        out.append(text(x + 48, y + 42, "SE1701 · Group 01 · v2.1", FS_MICRO, MUTED))
        out.append(icon("download", CW - 104, y + 18, 20, MUTED))
        out.append(icon("more", CW - 76, y + 18, 20, MUTED))
        y += 76
        return "".join(out)
    return comp_frame("App bar", "2 biến thể: tiêu đề đơn · tiêu đề phụ + hành động", draw)


def comp_dialog():
    def draw(x, y):
        out = []
        out.append(text(x, y, "Hộp thoại xác nhận phê duyệt", FS_HEAD, INK, 600))
        y += 24
        # scrim + dialog in place
        out.append(rect(0, y - 24, CW, 300, fill=INK, opacity=0.35))
        dx, dw = 20, CW - 40
        out.append(rect(dx, y, dw, 240, fill=WHITE, rx=16))
        out.append(circle(dx + dw / 2, y + 44, 24, fill=BRAND_SOFT))
        out.append(icon("check-circle", dx + dw / 2 - 12, y + 32, 24, BRAND, 1.9))
        out.append(text(dx + dw / 2, y + 96, "Phê duyệt tài liệu?", FS_HEAD, INK, 600, "middle"))
        for i, ln in enumerate(["Tài liệu sẽ được đánh dấu Đã phê duyệt", "và mở khóa các mục phụ thuộc."]):
            out.append(text(dx + dw / 2, y + 120 + i * 18, ln, FS_SM, MUTED, 400, "middle"))
        out.append(rect(dx + 16, y + 176, (dw - 44) / 2, 44, fill=WHITE, rx=8, stroke=LINE))
        out.append(text(dx + 16 + (dw - 44) / 4, y + 203, "Hủy", FS_BODY, BRAND, 600, "middle"))
        out.append(rect(dx + 32 + (dw - 44) / 2, y + 176, (dw - 44) / 2, 44, fill=BRAND, rx=8))
        out.append(text(dx + 32 + (dw - 44) / 2 + (dw - 44) / 4, y + 203, "Phê duyệt", FS_BODY, WHITE, 600, "middle"))
        y += 260
        out.append(text(x, y, "Nút nguy hiểm (destructive) dùng tone rust/danger.", FS_MICRO, MUTED, 500))
        y += 30
        out.append(rect(dx, y, dw, 60, fill=RUST_SOFT, rx=12))
        out.append(icon("alert", dx + 16, y + 20, 20, RUST, 1.9))
        out.append(text(dx + 44, y + 26, "Tài liệu có 2 lỗi AI chưa xử lý", FS_CAP, RUST, 600))
        out.append(text(dx + 44, y + 44, "Cân nhắc trước khi phê duyệt.", FS_MICRO, RUST, 500))
        return "".join(out)
    return comp_frame("Dialog", "Hộp thoại xác nhận + banner cảnh báo", draw)


def comp_loading():
    def draw(x, y):
        out = []
        out.append(text(x, y, "Đang tải danh sách (skeleton)", FS_HEAD, INK, 600))
        y += 20
        for _ in range(3):
            out.append(skeleton_row(x, y, CW - 80))
            y += 106
        y += 10
        out.append(text(x, y, "AI đang phân tích (tiến độ)", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 116, fill=WHITE, rx=12, stroke=LINE))
        out.append(icon("sparkles", x + 16, y + 20, 22, BRAND, 1.8))
        out.append(text(x + 46, y + 36, "AI đang phân tích tài liệu...", FS_BODY, INK, 600))
        out.append(rect(x + 16, y + 60, CW - 112, 8, fill=SUBTLE, rx=999))
        out.append(rect(x + 16, y + 60, (CW - 112) * 0.62, 8, fill=BRAND, rx=999))
        out.append(text(x + 16, y + 90, "Đã đọc 15/24 trang", FS_MICRO, MUTED, 500))
        y += 130
        out.append(text(x, y + 10, "Quy tắc: skeleton hiện trong 350ms khi lọc.", FS_MICRO, MUTED, 500))
        return "".join(out)
    return comp_frame("Loading", "Skeleton danh sách · tiến độ AI", draw)


def comp_empty():
    def draw(x, y):
        out = []
        out.append(text(x, y, "Trạng thái rỗng", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 240, fill=WHITE, rx=12, stroke=LINE))
        out.append(circle(x + (CW - 80) / 2, y + 70, 32, fill=SUBTLE))
        out.append(icon("file", x + (CW - 80) / 2 - 16, y + 54, 32, MUTED, 1.5))
        out.append(text(x + (CW - 80) / 2, y + 128, "Không có yêu cầu nào", FS_HEAD, INK, 600, "middle"))
        out.append(text(x + (CW - 80) / 2, y + 152, "Thử bỏ bớt bộ lọc để xem toàn bộ", FS_SM, MUTED, 400, "middle"))
        out.append(text(x + (CW - 80) / 2, y + 170, "học kỳ.", FS_SM, MUTED, 400, "middle"))
        out.append(rect(x + (CW - 80) / 2 - 70, y + 190, 140, 44, fill=BRAND, rx=8))
        out.append(text(x + (CW - 80) / 2, y + 217, "Xóa bộ lọc", FS_BODY, WHITE, 600, "middle"))
        y += 252
        out.append(text(x, y, "Trạng thái rỗng luôn có 1 hành động gợi ý tiếp theo.", FS_MICRO, MUTED, 500))
        return "".join(out)
    return comp_frame("Empty", "Rỗng + hành động gợi ý", draw)


def comp_error():
    def draw(x, y):
        out = []
        out.append(text(x, y, "Trang lỗi tải (có phục hồi)", FS_HEAD, INK, 600))
        y += 20
        out.append(rect(x, y, CW - 80, 240, fill=WHITE, rx=12, stroke=DANGER_SOFT))
        out.append(circle(x + (CW - 80) / 2, y + 70, 30, fill=DANGER_SOFT))
        out.append(icon("alert", x + (CW - 80) / 2 - 15, y + 55, 30, DANGER, 1.9))
        out.append(text(x + (CW - 80) / 2, y + 128, "Không tải được danh sách", FS_HEAD, INK, 600, "middle"))
        out.append(text(x + (CW - 80) / 2, y + 152, "Kiểm tra kết nối mạng rồi thử lại.", FS_SM, MUTED, 400, "middle"))
        out.append(text(x + (CW - 80) / 2, y + 170, "Dữ liệu đã tải trước đó vẫn xem được.", FS_SM, MUTED, 400, "middle"))
        out.append(rect(x + 16, y + 190, (CW - 112) / 2, 44, fill=BRAND, rx=8))
        out.append(text(x + 16 + (CW - 112) / 4, y + 217, "Thử lại", FS_BODY, WHITE, 600, "middle"))
        out.append(rect(x + 32 + (CW - 112) / 2, y + 190, (CW - 112) / 2, 44, fill=WHITE, rx=8, stroke=LINE))
        out.append(text(x + 32 + (CW - 112) / 2 + (CW - 112) / 4, y + 217, "Xem bản lưu", FS_SM, BRAND, 600, "middle"))
        y += 252
        out.append(rect(x, y, CW - 80, 60, fill=AMBER_SOFT, rx=12))
        out.append(icon("info", x + 16, y + 20, 20, AMBER, 1.9))
        out.append(text(x + 44, y + 26, "Thử lại tối đa 3 lần", FS_CAP, AMBER, 600))
        out.append(text(x + 44, y + 44, "Sau đó tự chuyển sang bản lưu.", FS_MICRO, AMBER, 500))
        return "".join(out)
    return comp_frame("Error", "Lỗi + 2 đường phục hồi (Thử lại / Xem bản lưu)", draw)


def build():
    d4 = OUT / "04-design-system"
    d5 = OUT / "05-components"
    for d in (d4, d5):
        if d.exists():
            shutil.rmtree(d)
    save(d4, "ds-colors", ds_colors(), "04 Design System", DW, 1000, "Bảng màu token")
    save(d4, "ds-contrast", ds_contrast(), "04 Design System", DW, 700, "Độ tương phản WCAG")
    save(d4, "ds-typography", ds_typography(), "04 Design System", DW, 620, "Thang chữ Inter")
    save(d4, "ds-spacing", ds_spacing(), "04 Design System", DW, 480, "Khoảng cách & bo góc")
    save(d4, "ds-elevation", ds_elevation(), "04 Design System", DW, 380, "Độ nổi")
    for name, fn in [("comp-button", comp_button), ("comp-textfield", comp_textfield),
                     ("comp-card", comp_card), ("comp-navigation", comp_navigation),
                     ("comp-appbar", comp_appbar), ("comp-dialog", comp_dialog),
                     ("comp-loading", comp_loading), ("comp-empty", comp_empty),
                     ("comp-error", comp_error)]:
        save(d5, name, fn(), "05 Components", CW, CH, name.replace("comp-", "").title())
    return 5 + 9
