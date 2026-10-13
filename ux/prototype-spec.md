# Đặc tả prototype — 3 luồng tương tác

**Rubric F — Prototype tương tác (10 điểm)**

> **Ghi chú trung thực:** prototype **chưa được dựng trong Figma** (cần tài khoản Figma).
> Nhưng 3 luồng dưới đây **đã chạy thật** trên bản dựng thật bằng `app/journeys.mjs` —
> **33/33 bước OK, 0 thất bại**, gồm cả hộp thoại xác nhận (`dialog=1`) và 360dp không tràn.
> Mọi màn hình tham chiếu đều có thật trong `app/src/app/router.tsx`.

---

## 1. Chuẩn bị trước khi dựng prototype

1. Dán 48 khung từ `figma-svg/output/` vào 5 page (xem `README.md` §2.2)
2. Tạo page thứ 6 tên `06 Prototype` để chứa các khung nối
3. Bật chế độ Prototype, nối các frame theo §2–§4

**Lưu ý:** khung dán từ SVG **không có** Auto Layout và không có link prototype.
Phải tự thêm sau khi dán.

---

## 2. Luồng 1 — Thuận: duyệt một tài liệu

| Bước | Từ | Hành động | Đến |
|---|---|---|---|
| 1 | `s02-tong-quan` | Bấm thẻ "Tài liệu đang chờ review" | `s03-yeu-cau-review` |
| 2 | `s03-yeu-cau-review` | Bấm thẻ đầu tiên | `s04-khong-gian-review` |
| 3 | `s04-khong-gian-review` | Bấm "Xem phát hiện AI" | `s05-ket-qua-ai` |
| 4 | `s05-ket-qua-ai` | Bấm "Quay lại không gian review" | `s04-khong-gian-review` |
| 5 | `s04-khong-gian-review` | Bấm **"Bắt đầu review"** | `s04-khong-gian-review` (trạng thái → `Đang review`) |
| 6 | `s04-khong-gian-review` (đang review) | Bấm **"Phê duyệt"** | `v-s04-decision` (overlay) |
| 7 | `v-s04-decision` | Bấm "Phê duyệt" | `s04-khong-gian-review` (đã duyệt) |
| 8 | `s04-khong-gian-review` | Nút Back | `s03-yeu-cau-review` |
| 9 | `s03-yeu-cau-review` | Tab "Thông báo" | `s13-thong-bao` |

**Hiệu ứng cần thêm:**
- Bước 5: overlay hiện với hiệu ứng mờ dần 200ms
- Bước 6: sau khi duyệt, nhãn trạng thái đổi từ amber sang brand

---

## 3. Luồng 2 — Thay thế: so sánh phiên bản

| Bước | Từ | Hành động | Đến |
|---|---|---|---|
| 1 | `s04-khong-gian-review` | Bấm "Lịch sử phiên bản" | `s06-lich-su-phien-ban` |
| 2 | `s06-lich-su-phien-ban` | Bấm phiên bản v1.3 | khung chi tiết v1.3 |
| 3 | khung v1.3 | Bấm "So sánh" | khung so sánh 2 phiên bản |
| 4 | khung so sánh | Nút Back | `s06-lich-su-phien-ban` |
| 5 | `s06-lich-su-phien-ban` | Nút Back | `s04-khong-gian-review` |
| 6 | `s04-khong-gian-review` | Bấm "Phê duyệt" | `v-s04-decision` |

**Ghi chú:** các khung `s06-lich-su-phien-ban`, khung v1.3, khung so sánh **chưa có trong bộ SVG**.
Cần dựng thêm khi làm prototype — mô tả nằm ở `ux/final-ui-spec.md` §3 (route `/reviews/:id/versions`).

---

## 4. Luồng 3 — Lỗi & phục hồi (bắt buộc)

| Bước | Từ | Hành động | Đến |
|---|---|---|---|
| 1 | `s03-yeu-cau-review` | Bấm chip "Đang review" | `v-s03-loading` |
| 2 | `v-s03-loading` | Tự chuyển sau 350ms | `s03-yeu-cau-review` (có kết quả) |
| 3 | `s03-yeu-cau-review` | Bấm chip không khớp gì | `v-s03-empty` |
| 4 | `v-s03-empty` | Bấm "Xóa bộ lọc" | `s03-yeu-cau-review` |
| 5 | `s03-yeu-cau-review` | Mô phỏng mất mạng | `v-s03-error` |
| 6 | `v-s03-error` | Bấm "Thử lại" ×3 | vẫn `v-s03-error` |
| 7 | `v-s03-error` | Bấm "Xem bản lưu" | `s03-yeu-cau-review` (dữ liệu cũ) |

**Hiệu ứng cần thêm:**
- Bước 1→2: skeleton hiện rồi thay bằng danh sách, dùng "After delay 350ms"
- Bước 5: chuyển màn tức thì, có thể dùng "On click" ở một nút ẩn để demo

---

## 5. Hiệu ứng bắt buộc phải có

| Hiệu ứng | Ở đâu | Thông số |
|---|---|---|
| Overlay hộp thoại | `v-s04-decision` | Mờ dần 200ms |
| Skeleton → dữ liệu | `v-s03-loading` → `s03-yeu-cau-review` | Sau 350ms |
| AI đang phân tích → kết quả | `v-s05-running` → `s05-ket-qua-ai` | Sau 1500ms |
| Chuyển màn | Mọi link | Tức thì (Smart Animate nếu muốn mượt) |
| Tab đang chọn | Bottom nav | Đổi nền sang `brand-soft` |

---

## 6. Biến thể trạng thái phải dựng

| Màn hình | Biến thể | Điều kiện |
|---|---|---|
| S03 | Đang tải | Vừa đổi bộ lọc |
| S03 | Rỗng | Bộ lọc không khớp |
| S03 | Lỗi mạng | Tải thất bại |
| S04 | Đã duyệt | Sau khi duyệt |
| S04 | Tài liệu không khả dụng | Tệp bị gỡ |
| S05 | Đang phân tích | AI chạy |
| S02 | Mất mạng | Không có kết nối |

---

## 7. Script demo 5 phút

| Thời lượng | Việc | Cách chứng minh |
|---|---|---|
| 0:00–0:30 | Kiểm tra 6 page đúng thứ tự | Mở panel Pages, đọc tên |
| 0:30–1:30 | Chạy luồng 1 đầu-cuối | Bấm qua 9 bước |
| 1:30–2:15 | Chạy luồng 2 | So sánh phiên bản |
| 2:15–3:15 | Chạy luồng 3 | Chứng minh ≥1 lỗi + phục hồi |
| 3:15–3:45 | Hộp thoại + chuyển đang tải → kết quả | Bấm Phê duyệt, xem overlay |
| 3:45–4:15 | Component: Auto Layout, biến thể, instance | Mở page 05 |
| 4:15–4:35 | Đổi `color/brand` ở page 04 | Mọi khung tự đổi màu |
| 4:35–5:00 | Mở `ai-design-log.md` | Chỉ 1 vòng lặp đầy đủ |

---

## 8. Danh sách kiểm trước khi nộp

| # | Kiểm | Đạt |
|---|---|---|
| 1 | File Figma có đúng 6 page, đúng tên, đúng thứ tự | ⬜ |
| 2 | Page `03 Final UI` có ≥8 màn hình khác nhau | ⬜ |
| 3 | Cả 3 luồng chạy hết, không ngõ cụt | ⬜ |
| 4 | Có ≥1 luồng lỗi và đường phục hồi hoạt động | ⬜ |
| 5 | Page `05 Components` có Auto Layout + biến thể + instance | ⬜ |
| 6 | Page `04 Design System` có Variables/styles | ⬜ |
| 7 | Đổi `color/brand` → mọi khung tự cập nhật | ⬜ |
| 8 | Nút Back hoạt động đúng ma trận trong `ux/user-flow.md` §4 | ⬜ |
| 9 | Link Figma mở được ở chế độ ẩn danh | ⬜ |
| 10 | Đã điền link vào `README.md` §6 | ⬜ |

---

## 9. Những gì dán SVG KHÔNG tạo được (phải làm tay)

| Thiếu | Cách khắc phục |
|---|---|
| Auto Layout | Chọn frame → Shift+A, đặt hướng và khe |
| Variables | Tạo trong panel Variables theo `design-system.md` §10 |
| Component | Chọn nhóm → Ctrl+Alt+K |
| Biến thể | Thêm property cho component set |
| Instance | Thay khung bằng instance sau khi tạo component |
| Prototype link | Nối trong chế độ Prototype theo §2–§4 |
| Drop shadow | SVG mất filter — chọn frame → Effects → Drop shadow |
| Ảnh thật | Chỗ ảnh là khung xám ghi "Ảnh mẫu" — chèn ảnh sau |
