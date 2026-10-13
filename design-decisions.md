# Quyết định thiết kế — chấp nhận / sửa / từ chối

**Rubric C và E** — ghi lại từng đề xuất của AI và lý do giữ hay bỏ.

Mỗi quyết định gắn với **bằng chứng đo được** hoặc **ràng buộc trong code nền**, không dựa cảm tính.

---

## 1. Bảy quyết định

| # | Đề xuất | Quyết định | Lý do | Bằng chứng |
|---|---|---|---|---|
| D1 | Bố cục 3 màn hình chính + bottom nav 5 tab | **Chấp nhận** | Khớp code nền | `BottomNavigation.tsx` có đúng 5 tab |
| D2 | Padding thẻ 16px, header 56px | **Sửa** | 16px hơi chật khi có nhãn trạng thái | `.mobile-header-inner` min-height 56px |
| D3 | Đổi `muted` sang màu tối hơn để tăng tương phản | **Từ chối** | Đã đạt 4.78, không cần sửa | `facts/MEASUREMENTS.md` §4 |
| D4 | Thêm công tắc chế độ tối | **Từ chối** | Ngoài phạm vi, tăng gấp đôi việc kiểm tra | Quy ước dự án: nền sáng |
| D5 | Thêm băng chuyền tự chạy ở Tổng quan | **Từ chối** | Tự chạy gây mất kiểm soát, không giải quyết vấn đề | Nielsen #3 |
| D6 | Huy hiệu khoảng cách ở thẻ project | **Chấp nhận** | Giúp nhận ra nhóm muộn mà không phải mở | `GroupHealth` có `overdue` |
| D7 | Thêm hộp thoại xác nhận trước khi phê duyệt | **Sửa** | Cần thiết nhưng phải có nút phục hồi to | `ConfirmModal` đã có trong code nền |

**Tổng: 2 chấp nhận · 2 sửa · 3 từ chối.**

---

## 2. Chi tiết từng quyết định

### D1 — Bố cục 3 màn hình chính + bottom nav — CHẤP NHẬN

**Đề xuất của AI:** dùng bottom navigation với 5 mục cho màn hình chính.

**Kiểm chứng:** `app/src/components/layout/BottomNavigation.tsx` định nghĩa đúng 5 tab:
`Tổng quan` · `Project` · `Review` · `Thông báo` · `Tài khoản`.

**Kết luận:** chấp nhận. AI trùng với code nền — không có gì để sửa.

**Ảnh hưởng Figma:** page `03 Final UI` mọi khung đều có bottom nav; page `05` có `comp-navigation`.

---

### D2 — Padding thẻ và chiều cao header — SỬA

**Đề xuất của AI:** padding thẻ 16px, header 56px.

**Vấn đề:** khi thẻ có cả nhãn trạng thái (cao 22px) và dòng ghi chú AI, padding 16px làm
nội dung sát mép — đo được khoảng cách chỉ còn 6px ở một số chỗ.

**Sửa thành:** padding thẻ **16px ngang, 18px dọc**; header giữ **56px** (khớp code nền).

**Kiểm chứng:** `.mobile-header-inner { min-height: 56px }` trong `app/src/index.css`.

---

### D3 — Đổi `muted` để tăng tương phản — TỪ CHỐI

**Đề xuất của AI:** đổi `muted` từ `#66736D` sang màu tối hơn để chắc chắn đạt chuẩn.

**Kiểm chứng bằng số:** `muted` trên `canvas` = **4.78**, trên `white` = **4.96**, trên `subtle` = **4.68**.
Cả ba đều **trên ngưỡng 4.5**.

**Kết luận:** từ chối. Sửa sẽ làm lệch khỏi token code nền mà không đem lại lợi ích đo được.
Đây là ví dụ **không làm theo AI khi số liệu không ủng hộ**.

---

### D4 — Thêm chế độ tối — TỪ CHỐI

**Đề xuất của AI:** thêm công tắc sáng/tối trong màn Tài khoản.

**Lý do từ chối:**
1. Quy ước dự án: nền sáng mặc định trừ khi có yêu cầu rõ ràng.
2. Phạm vi Lab 2 không yêu cầu chế độ tối.
3. Nếu thêm, phải kiểm tương phản **gấp đôi số cặp màu** → tăng rủi ro sai.

**Kết luận:** từ chối. Ngoài phạm vi, tăng việc mà không giải quyết vấn đề nào của persona.

---

### D5 — Băng chuyền tự chạy — TỪ CHỐI

**Đề xuất của AI:** thêm băng chuyền ảnh tự chạy ở màn Tổng quan cho sinh động.

**Lý do từ chối:**
1. Tự chạy làm mất kiểm soát — người dùng không kịp đọc (Nielsen #3).
2. Persona chính mở app để **biết việc cần làm**, không phải để xem cho vui.
3. Tốn không gian của khối việc cần làm.

**Kết luận:** từ chối.

---

### D6 — Huy hiệu khoảng cách ở thẻ project — CHẤP NHẬN

**Đề xuất của AI:** hiện huy hiệu "Quá hạn" / "Sắp đến hạn" ngay trên thẻ project.

**Kiểm chứng:** `GroupHealth` trong `types/index.ts` đã có sẵn `overdue` và `dueSoon`,
kèm nhãn tiếng Việt trong `groupHealthMeta`. Nghĩa là dữ liệu đã có, chỉ chưa hiện ở thẻ.

**Kết luận:** chấp nhận — giúp giảng viên nhận ra nhóm muộn mà không phải mở chi tiết.

**Ảnh hưởng Figma:** page `03 Final UI` → `s07-project` có huy hiệu trạng thái sức khoẻ nhóm.

---

### D7 — Hộp thoại xác nhận trước khi phê duyệt — SỬA

**Đề xuất của AI:** thêm hộp thoại xác nhận trước khi phê duyệt tài liệu.

**Vấn đề:** bản AI sinh có nút "Phê duyệt" là nút nguy hiểm nhưng **cùng kích thước** với nút "Hủy",
và không cảnh báo khi tài liệu còn lỗi AI chưa xử lý.

**Sửa thành:**
1. Nút "Phê duyệt" là nút chính, nút "Hủy" là nút phụ (phân cấp rõ)
2. Nếu còn lỗi AI chưa xử lý → thêm banner cảnh báo phía trên
3. Cả hai nút cao **44px**

**Kiểm chứng:** `ConfirmModal` đã tồn tại trong code nền; `AICounts.errors` cho biết còn lỗi hay không.

**Ảnh hưởng Figma:** page `03 Final UI` → `v-s04-decision`; page `05` → `comp-dialog`.

---

## 3. Trả lời câu hỏi "đề xuất nào của AI bị từ chối và vì sao"

**Trả lời ngắn:** ba đề xuất bị từ chối — D3 (đổi màu `muted`), D4 (chế độ tối), D5 (băng chuyền tự chạy).

**Đề xuất bị từ chối rõ nhất: D3 — đổi `muted` sang màu tối hơn.**

Lý do: AI đề xuất dựa trên **giả định** rằng màu hiện tại có thể chưa đạt chuẩn.
Tôi đo bằng công thức WCAG và kết quả là **4.78** — đã trên ngưỡng 4.5.
Làm theo AI ở đây sẽ đổi token khỏi code nền mà không đo được lợi ích nào.

Bài học: **đo trước khi sửa.** Đề xuất của AI không tự động đúng.

---

## 4. Bảng token bị ảnh hưởng

Nếu đổi các token sau, các khung này tự cập nhật (khi đã gán Variables trong Figma):

| Token đổi | Khung bị ảnh hưởng |
|---|---|
| `color/brand` | Nút chính, tab đang chọn, chữ nhấn — gần như mọi khung ở page 03 |
| `color/brand-soft` | Chip đang chọn, nền nhãn ở page 03 và 05 |
| `color/ink` | Toàn bộ chữ chính |
| `spacing/*` | Khoảng cách trong mọi thẻ ở page 03, 05 |
| `radius/card` | Mọi thẻ ở page 03, 05 |

---

## 5. Quyết định KHÔNG hỏi người dùng (tự chốt)

| Việc | Quyết định | Lý do |
|---|---|---|
| Đề tài | Hệ thống quản lý học vụ & review tài liệu | Đúng repository giảng viên cung cấp |
| Ngôn ngữ giao diện | Tiếng Việt | Code nền dùng tiếng Việt |
| Nền sáng/tối | Sáng | Quy ước dự án |
| Loại artifact | Repo + link Figma | Đúng brief Lab 2 |
| Dùng code nền hay tự viết | Dùng code nền | Brief cho sẵn |
