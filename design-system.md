# Design System — Hệ thống quản lý học vụ & Review tài liệu

**Rubric E — Design system & component (15 điểm)**

Toàn bộ token dưới đây **trích từ code nền thật** (`app/src/index.css` khối `@theme`).
Không có màu, cỡ chữ hay khoảng cách nào được tự thêm vào.

---

## 1. Nguyên tắc

1. **Một nguồn sự thật.** Mọi giá trị nằm trong `@theme` của `index.css`, dùng qua biến CSS.
2. **Nền sáng mặc định.** Không có chế độ tối trong phạm vi bài này.
3. **Bốn tầng màu.** Thương hiệu → chữ → viền/nền → trạng thái.
4. **Trạng thái có cặp màu riêng.** Mỗi trạng thái có màu chữ và màu nền nhạt tương ứng.
5. **Không màu nào ngoài bảng.** Nếu cần màu mới, phải bổ sung token trước.

---

## 2. Màu

### Nhóm thương hiệu

| Token | Mã | Dùng cho |
|---|---|---|
| `--color-brand` | `#146B55` | Nút chính, tab đang chọn, chữ nhấn |
| `--color-brand-soft` | `#EAF4ED` | Nền chip đang chọn |
| `--color-brand-tint` | `#F2F7F3` | Nền thông báo chưa đọc |

### Nhóm chữ

| Token | Mã | Dùng cho |
|---|---|---|
| `--color-ink` | `#24332D` | Chữ chính |
| `--color-muted` | `#66736D` | Chữ phụ, nhãn, ghi chú |

### Nhóm viền & nền

| Token | Mã | Dùng cho |
|---|---|---|
| `--color-line` | `#E1E7E3` | Viền, đường phân cách |
| `--color-canvas` | `#FAFBFA` | Nền trang |
| `--color-subtle` | `#F7F9F7` | Nền ô nhập, thẻ số liệu |

### Nhóm trạng thái

| Trạng thái | Màu chữ | Màu nền | Dùng cho |
|---|---|---|---|
| olive | `#637344` | `#F1F4E9` | Đã nộp, đúng tiến độ |
| amber | `#756534` | `#F5F2E7` | Chờ review, sắp đến hạn |
| rust | `#A65335` | `#FBF0EA` | Cần chỉnh sửa, lỗi AI |
| danger | `#A34343` | `#FAEEEE` | Không đạt, quá hạn |

---

## 3. Độ tương phản — đo thật

Tính bằng công thức độ chói tương đối WCAG 2.x. Ngưỡng: văn bản thường ≥ 4.5:1.

| Cặp | Tỉ lệ | Đạt |
|---|---|---|
| `ink` trên `canvas` | 13.24 | ✅ |
| `ink` trên `white` | 13.24 | ✅ |
| `brand` trên `white` | 6.43 | ✅ |
| `brand` trên `canvas` | 6.20 | ✅ |
| `danger` trên `white` | 6.10 | ✅ |
| `brand` trên `brand-tint` | 5.94 | ✅ |
| `amber` trên `white` | 5.73 | ✅ |
| `brand` trên `brand-soft` | 5.72 | ✅ |
| `danger` trên `danger-soft` | 5.38 | ✅ |
| `rust` trên `white` | 5.37 | ✅ |
| `olive` trên `white` | 5.16 | ✅ |
| `amber` trên `amber-soft` | 5.11 | ✅ |
| `muted` trên `white` | 4.96 | ✅ |
| `rust` trên `rust-soft` | 4.80 | ✅ |
| `muted` trên `canvas` | **4.78** | ✅ sát ngưỡng |
| `muted` trên `subtle` | 4.68 | ✅ |
| `olive` trên `olive-soft` | 4.64 | ✅ |

**Kết luận: 17/17 cặp đạt WCAG AA.** Thấp nhất là `muted` trên `canvas` = 4.78.

---

## 4. Kiểu chữ

Font: **Inter** (`--font-sans`), dự phòng `ui-sans-serif, system-ui, sans-serif`.

| Vai trò | Cỡ / đậm | Dùng cho |
|---|---|---|
| Tiêu đề trang | 22px / 700 | Tên màn hình |
| Tiêu đề mục | 20px / 700 | Hồ sơ, Lớp học |
| Tiêu đề khối | 16px / 600 | Tên tài liệu, tên thẻ |
| Thân | 14px / 400 | Nội dung chính |
| Thân nhỏ | 13px / 500 | Mô tả, placeholder |
| Nhãn | 12px / 600 | Nhãn trạng thái |
| Siêu nhỏ | 11px / 500 | Thời gian, ngữ cảnh |

Thân tối thiểu **14sp** (Chuẩn chung C4) — không dùng cỡ nhỏ hơn cho nội dung đọc.

---

## 5. Khoảng cách

| Token | Giá trị | Dùng cho |
|---|---|---|
| `xs` | 4 | Khe giữa icon và chữ |
| `s` | 8 | Khe giữa các chip |
| `m` | 12 | Padding trong thẻ nhỏ |
| `l` | 16 | Padding trong thẻ |
| `xl` | 24 | Khe giữa các khối |
| `xxl` | 32 | Khe giữa các nhóm |
| `huge` | 48 | Lề trên/dưới khối lớn |

Padding ngang màn hình: **20px**.

---

## 6. Bo góc

| Token | Giá trị | Dùng cho |
|---|---|---|
| `chip` | 6 | Chip, nhãn nhỏ |
| `button` | 8 | Nút, ô nhập |
| `card` | 12 | Thẻ |
| `dialog` | 16 | Hộp thoại |
| `pill` | 999 | Nhãn trạng thái, thanh tiến độ |

---

## 7. Độ nổi

| Token | CSS | Dùng cho |
|---|---|---|
| `elevation-1` | `0 1px 2px rgba(36,51,45,.06)` | Thẻ phẳng |
| `elevation-2` | `0 2px 8px rgba(36,51,45,.08)` | Thẻ nổi, menu |
| `elevation-3` | `0 8px 24px rgba(36,51,45,.12)` | Hộp thoại, bottom sheet |

---

## 8. Chín nhóm component bắt buộc

Mỗi nhóm có khung riêng ở page `05 Components`.

| # | Nhóm | File SVG | Trạng thái phải có |
|---|---|---|---|
| 1 | Button | `comp-button` | Mặc định · Nhấn giữ · Vô hiệu (× 3 biến thể) |
| 2 | Text field | `comp-textfield` | Mặc định · Focus · Lỗi · Vô hiệu |
| 3 | Card | `comp-card` | Thẻ review · Thẻ lớp · Thẻ project (có tiến độ) |
| 4 | Navigation | `comp-navigation` | Bottom nav 5 tab · Tab phân đoạn 3 mục |
| 5 | App bar | `comp-appbar` | Tiêu đề đơn · Tiêu đề phụ + hành động |
| 6 | Dialog | `comp-dialog` | Hộp thoại 2 nút · Banner cảnh báo |
| 7 | Loading | `comp-loading` | Skeleton danh sách · Tiến độ AI |
| 8 | Empty | `comp-empty` | Rỗng + hành động gợi ý |
| 9 | Error | `comp-error` | Lỗi + 2 đường phục hồi · Banner "thử tối đa 3 lần" |

### Biến thể trạng thái bắt buộc

| Component | Trạng thái |
|---|---|
| Button | mặc định, nhấn giữ, vô hiệu |
| Text field | mặc định, focus, lỗi, vô hiệu |
| Card | mặc định, có tiến độ, có nhãn trạng thái |
| Dialog | xác nhận, cảnh báo |
| Loading | skeleton, tiến độ |
| Empty | có hành động |
| Error | có 2 đường phục hồi |

### Biến thể dùng token nào (kiểm tra được)

| Biến thể | Token áp dụng |
|---|---|
| Button / nhấn giữ | `brand` phủ mờ, hoặc `brand-soft` + viền `brand` |
| Button / vô hiệu | `brand` phủ mờ ~35% |
| Text field / focus | nền `brand-tint`, viền `brand` |
| Text field / lỗi | nền `danger-soft`, viền `danger` |
| Chip / đang chọn | nền `brand-soft`, chữ `brand`, viền `brand` |

---

## 9. Quy tắc áp dụng

1. **Không hardcode màu.** Luôn dùng biến CSS.
2. **Không dùng cỡ chữ ngoài thang.** Nếu thiếu, bổ sung token trước.
3. **Trạng thái luôn có nhãn chữ**, không chỉ màu (cho người mù màu).
4. **Vùng bấm tối thiểu 48dp** (Chuẩn chung C4) — đây là yêu cầu, không phải gợi ý.
5. **Mọi danh sách có 4 trạng thái:** đang tải, có dữ liệu, rỗng, lỗi.

> **Chênh lệch đã biết:** code nền hiện **chưa** đạt quy tắc 4 ở nhiều chỗ (≥118 phần tử ở màn Sinh viên,
> đo theo ngưỡng 44px cũ; theo 48dp con số cao hơn).
> Design system này ghi ngưỡng đúng; việc sửa code nằm ngoài phạm vi Lab 2. Số đo: `facts/MEASUREMENTS.md`.

---

## 10. Bản đồ token sang Figma

Khi dựng page `04 Design System`, tạo **Variables** theo bảng này:

| Nhóm Figma | Tên biến | Giá trị |
|---|---|---|
| Color | `color/brand` | `#146B55` |
| Color | `color/brand-soft` | `#EAF4ED` |
| Color | `color/brand-tint` | `#F2F7F3` |
| Color | `color/ink` | `#24332D` |
| Color | `color/muted` | `#66736D` |
| Color | `color/line` | `#E1E7E3` |
| Color | `color/canvas` | `#FAFBFA` |
| Color | `color/subtle` | `#F7F9F7` |
| Color | `color/olive` | `#637344` |
| Color | `color/amber` | `#756534` |
| Color | `color/rust` | `#A65335` |
| Color | `color/danger` | `#A34343` |
| Number | `spacing/xs` … `spacing/huge` | 4 · 8 · 12 · 16 · 24 · 32 · 48 |
| Number | `radius/chip` … `radius/pill` | 6 · 8 · 12 · 16 · 999 |
| String | `font/family` | Inter |

Đổi `color/brand` ở page `04` sẽ tự cập nhật mọi khung đã gán biến — đây là câu hỏi giảng viên hay hỏi.
