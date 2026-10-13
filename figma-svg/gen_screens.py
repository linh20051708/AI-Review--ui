"""Sinh khung man hinh cho 6 page Figma — PRM323 Lab 2.

Man hinh bam dung app nen AI-Review--ui (23 route trong src/app/router.tsx).
De tai: He thong quan ly hoc vu / Review tai lieu cho giang vien.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from svglib import *  # noqa: F403

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"
W, H = 412, 892      # chuan Android lon (412dp)
W2, H2 = 360, 800    # chuan Android nho (360dp)

# ---------------------------------------------------------------------------
# Du lieu mau — bam mockData.ts cua app nen
# ---------------------------------------------------------------------------
USER = "Nguyễn Văn An"
SEM = "Fall 2026"

REVIEWS = [
    ("SE1701 · Group 01 · Hệ thống quản lý học vụ", "SRS - Use Case Diagram", "v2.1", "waiting", "Chờ review", "amber"),
    ("SE1702 · Group 03 · Ứng dụng đặt lịch khám", "SRS - Đặc tả chức năng", "v1.0", "inReview", "Đang review", "brand"),
    ("SE1703 · Group 02 · App quản lý chi tiêu", "Báo cáo Lab 2", "v1.3", "needsRevision", "Cần chỉnh sửa", "rust"),
    ("SE1701 · Group 05 · Hệ thống quản lý học vụ", "Thiết kế CSDL", "v1.0", "resubmitted", "Đã nộp lại", "olive"),
    ("SE1704 · Group 01 · Website bán hàng", "SRS - Activity Diagram", "v2.0", "approved", "Đã phê duyệt", "brand"),
]

FINDINGS = [
    ("error", "Thiếu mục", "Không tìm thấy phần 'Mô tả Use Case' cho UC-03", "tr.12"),
    ("error", "Nhất quán", "Actor 'Admin' xuất hiện ở UC-05 nhưng chưa khai báo trong bảng Actor", "tr.4"),
    ("warning", "Định dạng", "Hình 2.3 chú thích nằm dưới hình, chưa đánh số", "tr.9"),
    ("warning", "Thuật ngữ", "'Sinh viên' và 'Học viên' dùng lẫn lộn trong 4 chỗ", "tr.15"),
    ("suggestion", "Trình bày", "Bảng 3.1 có thể gộp 2 cột 'Mã' và 'Tên' cho gọn", "tr.18"),
]

CLASSES = [
    ("SE1701", "SWP391 · Fall 2026", 32, 8, "onTrack", "Đúng tiến độ"),
    ("SE1702", "PRN232 · Fall 2026", 28, 6, "attention", "Cần chú ý"),
    ("SE1703", "SWT301 · Fall 2026", 35, 9, "dueSoon", "Sắp đến hạn"),
    ("SE1704", "SWP391 · Fall 2026", 30, 7, "overdue", "Quá hạn"),
]

PROJECTS = [
    ("Hệ thống quản lý học vụ", "SE1701 · Group 01", 72, "onTrack", "Đúng tiến độ", "AI Review: 2 lỗi"),
    ("Ứng dụng đặt lịch khám", "SE1702 · Group 03", 45, "attention", "Cần chú ý", "AI Review: 5 lỗi"),
    ("App quản lý chi tiêu", "SE1703 · Group 02", 88, "onTrack", "Đúng tiến độ", "Chờ review"),
    ("Website bán hàng", "SE1704 · Group 01", 30, "needsRevision", "Cần chỉnh sửa", "Cần nộp lại"),
]

DOCS = [
    ("SRS - Use Case Diagram", "Lab 1 · 1.1", "v2.1", "submitted", "Đã nộp", "olive", 2, 1, 3),
    ("SRS - Activity Diagram", "Lab 1 · 1.2", "v1.0", "draft", "Bản nháp", "neutral", 0, 0, 0),
    ("Thiết kế CSDL", "Lab 2 · 2.1", "v1.0", "submitted", "Đã nộp", "olive", 0, 2, 4),
    ("Báo cáo Lab 2", "Lab 2 · 2.2", "v1.3", "resubmitted", "Đã nộp lại", "olive", 1, 0, 2),
]

TONE_COLOR = {"brand": BRAND, "olive": OLIVE, "amber": AMBER, "rust": RUST,
              "danger": DANGER, "neutral": MUTED}


# ---------------------------------------------------------------------------
# S01 — Đăng nhập  (LoginPage, AuthLayout)
# ---------------------------------------------------------------------------
def s01():
    w, h = W, H
    out = [rect(0, 0, w, h, fill=CANVAS)]
    out.append(icon("school", 20, 40, 28, BRAND, 1.9))
    out.append(text(56, 60, "Project Review", FS_TITLE, INK, 700))
    out.append(text(20, 116, "Hệ thống quản lý học vụ", FS_PRICE, INK, 700))
    out.append(text(20, 146, "và review tài liệu cho giảng viên", FS_BODY, MUTED))
    # form
    y = 200
    out.append(rect(20, y, w - 40, 52, fill=WHITE, rx=10, stroke=LINE))
    out.append(text(36, y + 20, "Email", FS_MICRO, MUTED, 600))
    out.append(text(36, y + 40, "an.nguyen@university.edu.vn", FS_BODY, INK))
    y += 68
    out.append(rect(20, y, w - 40, 52, fill=WHITE, rx=10, stroke=LINE))
    out.append(text(36, y + 20, "Mật khẩu", FS_MICRO, MUTED, 600))
    out.append(text(36, y + 40, "••••••••••", FS_BODY, INK))
    out.append(icon("eye", w - 48, y + 16, 20, MUTED))
    y += 76
    b, _ = button(20, y, "Đăng nhập", w - 40, "primary", 48)
    out.append(b)
    out.append(text(w / 2, y + 78, "Quên mật khẩu?", FS_SM, BRAND, 600, "middle"))
    out.append(rect(20, h - 130, w - 40, 1, fill=LINE))
    out.append(text(w / 2, h - 96, "Bản demo học tập · Fall 2026", FS_MICRO, MUTED, 400, "middle"))
    out.append(text(w / 2, h - 76, "Mọi dữ liệu là dữ liệu mẫu", FS_MICRO, MUTED, 400, "middle"))
    return doc(w, h, "".join(out))


# ---------------------------------------------------------------------------
# S02 — Tổng quan (DashboardPage)
# ---------------------------------------------------------------------------
def s02(offline=False):
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "TỔNG QUAN", f"Chào {USER.split()[-1]}", "Việc cần làm trong học kỳ Fall 2026.", w - 40))
    y += 108
    # stat cards cuon ngang
    stats = [("Lớp", "5", "school"), ("Sinh viên", "59", "users"),
             ("Nhóm", "14", "layers"), ("Chờ review", "7", "clock")]
    # So the vua khung (ban that cuon ngang; khung tinh chi ve phan thay duoc)
    tw = (w - 40 - 16) // 2
    for i, (label, val, ic) in enumerate(stats[:2]):
        sx = 20 + i * (tw + 16)
        body.append(rect(sx, y, tw, 82, fill=WHITE, rx=12, stroke=LINE))
        body.append(icon(ic, sx + 14, y + 14, 18, BRAND, 1.8))
        body.append(text(sx + 14, y + 54, val, FS_PRICE, INK, 700))
        body.append(text(sx + 14, y + 72, label, FS_MICRO, MUTED, 500))
    y += 92
    for i, (label, val, ic) in enumerate(stats[2:4]):
        sx = 20 + i * (tw + 16)
        body.append(rect(sx, y, tw, 82, fill=WHITE, rx=12, stroke=LINE))
        body.append(icon(ic, sx + 14, y + 14, 18, BRAND, 1.8))
        body.append(text(sx + 14, y + 54, val, FS_PRICE, INK, 700))
        body.append(text(sx + 14, y + 72, label, FS_MICRO, MUTED, 500))
    y += 100
    body.append(section_header(20, y, w - 40, "Việc cần làm", "Xem tất cả"))
    y += 14
    # attention items
    for title, detail, tone in [
        ("3 tài liệu đang chờ review", "SE1701 · Group 01 · SRS Use Case", "amber"),
        ("1 nhóm quá hạn nộp", "SE1704 · Group 01 đến hạn hôm nay", "danger"),
        ("AI Review phát hiện 2 lỗi", "SRS - Đặc tả chức năng v2.1", "rust"),
    ]:
        body.append(rect(20, y, w - 40, 76, fill=WHITE, rx=12, stroke=LINE))
        body.append(rect(20, y, 4, 76, fill=TONE_COLOR[tone]))
        body.append(text(38, y + 26, title, FS_BODY, INK, 600))
        body.append(text(38, y + 46, detail, FS_CAP, MUTED))
        body.append(badge(38, y + 52, {"amber": "Amber", "danger": "Danger", "rust": "Rust"}[tone], tone)[0] if False else "")
        body.append(icon("chevron-right", w - 40, y + 28, 20, MUTED))
        y += 86
    body.append(section_header(20, y, w - 40, "Yêu cầu review gần đây", "Xem tất cả"))
    y += 14
    n_items = 2 if h > 860 else 1
    for cls, doc, ver, st, label, tone in REVIEWS[:n_items]:
        body.append(rect(20, y, w - 40, 96, fill=WHITE, rx=12, stroke=LINE))
        body.append(text(36, y + 24, cls, FS_MICRO, MUTED))
        body.append(icon("filetext", 36, y + 34, 16, MUTED))
        body.append(text(58, y + 47, doc, FS_SM, INK, 600))
        body.append(text(36, y + 76, f"{ver}", FS_MICRO, MUTED, 500))
        bg, fg = {"amber": (AMBER_SOFT, AMBER), "brand": (BRAND_SOFT, BRAND),
                  "rust": (RUST_SOFT, RUST), "olive": (OLIVE_SOFT, OLIVE)}[tone]
        bw = int(len(label) * 6.4 + 18)
        body.append(rect(w - 36 - bw, y + 58, bw, 22, fill=bg, rx=999))
        body.append(text(w - 36 - bw / 2, y + 73, label, FS_MICRO, fg, 600, "middle"))
        y += 104
    if offline:
        body.append(rect(0, 54, w, h - 54, fill=INK, opacity=0.35))
        body.append(rect(20, h / 2 - 90, w - 40, 190, fill=WHITE, rx=16))
        body.append(circle(w / 2, h / 2 - 44, 24, fill=AMBER_SOFT))
        body.append(icon("alert", w / 2 - 12, h / 2 - 56, 24, AMBER, 1.9))
        body.append(text(w / 2, h / 2 + 4, "Không có kết nối mạng", FS_HEAD, INK, 600, "middle"))
        for i, ln in enumerate(["Dữ liệu hiển thị là bản lưu gần nhất.", "Kéo xuống để thử lại khi có mạng."]):
            body.append(text(w / 2, h / 2 + 28 + i * 18, ln, FS_SM, MUTED, 400, "middle"))
        b, bw = button(w / 2 - 60, h / 2 + 58, "Thử lại", 120, "primary")
        body.append(b)
    return device(w, h, "Tổng quan", "".join(body), nav="Tổng quan")


# ---------------------------------------------------------------------------
# S03 — Danh sách yêu cầu review (ReviewRequestsPage)
# ---------------------------------------------------------------------------
def s03(state="list"):
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "KHÔNG GIAN REVIEW", "Yêu cầu review",
                             "Mặc định hiển thị việc cần làm trong học kỳ hiện tại.", w - 40))
    y += 108
    body.append(search_bar(20, y, w - 40, "Tìm project, tài liệu, sinh viên..."))
    y += 52
    sx = 20
    for i, (label, active) in enumerate([("Fall 2026", True), ("Chờ review", True), ("Đang review", False)]):
        c, cw = chip(sx, y, label, active=active)
        body.append(c)
        sx += cw + 8
    body.append(icon("filter", w - 40, y + 5, 20, MUTED))
    y += 44
    if state == "loading":
        for i in range(4):
            body.append(skeleton_row(20, y, w - 40))
            y += 106
        body.append(text(w / 2, 96, "Đang tải...", FS_CAP, MUTED, 500, "middle"))
        return device(w, h, "Yêu cầu review", "".join(body), nav="Review")
    if state == "empty":
        body.append(empty_state(20, y + 40, w - 40, "Không có yêu cầu nào",
                                "Thử bỏ bớt bộ lọc để xem toàn bộ học kỳ.", "Xóa bộ lọc"))
        return device(w, h, "Yêu cầu review", "".join(body), nav="Review")
    # sort
    body.append(rect(20, y, 148, 32, fill=WHITE, rx=6, stroke=LINE))
    body.append(text(32, y + 21, "Mới nhất", FS_CAP, INK, 500))
    body.append(icon("chevron-down", 148, y + 9, 16, MUTED))
    body.append(text(w - 40 - 90, y + 21, "5 yêu cầu", FS_CAP, MUTED, 500))
    y += 44
    for cls, doc, ver, st, label, tone in REVIEWS[:3]:
        body.append(rect(20, y, w - 40, 118, fill=WHITE, rx=12, stroke=LINE))
        body.append(text(36, y + 24, cls, FS_MICRO, MUTED))
        body.append(icon("filetext", 36, y + 34, 16, MUTED))
        body.append(text(58, y + 47, doc, FS_SM, INK, 600))
        bg, fg = {"amber": (AMBER_SOFT, AMBER), "brand": (BRAND_SOFT, BRAND),
                  "rust": (RUST_SOFT, RUST), "olive": (OLIVE_SOFT, OLIVE)}[tone]
        bw = int(len(label) * 6.4 + 18)
        body.append(rect(36, y + 60, 44, 22, fill=SUBTLE, rx=999))
        body.append(text(45, y + 75, ver, FS_MICRO, MUTED, 600))
        body.append(rect(w - 36 - bw, y + 60, bw, 22, fill=bg, rx=999))
        body.append(text(w - 36 - bw / 2, y + 75, label, FS_MICRO, fg, 600, "middle"))
        body.append(text(36, y + 98, "AI Review: 2 lỗi", FS_MICRO, RUST, 500))
        y += 126
    return device(w, h, "Yêu cầu review", "".join(body), nav="Review")


# ---------------------------------------------------------------------------
# S04 — Không gian review (ReviewWorkspacePage)
# ---------------------------------------------------------------------------
def s04(state="normal"):
    w, h = W, H
    body = []
    y = 74
    body.append(rect(20, y, w - 40, 104, fill=WHITE, rx=12, stroke=LINE))
    body.append(text(36, y + 24, "SE1701 · Group 01", FS_MICRO, MUTED))
    body.append(text(36, y + 48, "SRS - Use Case Diagram", FS_HEAD, INK, 600))
    body.append(text(36, y + 70, "v2.1 · 24 trang · PDF", FS_CAP, MUTED))
    bw = int(len("Chờ review") * 6.4 + 18)
    body.append(rect(w - 36 - bw, y + 60, bw, 22, fill=AMBER_SOFT, rx=999))
    body.append(text(w - 36 - bw + 9, y + 75, "Chờ review", FS_MICRO, AMBER, 600))
    y += 116
    # 3 track
    body.append(section_header(20, y, w - 40, "Trạng thái"))
    y += 16
    for label, val, tone in [("Tài liệu", "Đã nộp", "olive"),
                             ("AI Review", "Đã review · 2 lỗi", "rust"),
                             ("Giảng viên", "Chờ review", "amber")]:
        body.append(rect(20, y, w - 40, 44, fill=WHITE, rx=10, stroke=LINE))
        body.append(text(34, y + 27, label, FS_SM, INK, 600))
        col = TONE_COLOR[tone]
        tw = len(val) * 6.6
        body.append(text(w - 56 - tw, y + 27, val, FS_CAP, col, 600))
        body.append(circle(w - 34, y + 22, 5, fill=col))
        y += 50
    if state == "decision":
        body.append(dialog(30, 240, w - 60, 260, "Phê duyệt tài liệu?",
                           "Tài liệu sẽ được đánh dấu Đã phê duyệt và mở khóa mục phụ thuộc.",
                           "Phê duyệt", "Hủy", "check-circle", "brand"))
    else:
        body.append(icon("filetext", 34, y + 8, 18, MUTED))
        body.append(text(58, y + 22, "Tệp đính kèm", FS_SM, INK, 600))
        y += 34
        body.append(rect(20, y, w - 40, 60, fill=WHITE, rx=10, stroke=LINE))
        body.append(icon("file", 34, y + 20, 20, RUST, 1.8))
        body.append(text(62, y + 28, "SRS_UseCase_v2.1.pdf", FS_SM, INK, 500))
        body.append(text(62, y + 46, "2.4 MB · Nộp 2 giờ trước", FS_MICRO, MUTED))
        body.append(icon("download", w - 44, y + 20, 20, BRAND))
        y += 74
        body.append(section_header(20, y, w - 40, "Phát hiện của AI"))
        y += 16
        for level, cat, msg, pg in FINDINGS[:2]:
            col = {"error": RUST, "warning": AMBER, "suggestion": BRAND}[level]
            bg = {"error": RUST_SOFT, "warning": AMBER_SOFT, "suggestion": BRAND_SOFT}[level]
            body.append(rect(20, y, w - 40, 84, fill=bg, rx=10))
            body.append(icon("alert" if level == "error" else "info", 34, y + 16, 16, col, 1.9))
            body.append(text(56, y + 29, cat, FS_CAP, col, 700))
            body.append(text(w - 44, y + 29, pg, FS_MICRO, MUTED, 500, "end"))
            for i, ln in enumerate(wrap(msg, 44)[:2]):
                body.append(text(34, y + 52 + i * 17, ln, FS_MICRO, INK))
            y += 92
        y += 4
        b1, bw1 = button(20, y, "Cần chỉnh sửa", (w - 52) / 2, "secondary", 46)
        b2, _ = button(36 + (w - 52) / 2, y, "Phê duyệt", (w - 52) / 2, "primary", 46)
        body.append(b1 + b2)
    return device(w, h, "Không gian review", "".join(body), sub="SRS - Use Case Diagram")


# ---------------------------------------------------------------------------
# S05 — Ket qua AI Review (AIReviewResultPage)
# ---------------------------------------------------------------------------
def s05(state="result"):
    w, h = W, H
    body = []
    y = 74
    counts = [("2", "Lỗi", RUST, RUST_SOFT), ("2", "Cảnh báo", AMBER, AMBER_SOFT),
              ("1", "Gợi ý", BRAND, BRAND_SOFT)]
    cx = 20
    for val, label, col, bg in counts:
        body.append(rect(cx, y, 116, 72, fill=bg, rx=12))
        body.append(text(cx + 16, y + 34, val, FS_PRICE, col, 700))
        body.append(text(cx + 16, y + 56, label, FS_CAP, col, 600))
        cx += 124
    y += 88
    body.append(section_header(20, y, w - 40, "Chi tiết phát hiện"))
    y += 14
    if state == "running":
        body.append(rect(20, y, w - 40, 130, fill=WHITE, rx=12, stroke=LINE))
        body.append(icon("sparkles", 34, y + 22, 22, BRAND, 1.8))
        body.append(text(64, y + 39, "AI đang phân tích tài liệu...", FS_BODY, INK, 600))
        body.append(rect(34, y + 66, w - 108, 8, fill=SUBTLE, rx=999))
        body.append(rect(34, y + 66, (w - 108) * 0.62, 8, fill=BRAND, rx=999))
        body.append(text(34, y + 96, "Đã đọc 15/24 trang", FS_MICRO, MUTED, 500))
        body.append(rect(20, y + 146, w - 40, 60, fill=WHITE, rx=12, stroke=LINE))
        body.append(rect(36, y + 162, w * 0.4, 10, fill=SUBTLE, rx=4))
        body.append(rect(36, y + 182, w * 0.6, 10, fill=SUBTLE, rx=4))
        return device(w, h, "Kết quả AI Review", "".join(body), sub="SRS - Use Case Diagram")
    for level, cat, msg, pg in FINDINGS:
        col = {"error": RUST, "warning": AMBER, "suggestion": BRAND}[level]
        bg = {"error": RUST_SOFT, "warning": AMBER_SOFT, "suggestion": BRAND_SOFT}[level]
        body.append(rect(20, y, w - 40, 82, fill=WHITE, rx=12, stroke=LINE))
        body.append(rect(20, y, 4, 82, fill=col))
        body.append(rect(34, y + 14, 62, 22, fill=bg, rx=999))
        body.append(text(43, y + 29, {"error": "Lỗi", "warning": "Cảnh báo", "suggestion": "Gợi ý"}[level],
                         FS_MICRO, col, 700))
        body.append(text(104, y + 29, cat, FS_MICRO, MUTED, 600))
        body.append(text(w - 44, y + 29, pg, FS_MICRO, MUTED, 500, "end"))
        for i, ln in enumerate(wrap(msg, 44)[:2]):
            body.append(text(34, y + 54 + i * 17, ln, FS_MICRO, INK))
        y += 90
    y += 6
    b, _ = button(20, y, "Quay lại không gian review", w - 40, "secondary", 46)
    body.append(b)
    return device(w, h, "Kết quả AI Review", "".join(body), sub="SRS - Use Case Diagram")


# ---------------------------------------------------------------------------
# S06 — Danh sách lớp (ClassListPage)
# ---------------------------------------------------------------------------
def s06():
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "CẤU TRÚC HỌC VỤ", "Lớp học",
                             "Fall 2026 · 4 lớp đang hoạt động.", w - 40))
    y += 108
    body.append(search_bar(20, y, w - 40, "Tìm lớp, môn học, giảng viên..."))
    y += 52
    for code, offering, stu, grp, health, hlabel in CLASSES:
        body.append(rect(20, y, w - 40, 108, fill=WHITE, rx=12, stroke=LINE))
        col = TONE_COLOR[health if health in TONE_COLOR else "neutral"]
        body.append(rect(20, y, 4, 108, fill=col))
        body.append(text(38, y + 28, code, FS_HEAD, INK, 700))
        bg, fg = {"onTrack": (BRAND_SOFT, BRAND), "attention": (AMBER_SOFT, AMBER),
                  "dueSoon": (AMBER_SOFT, AMBER), "overdue": (DANGER_SOFT, DANGER)}[health]
        bw = int(len(hlabel) * 6.4 + 18)
        body.append(rect(w - 36 - bw, y + 14, bw, 22, fill=bg, rx=999))
        body.append(text(w - 36 - bw + 9, y + 29, hlabel, FS_MICRO, fg, 600))
        body.append(text(38, y + 50, offering, FS_CAP, MUTED))
        body.append(icon("users", 38, y + 64, 16, MUTED))
        body.append(text(60, y + 77, f"{stu} sinh viên", FS_MICRO, MUTED, 500))
        body.append(icon("layers", 148, y + 64, 16, MUTED))
        body.append(text(170, y + 77, f"{grp} nhóm", FS_MICRO, MUTED, 500))
        body.append(icon("chevron-right", w - 40, y + 44, 20, MUTED))
        y += 116
    return device(w, h, "Lớp học", "".join(body), nav="Project")


# ---------------------------------------------------------------------------
# S07 — Danh sách project (ProjectListPage)
# ---------------------------------------------------------------------------
def s07():
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "ĐỒ ÁN", "Project",
                             "Theo dõi tiến độ và tình trạng nộp của từng nhóm.", w - 40))
    y += 108
    body.append(search_bar(20, y, w - 40, "Tìm project hoặc nhóm..."))
    y += 52
    sx = 20
    for label, active in [("Fall 2026", True), ("Đang hoạt động", True), ("Cần chú ý", False)]:
        c, cw = chip(sx, y, label, active=active)
        body.append(c)
        sx += cw + 8
    y += 44
    n_proj = len(PROJECTS) if h > 860 else len(PROJECTS) - 2
    for name, ctx, prog, health, hlabel, note in PROJECTS[:n_proj]:
        body.append(rect(20, y, w - 40, 128, fill=WHITE, rx=12, stroke=LINE))
        body.append(text(36, y + 26, name, FS_BODY, INK, 700))
        body.append(text(36, y + 44, ctx, FS_MICRO, MUTED))
        bg, fg = {"onTrack": (BRAND_SOFT, BRAND), "attention": (AMBER_SOFT, AMBER),
                  "needsRevision": (RUST_SOFT, RUST)}[health]
        bw = int(len(hlabel) * 6.4 + 18)
        body.append(rect(w - 36 - bw, y + 14, bw, 22, fill=bg, rx=999))
        body.append(text(w - 36 - bw + 9, y + 29, hlabel, FS_MICRO, fg, 600))
        # progress
        body.append(rect(36, y + 62, w - 72, 8, fill=SUBTLE, rx=999))
        body.append(rect(36, y + 62, (w - 72) * prog / 100, 8, fill=BRAND, rx=999))
        body.append(text(36, y + 90, f"Tiến độ {prog}%", FS_MICRO, MUTED, 500))
        body.append(text(w - 36 - len(note) * 6.2, y + 90, note, FS_MICRO,
                         RUST if "lỗi" in note else MUTED, 500))
        body.append(line(36, y + 102, w - 36, y + 102, LINE))
        body.append(text(36, y + 118, "Deadline: 20/10/2026", FS_MICRO, MUTED, 500))
        body.append(icon("chevron-right", w - 40, y + 108, 18, MUTED))
        y += 136
    return device(w, h, "Project", "".join(body), nav="Project")


# ---------------------------------------------------------------------------
# S08 — Tài liệu trong project (ProjectDocumentsPage)
# ---------------------------------------------------------------------------
def s08():
    w, h = W, H
    body = []
    y = 74
    body.append(rect(20, y, w - 40, 92, fill=WHITE, rx=12, stroke=LINE))
    body.append(text(36, y + 26, "Hệ thống quản lý học vụ", FS_HEAD, INK, 600))
    body.append(text(36, y + 48, "SE1701 · Group 01 · Fall 2026", FS_MICRO, MUTED))
    body.append(rect(36, y + 62, w - 72, 8, fill=SUBTLE, rx=999))
    body.append(rect(36, y + 62, (w - 72) * 0.72, 8, fill=BRAND, rx=999))
    y += 104
    body.append(section_header(20, y, w - 40, "Tài liệu Lab 1 & Lab 2", "4 tài liệu"))
    y += 16
    for title, lab, ver, st, label, tone, errs, warns, sugg in DOCS:
        body.append(rect(20, y, w - 40, 100, fill=WHITE, rx=12, stroke=LINE))
        body.append(icon("filetext", 34, y + 20, 18, MUTED))
        body.append(text(60, y + 33, title, FS_SM, INK, 600))
        body.append(text(34, y + 56, lab, FS_MICRO, MUTED))
        body.append(text(34, y + 76, ver, FS_MICRO, MUTED, 600))
        bg, fg = {"olive": (OLIVE_SOFT, OLIVE), "neutral": (SUBTLE, MUTED)}[tone]
        bw = int(len(label) * 6.4 + 18)
        body.append(rect(w - 36 - bw, y + 50, bw, 22, fill=bg, rx=999))
        body.append(text(w - 36 - bw + 9, y + 65, label, FS_MICRO, fg, 600))
        if errs or warns:
            body.append(text(34, y + 92, f"AI: {errs} lỗi · {warns} cảnh báo", FS_MICRO, RUST, 500))
        body.append(icon("chevron-right", w - 40, y + 74, 18, MUTED))
        y += 108
    return device(w, h, "Tài liệu của project", "".join(body), sub="Hệ thống quản lý học vụ")


# ---------------------------------------------------------------------------
# S09 — Học kỳ (SemesterListPage)
# ---------------------------------------------------------------------------
def s09():
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "CẤU TRÚC HỌC VỤ", "Học kỳ",
                             "Quản lý học kỳ và trạng thái lưu trữ.", w - 40))
    y += 108
    for name, year, dates, active, cls, arch in [
        ("Fall 2026", "2026-2027", "01/09/2026 – 31/12/2026", True, 4, False),
        ("Spring 2026", "2025-2026", "10/01/2026 – 10/05/2026", False, 6, True),
        ("Summer 2026", "2025-2026", "01/06/2026 – 31/08/2026", False, 3, True),
    ]:
        body.append(rect(20, y, w - 40, 104, fill=WHITE, rx=12, stroke=LINE))
        if active:
            body.append(rect(20, y, 4, 104, fill=BRAND))
        body.append(text(38, y + 30, name, FS_HEAD, INK, 600))
        if active:
            body.append(rect(w - 36 - 62, y + 14, 62, 22, fill=BRAND_SOFT, rx=999))
            body.append(text(w - 36 - 53, y + 29, "Hiện tại", FS_MICRO, BRAND, 600))
        elif arch:
            body.append(rect(w - 36 - 62, y + 14, 62, 22, fill=SUBTLE, rx=999))
            body.append(text(w - 36 - 53, y + 29, "Lưu trữ", FS_MICRO, MUTED, 600))
        body.append(text(38, y + 52, f"Năm học {year}", FS_CAP, MUTED))
        body.append(icon("calendar", 38, y + 66, 16, MUTED))
        body.append(text(60, y + 79, dates, FS_MICRO, MUTED, 500))
        body.append(text(38, y + 98, f"{cls} lớp", FS_MICRO, MUTED, 500))
        y += 112
    b, _ = button(20, y + 6, "Tạo học kỳ mới", w - 40, "secondary", 46)
    body.append(b)
    return device(w, h, "Học kỳ", "".join(body), nav="Project")


# ---------------------------------------------------------------------------
# S10 — Rule set (RuleSetListPage)
# ---------------------------------------------------------------------------
def s10():
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "CẤU HÌNH", "Rule set",
                             "Quy định AI review và duyệt của giảng viên.", w - 40))
    y += 108
    for name, ai, sla, fmt, desc in [
        ("Chuẩn SWP391", "Tự động", 3, "PDF, DOCX", "AI chạy trước khi giảng viên duyệt"),
        ("Chuẩn PRN232", "Thủ công", 5, "PDF", "Giảng viên review trước, AI sau"),
        ("Chuẩn SWT301", "Tự động", 2, "PDF, DOCX", "Bắt buộc AI trước khi nộp"),
    ]:
        body.append(rect(20, y, w - 40, 128, fill=WHITE, rx=12, stroke=LINE))
        body.append(text(36, y + 28, name, FS_HEAD, INK, 600))
        body.append(text(36, y + 48, desc, FS_MICRO, MUTED))
        for i, (label, val) in enumerate([("AI review", ai), ("SLA", f"{sla} ngày"), ("Định dạng", fmt)]):
            yy = y + 66 + i * 20
            body.append(text(36, yy + 12, label, FS_MICRO, MUTED, 500))
            body.append(text(w - 36 - len(val) * 6.3, yy + 12, val, FS_MICRO, INK, 600))
        body.append(icon("chevron-right", w - 40, y + 100, 18, MUTED))
        y += 136
    return device(w, h, "Rule set", "".join(body), nav="Project")


# ---------------------------------------------------------------------------
# S11 — Sinh viên (StudentListPage)
# ---------------------------------------------------------------------------
def s11():
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "CẤU TRÚC HỌC VỤ", "Sinh viên",
                             "59 sinh viên · 4 lớp · Fall 2026.", w - 40))
    y += 108
    body.append(search_bar(20, y, w - 40, "Tìm sinh viên, mã số..."))
    y += 52
    body.append(rect(20, y, w - 40, 44, fill=WHITE, rx=10, stroke=LINE))
    body.append(icon("filter", 34, y + 12, 20, BRAND))
    body.append(text(62, y + 27, "Lớp: SE1701 (SWP391)", FS_CAP, INK, 600))
    body.append(icon("x", w - 44, y + 14, 16, MUTED))
    y += 54
    for ini, name, code, cls, grp in [
        ("NA", "Nguyễn Văn An", "SE170001", "SE1701", "Group 01"),
        ("TB", "Trần Thị Bình", "SE170002", "SE1701", "Group 01"),
        ("LC", "Lê Văn Cường", "SE170003", "SE1701", "Group 02"),
        ("PD", "Phạm Thị Dung", "SE170004", "SE1701", "Group 02"),
        ("HV", "Hoàng Văn Em", "SE170005", "SE1701", "—"),
    ]:
        body.append(rect(20, y, w - 40, 76, fill=WHITE, rx=12, stroke=LINE))
        body.append(circle(48, y + 38, 20, fill=BRAND_SOFT))
        body.append(text(48, y + 44, ini, FS_SM, BRAND, 700, "middle"))
        body.append(text(80, y + 32, name, FS_SM, INK, 600))
        body.append(text(80, y + 52, code, FS_MICRO, MUTED))
        bw = int(len(cls) * 6.4 + 18)
        body.append(rect(w - 36 - bw, y + 12, bw, 22, fill=SUBTLE, rx=6))
        body.append(text(w - 36 - bw + 9, y + 27, cls, FS_MICRO, INK, 500))
        body.append(text(w - 36 - len(grp) * 6.2, y + 60, grp, FS_MICRO, BRAND, 500))
        y += 84
    return device(w, h, "Sinh viên", "".join(body), nav="Project")


# ---------------------------------------------------------------------------
# S12 — Nhóm (GroupListPage)
# ---------------------------------------------------------------------------
def s12():
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "CẤU TRÚC HỌC VỤ", "Nhóm",
                             "14 nhóm theo lớp, kèm tình trạng sức khỏe.", w - 40))
    y += 108
    for name, cls, prog, members, health, hlabel in [
        ("Group 01", "SE1701 · SWP391", 72, 5, "onTrack", "Đúng tiến độ"),
        ("Group 02", "SE1701 · SWP391", 48, 4, "attention", "Cần chú ý"),
        ("Group 03", "SE1702 · PRN232", 90, 5, "onTrack", "Đúng tiến độ"),
        ("Group 01", "SE1704 · SWP391", 22, 4, "overdue", "Quá hạn"),
    ]:
        body.append(rect(20, y, w - 40, 112, fill=WHITE, rx=12, stroke=LINE))
        body.append(text(36, y + 28, name, FS_HEAD, INK, 600))
        body.append(text(36, y + 48, cls, FS_MICRO, MUTED))
        bg, fg = {"onTrack": (BRAND_SOFT, BRAND), "attention": (AMBER_SOFT, AMBER),
                  "overdue": (DANGER_SOFT, DANGER)}[health]
        bw = int(len(hlabel) * 6.4 + 18)
        body.append(rect(w - 36 - bw, y + 14, bw, 22, fill=bg, rx=999))
        body.append(text(w - 36 - bw + 9, y + 29, hlabel, FS_MICRO, fg, 600))
        body.append(rect(36, y + 64, w - 72, 8, fill=SUBTLE, rx=999))
        body.append(rect(36, y + 64, (w - 72) * prog / 100, 8, fill=BRAND, rx=999))
        body.append(text(36, y + 92, f"Tiến độ {prog}%", FS_MICRO, MUTED, 500))
        body.append(icon("users", w - 100, y + 78, 16, MUTED))
        body.append(text(w - 78, y + 91, f"{members} thành viên", FS_MICRO, MUTED, 500))
        y += 120
    return device(w, h, "Nhóm", "".join(body), nav="Project")


# ---------------------------------------------------------------------------
# S13 — Thông báo (NotificationsPage)
# ---------------------------------------------------------------------------
def s13():
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "HỘP THƯ", "Thông báo",
                             "3 thông báo chưa đọc.", w - 40))
    y += 108
    for title, meta, unread, ic, tone in [
        ("Tài liệu mới chờ review", "SE1701 · Group 01 vừa nộp SRS v2.1 · 2 giờ trước", True, "filetext", "brand"),
        ("AI Review đã xong", "Đặc tả chức năng · phát hiện 2 lỗi · 4 giờ trước", True, "sparkles", "rust"),
        ("Nhóm quá hạn nộp", "SE1704 · Group 01 · hôm qua", True, "alert", "danger"),
        ("Đã phê duyệt", "Thiết kế CSDL · hôm qua", False, "check-circle", "olive"),
        ("Nhắc deadline", "Còn 3 ngày tới hạn Lab 2 · 2 ngày trước", False, "clock", "amber"),
    ]:
        body.append(rect(20, y, w - 40, 88, fill=BRAND_TINT if unread else WHITE, rx=12,
                         stroke=LINE))
        body.append(circle(50, y + 44, 18, fill=WHITE))
        body.append(icon(ic, 40, y + 34, 20, TONE_COLOR[tone], 1.85))
        body.append(text(80, y + 32, title, FS_SM, INK, 700 if unread else 500))
        for i, ln in enumerate(wrap(meta, 40)[:2]):
            body.append(text(80, y + 52 + i * 16, ln, FS_MICRO, MUTED))
        if unread:
            body.append(circle(w - 32, y + 26, 4, fill=BRAND))
        y += 96
    return device(w, h, "Thông báo", "".join(body), nav="Thông báo")


# ---------------------------------------------------------------------------
# S14 — Tài khoản (ProfilePage)
# ---------------------------------------------------------------------------
def s14():
    w, h = W, H
    body = []
    y = 74
    body.append(page_heading(20, y + 40, "TÀI KHOẢN", "Hồ sơ",
                             "Thông tin giảng viên và cài đặt ứng dụng.", w - 40))
    y += 108
    body.append(rect(20, y, w - 40, 92, fill=WHITE, rx=12, stroke=LINE))
    body.append(circle(62, y + 46, 26, fill=BRAND_SOFT))
    body.append(text(62, y + 54, "NA", FS_TITLE, BRAND, 700, "middle"))
    body.append(text(104, y + 40, USER, FS_HEAD, INK, 600))
    body.append(text(104, y + 60, "Giảng viên / Supervisor", FS_CAP, MUTED))
    body.append(text(104, y + 78, "an.nguyen@university.edu.vn", FS_MICRO, MUTED))
    y += 104
    body.append(section_header(20, y, w - 40, "Học kỳ hiện tại"))
    y += 16
    body.append(rect(20, y, w - 40, 56, fill=WHITE, rx=10, stroke=LINE))
    body.append(icon("calendar", 36, y + 18, 20, BRAND))
    body.append(text(66, y + 26, "Fall 2026", FS_BODY, INK, 600))
    body.append(text(66, y + 44, "01/09/2026 – 31/12/2026", FS_MICRO, MUTED))
    y += 68
    body.append(section_header(20, y, w - 40, "Cài đặt"))
    y += 16
    for label, ic in [("Thông báo đẩy", "bell"), ("Chế độ hiển thị", "eye"),
                      ("Xem hướng dẫn sử dụng", "info")]:
        body.append(rect(20, y, w - 40, 52, fill=WHITE, rx=10, stroke=LINE))
        body.append(icon(ic, 36, y + 16, 20, MUTED))
        body.append(text(66, y + 32, label, FS_SM, INK, 500))
        body.append(icon("chevron-right", w - 40, y + 16, 20, MUTED))
        y += 60
    body.append(rect(20, y, w - 40, 52, fill=WHITE, rx=10, stroke=LINE))
    body.append(icon("logout", 36, y + 16, 20, RUST))
    body.append(text(66, y + 32, "Đăng xuất", FS_SM, RUST, 600))
    return device(w, h, "Hồ sơ", "".join(body), nav="Tài khoản")


# ---------------------------------------------------------------------------
# Bien the (khong tinh la man hinh rieng)
# ---------------------------------------------------------------------------
def v_s03_error():
    """Man hinh loi mang khi tai danh sach review — co phuc hoi."""
    w, h = W, H
    body = [page_heading(20, 114, "KHÔNG GIAN REVIEW", "Yêu cầu review",
                         "Mặc định hiển thị việc cần làm trong học kỳ hiện tại.", w - 40)]
    body.append(search_bar(20, 222, w - 40, "Tìm project, tài liệu, sinh viên..."))
    body.append(rect(20, 306, w - 40, 260, fill=WHITE, rx=12, stroke=DANGER_SOFT))
    body.append(circle(w / 2, 356, 30, fill=DANGER_SOFT))
    body.append(icon("alert", w / 2 - 15, 341, 30, DANGER, 1.9))
    body.append(text(w / 2, 416, "Không tải được danh sách", FS_HEAD, INK, 600, "middle"))
    for i, ln in enumerate(["Kiểm tra kết nối mạng rồi thử lại.",
                            "Dữ liệu đã tải trước đó vẫn xem được."]):
        body.append(text(w / 2, 440 + i * 18, ln, FS_SM, MUTED, 400, "middle"))
    b1, bw1 = button(20, 486, "Thử lại", (w - 52) / 2, "primary", 46)
    b2, _ = button(36 + (w - 52) / 2, 486, "Xem bản lưu", (w - 52) / 2, "secondary", 46)
    body.append(b1 + b2)
    return device(w, h, "Yêu cầu review", "".join(body), nav="Review")


def v_s04_unavailable():
    """Tai lieu khong con hieu luc — khong xem duoc."""
    w, h = W, H
    body = [rect(20, 74, w - 40, 104, fill=WHITE, rx=12, stroke=LINE)]
    body.append(text(36, 98, "SE1701 · Group 01", FS_MICRO, MUTED))
    body.append(text(36, 122, "SRS - Use Case Diagram", FS_HEAD, INK, 600))
    body.append(text(36, 144, "v2.1 · 24 trang · PDF", FS_CAP, MUTED))
    body.append(empty_state(20, 220, w - 40, "Tài liệu không khả dụng",
                            "Tệp đã bị chủ sở hữu gỡ hoặc hết hạn lưu trữ.", "Tải lại"))
    body.append(rect(20, 508, w - 40, 72, fill=AMBER_SOFT, rx=12))
    body.append(icon("info", 36, 526, 20, AMBER, 1.9))
    for i, ln in enumerate(["Bạn vẫn có thể xem phản hồi đã", "ghi cho phiên bản này."]):
        body.append(text(66, 540 + i * 18, ln, FS_MICRO, AMBER))
    return device(w, h, "Không gian review", "".join(body), sub="SRS - Use Case Diagram")


def v_s05_running():
    return s05("running")


def v_s02_offline():
    return s02(offline=True)


def v_s03_loading():
    return s03("loading")


def v_s03_empty():
    return s03("empty")


def v_s04_decision():
    return s04("decision")


# 360dp
def r360_s02():
    return _r360(s02, "Tổng quan")


def r360_s03():
    return _r360(lambda: s03("list"), "Yêu cầu review")


def r360_s07():
    return _r360(s07, "Project")


def _r360(fn, label):
    """Vẽ lại thật ở 360x800: nạp lại module với W/W2 đã hoán đổi rồi trả SVG mới.

    Cách trước chỉ đổi width/height của <svg> nên nội dung bị crop — sai.
    Ở đây ta chỉnh module-level W/H rồi gọi lại hàm vẽ, nội dung tự bố cục
    theo bề rộng 360 (padding 20 -> vùng dùng 320).
    """
    import sys
    mod = sys.modules[__name__]
    old_w, old_h = mod.W, mod.H
    try:
        mod.W, mod.H = W2, H2
        return fn()
    finally:
        mod.W, mod.H = old_w, old_h


# ---------------------------------------------------------------------------
BUILDERS = {
    # 8 man hinh chinh
    "s01-dang-nhap": (s01, "Đăng nhập"),
    "s02-tong-quan": (s02, "Tổng quan"),
    "s03-yeu-cau-review": (s03, "Yêu cầu review"),
    "s04-khong-gian-review": (s04, "Không gian review"),
    "s05-ket-qua-ai": (s05, "Kết quả AI Review"),
    "s06-lop-hoc": (s06, "Lớp học"),
    "s07-project": (s07, "Project"),
    "s08-tai-lieu": (s08, "Tài liệu project"),
    "s09-hoc-ky": (s09, "Học kỳ"),
    "s10-rule-set": (s10, "Rule set"),
    "s11-sinh-vien": (s11, "Sinh viên"),
    "s12-nhom": (s12, "Nhóm"),
    "s13-thong-bao": (s13, "Thông báo"),
    "s14-tai-khoan": (s14, "Tài khoản"),
    "v-s02-offline": (v_s02_offline, "Tổng quan — mất mạng"),
    "v-s03-loading": (v_s03_loading, "Danh sách — đang tải"),
    "v-s03-empty": (v_s03_empty, "Danh sách — rỗng"),
    "v-s03-error": (v_s03_error, "Danh sách — lỗi mạng"),
    "v-s04-unavailable": (v_s04_unavailable, "Tài liệu không khả dụng"),
    "v-s04-decision": (v_s04_decision, "Hộp thoại phê duyệt"),
    "v-s05-running": (v_s05_running, "AI đang phân tích"),
}

R360 = {
    "r360-s02-tong-quan": (r360_s02, "Tổng quan @360dp"),
    "r360-s03-yeu-cau": (r360_s03, "Yêu cầu review @360dp"),
    "r360-s07-project": (r360_s07, "Project @360dp"),
}


def build():
    out = OUT / "03-final"
    if out.exists():
        shutil.rmtree(out)
    for name, (fn, label) in BUILDERS.items():
        save(out, name, fn(), "03 Final UI", W, H, label,
             "Khung 412dp" if not name.startswith(("v-", "r360")) else "Biến thể trạng thái")
    for name, (fn, label) in R360.items():
        save(out, name, fn(), "03 Final UI", W2, H2, label, "Khung 360dp — kiểm responsive")
    return len(BUILDERS) + len(R360)
