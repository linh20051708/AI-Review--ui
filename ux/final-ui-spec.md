# Đặc tả UI cuối — 14 màn hình

**Rubric D — UI/UX cuối (20 điểm)**

Mỗi màn hình gắn với một khung SVG dán được vào Figma. Cột **Khung** là tên file trong
`figma-svg/output/03-final/`.

---

## 1. Danh mục

| # | Màn hình | Route | Khung |
|---|---|---|---|
| S01 | Đăng nhập | `/login` | `s01-dang-nhap.svg` |
| S02 | Tổng quan | `/dashboard` | `s02-tong-quan.svg` |
| S03 | Yêu cầu review | `/reviews` | `s03-yeu-cau-review.svg` |
| S04 | Không gian review | `/reviews/:id` | `s04-khong-gian-review.svg` |
| S05 | Kết quả AI Review | `/reviews/:id/ai-result` | `s05-ket-qua-ai.svg` |
| S06 | Lớp học | `/classes` | `s06-lop-hoc.svg` |
| S07 | Project | `/projects` | `s07-project.svg` |
| S08 | Tài liệu của project | `/projects/:id/documents` | `s08-tai-lieu.svg` |
| S09 | Học kỳ | `/semesters` | `s09-hoc-ky.svg` |
| S10 | Rule set | `/rule-sets` | `s10-rule-set.svg` |
| S11 | Sinh viên | `/students` | `s11-sinh-vien.svg` |
| S12 | Nhóm | `/groups` | `s12-nhom.svg` |
| S13 | Thông báo | `/notifications` | `s13-thong-bao.svg` |
| S14 | Tài khoản | `/profile` | `s14-tai-khoan.svg` |

Vượt yêu cầu tối thiểu 8 màn hình. **14 khung ở 412dp + 3 khung ở 360dp.**

---

## 2. Bố cục chung

Mọi màn hình có cùng bốn phần:

```
┌─────────────────────────────┐
│ Thanh trạng thái (54px)     │  ← vùng an toàn, đồng hồ + pin
├─────────────────────────────┤
│ App bar (56px)              │  ← nút quay lại + tiêu đề (+ hành động phải)
├─────────────────────────────┤
│ Nội dung (cuộn)             │  ← padding ngang 20px
│                             │
├─────────────────────────────┤
│ Bottom nav (64px)           │  ← 5 tab, tab đang chọn nền brand-soft
└─────────────────────────────┘
```

Nền trang: `canvas` `#FAFBFA`. Thẻ: `white` với viền `line` `#E1E7E3`, bo góc 12px.

---

## 3. Đặc tả từng màn hình

### S01 — Đăng nhập

| Phần | Nội dung |
|---|---|
| Logo | Icon trường + tên "Project Review" |
| Tiêu đề | "Hệ thống quản lý học vụ" |
| Phụ | "và review tài liệu cho giảng viên" |
| Form | Ô email (giá trị mẫu `an.nguyen@university.edu.vn`), ô mật khẩu có icon hiện/ẩn |
| Nút | "Đăng nhập" — nút chính, cao 48px, rộng hết |
| Phụ | Link "Quên mật khẩu?" |
| Chân | "Bản demo học tập · Fall 2026" + "Mọi dữ liệu là dữ liệu mẫu" |

### S02 — Tổng quan

| Phần | Nội dung |
|---|---|
| Nhãn nhỏ | "TỔNG QUAN" |
| Tiêu đề | "Chào An" |
| Mô tả | "Việc cần làm trong học kỳ Fall 2026." |
| Thẻ số liệu | Lớp 5 · Sinh viên 59 · Nhóm 14 · Chờ review 7 — lưới 2×2 |
| Khối "Việc cần làm" | 3 dòng có thanh màu bên trái theo mức gấp (amber/rust/danger) |
| Danh sách | "Yêu cầu review gần đây" — 2 thẻ + link "Xem tất cả" |
| Nav | Tab "Tổng quan" đang chọn |

### S03 — Yêu cầu review

| Phần | Nội dung |
|---|---|
| Nhãn nhỏ | "KHÔNG GIAN REVIEW" |
| Tiêu đề | "Yêu cầu review" |
| Mô tả | "Mặc định hiển thị việc cần làm trong học kỳ hiện tại." |
| Tìm kiếm | "Tìm project, tài liệu, sinh viên..." |
| Chip | `Fall 2026` (chọn) · `Chờ review` (chọn) · `Đang review` |
| Sắp xếp | "Mới nhất" + đếm "5 yêu cầu" |
| Danh sách | Thẻ: ngữ cảnh lớp·nhóm·project, tên tài liệu, version, nhãn trạng thái, dòng AI |

### S04 — Không gian review

| Phần | Nội dung |
|---|---|
| Thẻ đầu | Lớp·nhóm, tên tài liệu, version · số trang · định dạng, nhãn trạng thái |
| Khối "Trạng thái" | 3 track: **Tài liệu** (Đã nộp) · **AI Review** (Đã review · 2 lỗi) · **Giảng viên** (Chờ review) |
| Tệp đính kèm | Icon + tên file + dung lượng + thời điểm + nút tải |
| "Phát hiện của AI" | 2 phát hiện đầu, mỗi cái có mức, nhóm lỗi, số trang |
| Tab | 4 tab: **Yêu cầu review** · **Nội dung tài liệu** · **AI Review** · **Feedback** |
| Hành động | Trạng thái `Chờ giảng viên review` → nút **"Bắt đầu review"** |
| Hành động (sau khi bắt đầu) | Trạng thái `Đang review` → 3 nút: **"Phê duyệt"** (chính) · **"Yêu cầu chỉnh sửa"** · **"Không đạt · chỉ cho bài nộp không hợp lệ"** |
| Hộp thoại | Bấm "Phê duyệt" → hộp thoại xác nhận (`role="dialog"`) |

> **Đã kiểm chứng trên bản dựng thật** (`app/journeys.mjs`, 33/33 bước): trạng thái chuyển
> `Chờ giảng viên review` → `Đang review` khi bấm "Bắt đầu review", sau đó mới hiện 3 nút quyết định.
> Đặc tả cũ ghi "2 nút" là **sai** và đã được sửa theo số đo thật.

### S05 — Kết quả AI Review

| Phần | Nội dung |
|---|---|
| Đếm | 3 ô: **2 Lỗi** (rust) · **2 Cảnh báo** (amber) · **1 Gợi ý** (brand) |
| Danh sách | 5 phát hiện, mỗi cái có: nhãn mức, nhóm lỗi, số trang, mô tả |
| Ví dụ | "Không tìm thấy phần 'Mô tả Use Case' cho UC-03" — tr.12 |
| Nút | "Quay lại không gian review" |

### S06 — Lớp học

| Phần | Nội dung |
|---|---|
| Thẻ lớp | Mã lớp (lớn) · môn · học kỳ · số sinh viên · số nhóm · nhãn sức khoẻ |
| Thanh màu | Bên trái theo tình trạng: brand / amber / danger |
| Nav | Tab "Project" |

### S07 — Project

| Phần | Nội dung |
|---|---|
| Thẻ | Tên đồ án, lớp·nhóm, nhãn sức khoẻ, thanh tiến độ, % tiến độ, ghi chú AI |
| Chân thẻ | Deadline + mũi tên sang chi tiết |

### S08 — Tài liệu của project

| Phần | Nội dung |
|---|---|
| Thẻ đầu | Tên project, lớp·nhóm·học kỳ, thanh tiến độ |
| Danh sách | Tài liệu: tên, lab, version, nhãn trạng thái, đếm lỗi AI |

### S09 — Học kỳ

| Phần | Nội dung |
|---|---|
| Thẻ | Tên học kỳ, năm học, khoảng ngày, số lớp, nhãn "Hiện tại" hoặc "Lưu trữ" |
| Nút cuối | "Tạo học kỳ mới" |

### S10 — Rule set

| Phần | Nội dung |
|---|---|
| Thẻ | Tên rule set, mô tả, ba dòng: AI review · SLA ngày · định dạng cho phép |

### S11 — Sinh viên

| Phần | Nội dung |
|---|---|
| Danh sách | Avatar chữ cái, tên, mã số, nhãn lớp, nhóm |
| Chip lọc | "Lớp: SE1701 (SWP391)" kèm nút xoá |

### S12 — Nhóm

| Phần | Nội dung |
|---|---|
| Thẻ | Tên nhóm, lớp·môn, nhãn sức khoẻ, thanh tiến độ, số thành viên |

### S13 — Thông báo

| Phần | Nội dung |
|---|---|
| Thẻ | Icon theo loại, tiêu đề, mô tả, thời gian, chấm xanh nếu chưa đọc |
| Nền | Thông báo chưa đọc dùng `brand-tint` |

### S14 — Tài khoản

| Phần | Nội dung |
|---|---|
| Thẻ hồ sơ | Avatar, tên, vai "Giảng viên / Supervisor", email |
| Học kỳ hiện tại | Fall 2026 + khoảng ngày |
| Cài đặt | Thông báo đẩy · Chế độ hiển thị · Hướng dẫn |
| Đăng xuất | Chữ rust |

---

## 4. Biến thể trạng thái

Không tính là màn hình riêng, nhưng phải có trong file Figma.

| Khung | Trạng thái | Kích hoạt |
|---|---|---|
| `v-s02-offline.svg` | Mất mạng | Hiện banner + nút Thử lại |
| `v-s03-loading.svg` | Đang tải | Skeleton 350ms sau khi đổi bộ lọc |
| `v-s03-empty.svg` | Rỗng | Bộ lọc không khớp gì |
| `v-s03-error.svg` | Lỗi mạng | 2 nút: Thử lại · Xem bản lưu |
| `v-s04-unavailable.svg` | Tài liệu không khả dụng | Tệp bị gỡ |
| `v-s04-decision.svg` | Hộp thoại phê duyệt | Bấm Phê duyệt (sau khi đã "Bắt đầu review") |
| `v-s05-running.svg` | AI đang phân tích | Tiến độ 15/24 trang |

---

## 5. Khung 360dp

Kiểm tra layout không vỡ khi màn hẹp hơn:

| Khung | Ghi chú |
|---|---|
| `r360-s02-tong-quan.svg` | Ít nội dung hơn — khung ngắn hơn 92px |
| `r360-s03-yeu-cau.svg` | Danh sách còn 3 thẻ |
| `r360-s07-project.svg` | Danh sách còn 2 đồ án |

Lưu ý quan trọng: nội dung ở 360dp **khác** 412dp, không phải chỉ thu nhỏ.
Đây là bằng chứng responsive thật, không phải cùng một ảnh đổi khung.

---

## 6. Quy tắc chung

| Quy tắc | Giá trị |
|---|---|
| Padding ngang | 20px |
| Khe giữa các khối | 24px |
| Cao nút | 44–48px |
| Cao ô nhập | 52px |
| Bo góc thẻ | 12px |
| Bo góc nút | 8px |
| Cỡ chữ thân tối thiểu | 13px |
| Nhãn trạng thái | Luôn có chữ, không chỉ màu |
