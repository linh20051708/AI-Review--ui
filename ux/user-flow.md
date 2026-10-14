# User Flow — Hệ thống quản lý học vụ & Review tài liệu


## 0. Mã định danh (tầng 2 và 3)

| Mã | Flow | Loại |
|---|---|---|
| `2-FL-01` | Thuận (happy path): duyệt một tài liệu | Chính |
| `2-FL-02` | Thay thế: so sánh phiên bản trước khi quyết định | Thay thế |
| `2-FL-03` | Lỗi & phục hồi | Bắt buộc |

| Mã | Màn hình (tóm tắt) | Route |
|---|---|---|
| `3-SC-01` | Đăng nhập | `/login` |
| `3-SC-02` | Tổng quan | `/dashboard` |
| `3-SC-03` | Yêu cầu review | `/reviews` |
| `3-SC-04` | Không gian review | `/reviews/:reviewId` |
| `3-SC-05` | Kết quả AI Review | `/reviews/:reviewId/ai-result` |
| `3-SC-06` | Lịch sử phiên bản | `/reviews/:reviewId/versions` |
| `3-SC-07` | Lịch sử review | `/reviews/:reviewId/history` |
| `3-SC-08` | Mục lịch sử review | `/review-history` |
| `3-SC-09` | Lớp học | `/classes` |
| `3-SC-10` | Chi tiết lớp | `/classes/:classId` |
| `3-SC-11` | Project | `/projects` |
| `3-SC-12` | Chi tiết project | `/projects/:projectId` |
| `3-SC-13` | Tài liệu của project | `/projects/:projectId/documents` |
| `3-SC-14` | Tài liệu (toàn bộ) | `/documents` |
| `3-SC-15` | Nhóm | `/groups` |
| `3-SC-16` | Chi tiết nhóm | `/groups/:groupId` |
| `3-SC-17` | Học kỳ | `/semesters` |
| `3-SC-18` | Rule set | `/rule-sets` |
| `3-SC-19` | Môn học | `/courses` |
| `3-SC-20` | Chi tiết môn trong kỳ | `/course-offerings/:offeringId` |
| `3-SC-21` | Sinh viên | `/students` |
| `3-SC-22` | Thông báo | `/notifications` |
| `3-SC-23` | Tài khoản | `/profile` |

Mã cũ tương ứng: `F01`–`F03` và `S01`–`S23`. Chi tiết đầy đủ ở §2 và §3.

Tài liệu này bám **đúng 23 route** trong `app/src/app/router.tsx`. Không có màn hình nào được bịa.

---

## 1. Kiến trúc điều hướng

Ứng dụng dùng **bottom navigation 5 tab** (`app/src/components/layout/BottomNavigation.tsx`):

| Tab | Route | Gộp thêm |
|---|---|---|
| Tổng quan | `/dashboard` | — |
| Project | `/projects` | `/classes` `/groups` `/semesters` `/documents` `/rule-sets` `/courses` |
| Review | `/reviews` | `/review-history` |
| Thông báo | `/notifications` | — |
| Tài khoản | `/profile` | — |

Ở màn hình ≥1024px, app chuyển sang `SideNavigation` và nội dung mở rộng tới 1440px.

---

## 2. Danh sách màn hình (23 route)

| Mã | Màn hình | Route | Nhóm |
|---|---|---|---|
| S01 | Đăng nhập | `/login` | auth |
| S02 | Tổng quan | `/dashboard` | dashboard |
| S03 | Yêu cầu review | `/reviews` | review |
| S04 | Không gian review | `/reviews/:reviewId` | review |
| S05 | Kết quả AI Review | `/reviews/:reviewId/ai-result` | review |
| S06 | Lịch sử phiên bản | `/reviews/:reviewId/versions` | review |
| S07 | Lịch sử review | `/reviews/:reviewId/history` | review |
| S08 | Mục lịch sử review | `/review-history` | review |
| S09 | Lớp học | `/classes` | học vụ |
| S10 | Chi tiết lớp | `/classes/:classId` | học vụ |
| S11 | Project | `/projects` | đồ án |
| S12 | Chi tiết project | `/projects/:projectId` | đồ án |
| S13 | Tài liệu của project | `/projects/:projectId/documents` | đồ án |
| S14 | Tài liệu (toàn bộ) | `/documents` | đồ án |
| S15 | Nhóm | `/groups` | học vụ |
| S16 | Chi tiết nhóm | `/groups/:groupId` | học vụ |
| S17 | Học kỳ | `/semesters` | học vụ |
| S18 | Rule set | `/rule-sets` | cấu hình |
| S19 | Môn học | `/courses` | học vụ |
| S20 | Chi tiết môn trong kỳ | `/course-offerings/:offeringId` | học vụ |
| S21 | Sinh viên | `/students` | học vụ |
| S22 | Thông báo | `/notifications` | hệ thống |
| S23 | Tài khoản | `/profile` | hệ thống |

**Số màn hình tối thiểu: 23** (không tính dialog/state variants).

---

## 3. Ba luồng người dùng

### Luồng 1 (F01) — Thuận (Happy path): duyệt một tài liệu

```
S02 Tổng quan
  → thấy thẻ "Việc cần làm" → chọn "Tài liệu đang chờ review"
  → S03 Yêu cầu review            (lọc sẵn: học kỳ hiện tại + Chờ review)
  → chọn một dòng → S04 Không gian review
      · 3 track hiện trạng thái: Tài liệu / AI / Giảng viên
      · xem tệp đính kèm + phát hiện AI
  → mở S05 Kết quả AI Review      (2 lỗi · 2 cảnh báo · 1 gợi ý)
  → quay lại S04 → bấm "Phê duyệt"
  → [Hộp thoại xác nhận] "Phê duyệt tài liệu?"
  → Đã phê duyệt → mở khoá mục phụ thuộc
  → S22 Thông báo: nhóm nhận thông báo
```

**Thời gian mục tiêu:** ≤ 90 giây cho một tài liệu.

### Luồng 2 (F02) — Thay thế: so sánh phiên bản trước khi quyết định

```
S04 Không gian review (v2.1)
  → S06 Lịch sử phiên bản
  → chọn phiên bản cũ v1.3
  → đối chiếu phát hiện AI giữa 2 phiên bản
  → S07 Lịch sử review (audit trail: ai làm gì, lúc nào)
  → quay lại S06 → S04
  → ra quyết định có căn cứ
```

Dùng khi: nhóm nộp lại nhiều lần, giảng viên cần biết **đã sửa được gì** so với lần trước.

### Luồng 3 (F03) — Lỗi & phục hồi (bắt buộc có)

```
S03 Yêu cầu review
  → đổi bộ lọc → skeleton hiện 350ms (`ReviewListSkeleton`)
  → nhánh A (thành công) → hiện danh sách → tiếp Luồng 1
  → nhánh B (lỗi mạng):
        → trang lỗi: "Không tải được danh sách"
        → nút "Thử lại"        (tối đa 3 lần)
        → nút "Xem bản lưu"    (dữ liệu đã tải trước đó vẫn xem được)
        → nếu vẫn lỗi sau 3 lần → tự chuyển sang bản lưu, có banner giải thích
```

Ngoài ra hệ thống còn 2 trạng thái phục hồi khác:

| Tình huống | Xử lý | Nguồn |
|---|---|---|
| Tài liệu bị gỡ / hết hạn lưu | Trang "Tài liệu không khả dụng" + nút Tải lại; vẫn xem được phản hồi cũ | `v-s04-unavailable` |
| Mục phụ thuộc chưa duyệt | Nút gửi review bị khoá, kèm lý do | `submissionLocked` |

---

## 4. Ma trận nút Back

Mọi màn hình đều có đường quay lại — **không có ngõ cụt**.

| Từ màn hình | Nút Back đưa về | Ghi chú |
|---|---|---|
| S01 Đăng nhập | — | không có back |
| S02 Tổng quan | — | tab gốc |
| S03 Yêu cầu review | S02 | tab gốc của nhóm Review |
| S04 Không gian review | S03 | giữ nguyên bộ lọc đã chọn |
| S05 Kết quả AI | S04 | có nút phụ "Quay lại không gian review" |
| S06 Lịch sử phiên bản | S04 | |
| S07 Lịch sử review | S04 | |
| S08 Mục lịch sử | S03 | |
| S09 Lớp học | S02 | tab Project |
| S10 Chi tiết lớp | S09 | |
| S11 Project | S02 | tab Project |
| S12 Chi tiết project | S11 | |
| S13 Tài liệu project | S12 | |
| S14 Tài liệu (toàn bộ) | S02 | |
| S15 Nhóm | S09 | |
| S16 Chi tiết nhóm | S15 | |
| S17 Học kỳ | S09 | |
| S18 Rule set | S09 | |
| S19 Môn học | S09 | |
| S20 Chi tiết môn | S19 | |
| S21 Sinh viên | S09 | |
| S22 Thông báo | — | tab gốc |
| S23 Tài khoản | — | tab gốc |

Nút Back của thiết bị/trình duyệt quay về màn trước trong lịch sử, **không thoát app**.
Ở màn tab gốc, bấm Back thoát app (hành vi chuẩn Android).

Route không khớp (`*`) tự chuyển về `/dashboard`.

---

## 5. Biến thể trạng thái (KHÔNG tính là màn hình riêng)

| Màn hình | Biến thể | Kích hoạt |
|---|---|---|
| S02 Tổng quan | Mất mạng | Không có kết nối, hiện banner + nút Thử lại |
| S03 Yêu cầu review | Đang tải | Skeleton 350ms sau khi đổi bộ lọc |
| S03 Yêu cầu review | Rỗng | Bộ lọc không khớp gì → `EmptyState` + "Xóa bộ lọc" |
| S03 Yêu cầu review | Lỗi mạng | Tải thất bại → 2 nút phục hồi |
| S04 Không gian review | Không khả dụng | Tệp bị gỡ |
| S04 Không gian review | Hộp thoại quyết định | Bấm Phê duyệt / Cần chỉnh sửa |
| S05 Kết quả AI | Đang phân tích | AI chạy, hiện tiến độ 15/24 trang |
| S11 Project | Cần chú ý | Nhóm có lỗi AI chưa xử lý |

---

## 6. Trạng thái rỗng & lỗi

Luật áp cho toàn hệ thống:

1. **Trạng thái rỗng luôn có một hành động gợi ý** — ví dụ "Xóa bộ lọc".
2. **Trạng thái lỗi luôn có ≥2 đường phục hồi** — Thử lại và Xem bản lưu.
3. **Skeleton hiện ngay khi đổi bộ lọc**, không để màn hình trắng.
4. **Không bao giờ chặn người dùng mà không nói lý do** — nút bị khoá phải kèm giải thích.

---

## 7. Ghi chú khả năng tiếp cận

| Yêu cầu | Ngưỡng | Trạng thái |
|---|---|---|
| Vùng bấm | ≥ 48×48 dp (C4) | ⚠️ app nền chưa đạt ở link phụ và chip (đo thật: 17–40px) |
| Tương phản chữ | ≥ 4.5:1 | ✅ đạt — thấp nhất 4.78 (`muted` trên `canvas`) |
| Cỡ chữ thân | ≥ 14 sp (C4) | ✅ đạt |
| Bề rộng hỗ trợ | 360dp & 412dp | ✅ không tràn ngang ở cả hai |
| Nhãn điều hướng | min-height 48px, có `aria-label` | ✅ đạt |

Số đo cụ thể: `facts/MEASUREMENTS.md`.

---

## 8. Mã định danh (Chuẩn chung C7)

| Tiền tố | Ý nghĩa | Nơi định nghĩa |
|---|---|---|
| `E-xx` | Bằng chứng (nỗi đau ↔ code) | `ux/persona.md` §1 (bảng E-01…E-06) |
| `P01`, `P02` | Persona | `ux/persona.md` |
| `F01`–`F03` | Flow | tài liệu này §3 |
| `S01`–`S23` | Màn hình | tài liệu này §2 |
| `I01`–`I03` | Vòng lặp AI | `ai-design-log.md` |
| `D01`–`D07` | Quyết định thiết kế | `design-decisions.md` |
| `T01`–`T11` | Test case | `ux/persona-decisions.md` §2 |
| `AS-xx` | Giả định cần kiểm | `ux/assumption-backlog.md` |

**Chuỗi truy vết:** `E → Insight → P / Need → F → S → T` (bảng đầy đủ ở `ux/persona-decisions.md` §2).
Mọi màn hình đều thuộc ít nhất một flow.