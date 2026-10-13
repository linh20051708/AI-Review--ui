# User Flow — Hệ thống quản lý học vụ & Review tài liệu

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

### Luồng 1 — Thuận (Happy path): duyệt một tài liệu

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

### Luồng 2 — Thay thế: so sánh phiên bản trước khi quyết định

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

### Luồng 3 — Lỗi & phục hồi (bắt buộc có)

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
| Vùng bấm | ≥ 44×44 px | ⚠️ app nền chưa đạt ở link phụ và chip (đo thật: 17–40px) |
| Tương phản chữ | ≥ 4.5:1 | ✅ đạt — thấp nhất 4.78 (`muted` trên `canvas`) |
| Cỡ chữ thân | ≥ 13 px | ✅ đạt |
| Bề rộng hỗ trợ | 360dp & 412dp | ✅ không tràn ngang ở cả hai |
| Nhãn điều hướng | min-height 48px, có `aria-label` | ✅ đạt |

Số đo cụ thể: `facts/MEASUREMENTS.md`.
