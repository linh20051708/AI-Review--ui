"""Sinh page 01 User Flow + 02 Wireframe — PRM323 Lab 2.

Luong bam dung nghiep vu app nen: giang vien mo yeu cau review -> xem tai lieu
-> doc phat hien AI -> ra quyet dinh (phe duyet / yeu cau chinh sua) -> ghi phan hoi.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from svglib import *  # noqa: F403

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"
BW, BH = 1760, 1180


def harrow(x1, x2, y, color=BRAND, sw=2):
    """Mui ten ve bang line + polygon that (Figma bo qua SVG marker)."""
    tip = 9
    return (f'<line x1="{x1}" y1="{y}" x2="{x2 - tip}" y2="{y}" stroke="{color}" stroke-width="{sw}"/>' +
            poly([(x2, y), (x2 - tip, y - 5.5), (x2 - tip, y + 5.5)], fill=color))


def node(x, y, w, h, title, sub=None, tone="neutral", small=False):
    m = {"neutral": (WHITE, LINE, INK), "brand": (BRAND_SOFT, BRAND, BRAND),
         "olive": (OLIVE_SOFT, OLIVE, OLIVE), "amber": (AMBER_SOFT, AMBER, AMBER),
         "rust": (RUST_SOFT, RUST, RUST), "danger": (DANGER_SOFT, DANGER, DANGER),
         "start": (INK, INK, WHITE), "end": (BRAND, BRAND, WHITE)}
    bg, stroke, fg = m.get(tone, m["neutral"])
    out = [shadow_stack(x, y, w, h, 14) if tone in ("neutral",) else ""]
    out.append(rect(x, y, w, h, fill=bg, rx=14, stroke=stroke, sw=1.6))
    th = FS_SM if small else FS_BODY
    lines = wrap(title, wrap_chars(w - 28, th))
    start = y + h / 2 - (len(lines) - 1) * 10 - (12 if sub else 0)
    for i, ln in enumerate(lines):
        out.append(text(x + w / 2, start + i * 20, ln, th, fg, 600, "middle"))
    if sub:
        for i, ln in enumerate(wrap(sub, wrap_chars(w - 28, FS_MICRO))[:2]):
            out.append(text(x + w / 2, start + len(lines) * 20 + 4 + i * 15, ln, FS_MICRO,
                            fg, 400, "middle", 0.85))
    return "".join(out)


def diamond(x, y, w, h, label, tone="amber"):
    m = {"amber": (AMBER_SOFT, AMBER), "danger": (DANGER_SOFT, DANGER),
         "brand": (BRAND_SOFT, BRAND)}
    bg, fg = m.get(tone, m["amber"])
    cx, cy = x + w / 2, y + h / 2
    out = [poly([(cx, y), (x + w, cy), (cx, y + h), (x, cy)], fill=bg, stroke=fg, sw=1.6)]
    for i, ln in enumerate(wrap(label, wrap_chars(w * 0.62, FS_MICRO))[:3]):
        out.append(text(cx, cy - 6 + i * 15, ln, FS_MICRO, fg, 600, "middle"))
    return "".join(out)


def lane_label(x, y, w, h, text_s, tone="brand"):
    m = {"brand": (BRAND, WHITE), "neutral": (SUBTLE, MUTED), "amber": (AMBER, WHITE)}
    bg, fg = m.get(tone, m["brand"])
    return (rect(x, y, w, h, fill=bg, rx=10) +
            "".join(text(x + w / 2, y + h / 2 + 5 + i * 15, ln, FS_MICRO, fg, 700, "middle")
                    for i, ln in enumerate(wrap(text_s, wrap_chars(w - 16, FS_MICRO))[:3])))


def legend(x, y):
    items = [("neutral", "Màn hình"), ("brand", "Hành động giảng viên"),
             ("amber", "Điểm quyết định"), ("rust", "Nhánh lỗi / phục hồi")]
    out = [text(x, y, "Chú thích", FS_SM, INK, 700)]
    yy = y + 20
    for tone, label in items:
        m = {"neutral": (WHITE, LINE), "brand": (BRAND_SOFT, BRAND),
             "amber": (AMBER_SOFT, AMBER), "rust": (RUST_SOFT, RUST)}
        bg, st = m[tone]
        out.append(rect(x, yy, 26, 16, fill=bg, rx=5, stroke=st, sw=1.5))
        out.append(text(x + 34, yy + 13, label, FS_MICRO, MUTED, 500))
        yy += 26
    return "".join(out)


# ---------------------------------------------------------------------------
# Page 01 — User Flow
# ---------------------------------------------------------------------------
def user_flow():
    body = []
    t, y = board_title(BW, "Sơ đồ luồng người dùng — Giảng viên (Supervisor)",
                       "Ba luồng: thuận, thay thế và phục hồi lỗi. Bám đúng route trong app nền "
                       "AI-Review--ui (src/app/router.tsx).")
    body.append(t)

    # lane
    lx, lw = 40, 120
    body.append(lane_label(lx, y + 10, lw, 90, "Giảng viên", "brand"))
    body.append(lane_label(lx, y + 116, lw, 90, "Hệ thống", "neutral"))
    body.append(lane_label(lx, y + 222, lw, 90, "AI Review", "amber"))

    # --- Flow 1: happy path ---
    fy = y + 10
    body.append(text(180, fy + 4, "LUỒNG 1 — THUẬN (Happy path)", FS_HEAD, BRAND, 700))
    steps = [
        ("Mở Tổng quan", "/dashboard", "neutral"),
        ("Chọn việc cần làm", "lọc học kỳ Fall 2026", "brand"),
        ("Danh sách yêu cầu", "/reviews", "neutral"),
        ("Không gian review", "/reviews/:id", "neutral"),
        ("Kết quả AI", "đọc 2 lỗi · 2 cảnh báo", "neutral"),
    ]
    x = 180
    for i, (label, sub, tone) in enumerate(steps):
        body.append(node(x, fy + 34, 168, 72, label, sub, tone if i else "start"))
        if i < len(steps) - 1:
            body.append(harrow(x + 170, x + 206, fy + 70))
        x += 206
    # decision
    body.append(diamond(x + 4, fy + 8, 150, 124, "Tài liệu đạt yêu cầu?", "amber"))
    body.append(harrow(x - 2, x + 2, fy + 70))
    # two branches
    body.append(node(x + 200, fy - 30, 176, 68, "Phê duyệt", "mở khóa mục phụ thuộc", "brand"))
    body.append(node(x + 200, fy + 118, 176, 68, "Yêu cầu chỉnh sửa", "ghi phản hồi", "rust"))
    body.append(harrow(x + 156, x + 198, fy + 44, OLIVE))
    body.append(harrow(x + 156, x + 198, fy + 100, RUST))
    body.append(text(x + 162, fy + 34, "Đạt", FS_MICRO, OLIVE, 700))
    body.append(text(x + 162, fy + 116, "Chưa đạt", FS_MICRO, RUST, 700))
    # merge to end
    ex = x + 420
    body.append(node(ex, fy + 34, 150, 72, "Thông báo cho nhóm", "cập nhật 3 track", "end"))

    # --- Flow 2: alternate ---
    ay = y + 200
    body.append(text(180, ay + 4, "LUỒNG 2 — THAY THẾ (Lịch sử phiên bản)", FS_HEAD, OLIVE, 700))
    body.append(text(180, ay + 26, "Giảng viên so sánh phiên bản trước khi ra quyết định.", FS_MICRO, MUTED))
    steps2 = [
        ("Không gian review", "v2.1 hiện tại", "neutral"),
        ("Lịch sử phiên bản", "/reviews/:id/versions", "brand"),
        ("Chọn phiên bản cũ", "v1.3", "neutral"),
        ("So sánh phản hồi", "đối chiếu phát hiện AI", "neutral"),
        ("Quay lại v2.1", "ra quyết định", "brand"),
    ]
    x = 180
    for i, (label, sub, tone) in enumerate(steps2):
        body.append(node(x, ay + 44, 168, 72, label, sub, tone))
        if i < len(steps2) - 1:
            body.append(harrow(x + 170, x + 206, ay + 80))
        x += 206
    body.append(node(x, ay + 44, 168, 72, "Lịch sử review", "/review-history", "neutral"))
    body.append(harrow(x - 2, x + 2, ay + 80))

    # --- Flow 3: error / recovery ---
    ey = y + 400
    body.append(text(180, ey + 4, "LUỒNG 3 — LỖI & PHỤC HỒI (bắt buộc có)", FS_HEAD, RUST, 700))
    steps3 = [
        ("Mở danh sách review", "/reviews", "neutral"),
        ("Đang tải", "skeleton 350ms", "neutral"),
    ]
    x = 180
    for i, (label, sub, tone) in enumerate(steps3):
        body.append(node(x, ey + 44, 168, 72, label, sub, tone))
        body.append(harrow(x + 170, x + 206, ey + 80))
        x += 206
    body.append(diamond(x + 4, ey + 18, 150, 124, "Tải thành công?", "danger"))
    body.append(harrow(x - 2, x + 2, ey + 80))
    body.append(node(x + 200, ey - 20, 176, 68, "Hiện danh sách", "tiếp tục luồng 1", "brand"))
    body.append(harrow(x + 156, x + 198, ey + 54, OLIVE))
    body.append(text(x + 162, ey + 44, "Có", FS_MICRO, OLIVE, 700))
    # error path
    body.append(node(x + 200, ey + 128, 176, 72, "Lỗi mạng", "hiện trang lỗi + nút Thử lại", "rust"))
    body.append(harrow(x + 156, x + 198, ey + 100, RUST))
    body.append(text(x + 162, ey + 124, "Không", FS_MICRO, RUST, 700))
    body.append(node(x + 420, ey + 128, 176, 72, "Thử lại", "tối đa 3 lần", "amber"))
    body.append(harrow(x + 378, x + 418, ey + 164))
    body.append(node(x + 640, ey + 128, 176, 72, "Vẫn lỗi → xem bản lưu",
                     "dữ liệu cũ vẫn xem được", "rust"))
    body.append(harrow(x + 598, x + 638, ey + 164))

    # legend
    body.append(legend(40, ey + 250))

    # notes
    ny = ey + 250
    notes = [
        "Mọi màn hình đều có đường quay lại (app bar) — không có ngõ cụt.",
        "Luồng 3 có phục hồi: Thử lại 3 lần, sau đó dùng bản lưu tại chỗ.",
        "Nút Back của trình duyệt/điện thoại quay về màn trước, không thoát app.",
    ]
    body.append(text(220, ny, "Ghi chú thiết kế", FS_SM, INK, 700))
    for i, s in enumerate(notes):
        for j, ln in enumerate(wrap(s, 96)):
            body.append(text(220, ny + 24 + i * 34 + j * 17, ("· " if j == 0 else "  ") + ln,
                             FS_MICRO, MUTED, 500))

    return doc(BW, BH, "".join(body))


# ---------------------------------------------------------------------------
# Page 02 — Wireframe (khung den trang 9 man hinh)
# ---------------------------------------------------------------------------
def wf(w_title, sub, blocks, note=""):
    """blocks: list (kind, label) — ve khung xam, khong mau."""
    w, h = 412, 892
    GRAY, G2, G3 = "#E7EAE8", "#D6DBD8", "#F2F4F3"
    body = [rect(0, 0, w, h, fill="#FFFFFF")]
    # status bar
    body.append(rect(0, 0, w, 54, fill=G3))
    body.append(text(18, 30, "9:41", FS_MICRO, G2, 600))
    body.append(rect(w - 34, 24, 16, 11, fill="none", rx=3, stroke=G2, sw=1.4))
    # header
    body.append(rect(0, 54, w, 56, fill=G3))
    body.append(rect(20, 72, 18, 18, fill=G2, rx=4))
    body.append(rect(50, 74, 150, 14, fill=G2, rx=4))
    body.append(line(0, 110, w, 110, G2))
    y = 128
    for block in blocks:
        kind = block[0]
        label = block[1] if len(block) > 1 else ""
        if kind == "head":
            body.append(rect(20, y, 96, 12, fill=G2, rx=4))
            body.append(rect(20, y + 20, 220, 20, fill=G2, rx=5))
            body.append(rect(20, y + 48, 280, 10, fill=G3, rx=4))
            y += 74
        elif kind == "search":
            body.append(rect(20, y, w - 40, 40, fill=G3, rx=10, stroke=G2))
            body.append(circle(38, y + 20, 6, fill=G2))
            body.append(rect(54, y + 15, 160, 10, fill=G2, rx=4))
            y += 52
        elif kind == "chips":
            x = 20
            for cw in (92, 104, 88):
                body.append(rect(x, y, cw, 30, fill=G3, rx=999, stroke=G2))
                body.append(rect(x + 14, y + 10, cw - 34, 10, fill=G2, rx=4))
                x += cw + 10
            y += 44
        elif kind == "stats":
            x = 20
            for sw_ in (108, 108, 108):
                body.append(rect(x, y, sw_, 82, fill=G3, rx=12, stroke=G2))
                body.append(circle(x + 24, y + 22, 8, fill=G2))
                body.append(rect(x + 14, y + 42, 40, 18, fill=G2, rx=4))
                body.append(rect(x + 14, y + 66, 60, 9, fill=G2, rx=4))
                x += sw_ + 8
            y += 94
        elif kind == "card":
            bh = 118 if "review" in label else 104
            body.append(rect(20, y, w - 40, bh, fill=G3, rx=12, stroke=G2))
            body.append(rect(36, y + 18, 190, 11, fill=G2, rx=4))
            body.append(rect(36, y + 38, 240, 16, fill=G2, rx=5))
            body.append(rect(36, y + 64, 60, 20, fill=G2, rx=999))
            body.append(rect(w - 116, y + 64, 80, 20, fill=G2, rx=999))
            if "review" in label:
                body.append(rect(36, y + 92, 200, 10, fill=G2, rx=4))
            y += bh + 10
        elif kind == "list":
            for _ in range(4):
                body.append(rect(20, y, w - 40, 72, fill=G3, rx=12, stroke=G2))
                body.append(circle(48, y + 36, 18, fill=G2))
                body.append(rect(80, y + 24, 150, 12, fill=G2, rx=4))
                body.append(rect(80, y + 44, 100, 10, fill=G2, rx=4))
                body.append(rect(w - 60, y + 26, 20, 20, fill=G2, rx=6))
                y += 80
        elif kind == "tracks":
            for _ in range(3):
                body.append(rect(20, y, w - 40, 44, fill=G3, rx=10, stroke=G2))
                body.append(rect(34, y + 17, 90, 11, fill=G2, rx=4))
                body.append(circle(w - 34, y + 22, 5, fill=G2))
                body.append(rect(w - 120, y + 17, 70, 11, fill=G2, rx=4))
                y += 50
        elif kind == "findings":
            for _ in range(2):
                body.append(rect(20, y, w - 40, 82, fill=G3, rx=12, stroke=G2))
                body.append(rect(34, y + 14, 62, 20, fill=G2, rx=999))
                body.append(rect(34, y + 46, 260, 11, fill=G2, rx=4))
                body.append(rect(34, y + 63, 180, 11, fill=G2, rx=4))
                y += 90
        elif kind == "actions":
            body.append(rect(20, y, (w - 52) / 2, 46, fill=G3, rx=8, stroke=G2))
            body.append(rect(36 + (w - 52) / 2, y, (w - 52) / 2, 46, fill=G2, rx=8))
            y += 58
        elif kind == "progress":
            body.append(rect(20, y, w - 40, 92, fill=G3, rx=12, stroke=G2))
            body.append(rect(36, y + 20, 170, 14, fill=G2, rx=4))
            body.append(rect(36, y + 48, w - 72, 8, fill=G2, rx=999))
            body.append(rect(36, y + 70, 90, 10, fill=G2, rx=4))
            y += 104
        elif kind == "form":
            for _ in range(2):
                body.append(rect(20, y, w - 40, 52, fill=G3, rx=10, stroke=G2))
                body.append(rect(36, y + 18, 80, 10, fill=G2, rx=4))
                body.append(rect(36, y + 34, 180, 11, fill=G2, rx=4))
                y += 64
        elif kind == "btn":
            body.append(rect(20, y, w - 40, 48, fill=G2, rx=8))
            y += 60
    # bottom nav
    body.append(rect(0, h - 64, w, 64, fill=G3))
    body.append(line(0, h - 64, w, h - 64, G2))
    for i in range(5):
        cx = w / 5 * i + w / 10
        body.append(rect(cx - 10, h - 52, 20, 20, fill=G2, rx=5))
        body.append(rect(cx - 18, h - 26, 36, 8, fill=G2, rx=4))
    if note:
        body.append(text(w / 2, h - 78, note, FS_MICRO, "#9AA39F", 500, "middle"))
    return doc(w, h, "".join(body))


WF_SPECS = [
    ("wf-01-dang-nhap", "Đăng nhập", "wf-01",
     [("head",), ("form",), ("form",), ("btn",)], "Bố cục 1 cột, form trên cùng"),
    ("wf-02-tong-quan", "Tổng quan", "wf-02",
     [("head",), ("stats",), ("card", "review"), ("card", "attention")], "Thẻ số liệu + việc cần làm"),
    ("wf-03-yeu-cau-review", "DS yêu cầu review", "wf-03",
     [("head",), ("search",), ("chips",), ("card", "review"), ("card", "review")], "Bộ lọc + danh sách"),
    ("wf-04-khong-gian-review", "Không gian review", "wf-04",
     [("tracks",), ("findings",), ("actions",)], "3 track + phát hiện AI + quyết định"),
    ("wf-05-ket-qua-ai", "Kết quả AI Review", "wf-05",
     [("head",), ("findings",), ("findings",), ("btn",)], "Đếm lỗi/cảnh báo/gợi ý rồi liệt kê"),
    ("wf-06-lop-hoc", "DS lớp học", "wf-06",
     [("head",), ("search",), ("list",)], "Danh sách lớp kèm tình trạng"),
    ("wf-07-project", "DS project", "wf-07",
     [("head",), ("search",), ("chips",), ("card", "project"), ("card", "project")], "Tiến độ + deadline"),
    ("wf-08-tai-lieu", "Tài liệu project", "wf-08",
     [("progress",), ("card", "project"), ("card", "project")], "Tiến độ project + tài liệu"),
    ("wf-09-hoc-ky", "DS học kỳ", "wf-09",
     [("head",), ("list",), ("btn",)], "Học kỳ + trạng thái lưu trữ"),
]


def build():
    out1 = OUT / "01-user-flow"
    out2 = OUT / "02-wireframe"
    for d in (out1, out2):
        if d.exists():
            shutil.rmtree(d)
    save(out1, "user-flow-supervisor", user_flow(), "01 User Flow", BW, BH,
         "Sơ đồ 3 luồng — Giảng viên")
    for name, label, code, blocks, note in WF_SPECS:
        save(out2, name, wf(label, code, blocks, note), "02 Wireframe", 412, 892, label, note)
    return 1 + len(WF_SPECS)
