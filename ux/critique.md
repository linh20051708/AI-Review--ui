# Critique UX — 8 phát hiện từ đo đạc thật

Mọi phát hiện dưới đây **đo được**, không phải ý kiến. Cách đo:

- Vùng bấm: `getBoundingClientRect()` trên mọi `button, a, [role=button], input, select`
- Tương phản: công thức độ chói tương đối WCAG 2.x
- Tràn layout: `documentElement.scrollWidth - clientWidth`
- Render: Chromium headless, viewport 360×800 và 412×892

Dữ liệu gốc: `facts/MEASUREMENTS.md`.

---

## Bảng tổng hợp

| # | Phát hiện | Mức | Nguyên tắc Nielsen | Trạng thái |
|---|---|---|---|---|
| 1 | Vùng bấm dưới 48dp ở màn Sinh viên | Nặng | #4 Nhất quán | Đã đề xuất sửa |
| 2 | Chip lọc cao 28–40px | Nặng | #7 Dùng linh hoạt | Đã đề xuất sửa |
| 3 | Ô tìm kiếm chỉ cao 20px | Nặng | #6 Nhận ra thay vì nhớ | Đã đề xuất sửa |
| 4 | Link "Xem tất cả" cao 17px | Vừa | #2 Khớp thế giới thực | Đã đề xuất sửa |
| 5 | Dashboard có khối cuộn ngang không báo | Vừa | #6 Nhận ra thay vì nhớ | Đã ghi nhận |
| 6 | Chip lọc trùng nhãn với ô sắp xếp | Nhẹ | #4 Nhất quán | Đã ghi nhận |
| 7 | Không có dấu hiệu "còn nội dung" ở cuối danh sách | Nhẹ | #1 Hiển thị trạng thái | Đã ghi nhận |
| 8 | Nút "Xóa bộ lọc" chỉ cao 18px | Nặng | #9 Giúp nhận ra & sửa lỗi | Đã đề xuất sửa |

---

## 1. Vùng bấm dưới 48dp ở màn Sinh viên — NẶNG

**Đo được:** 118 phần tử có vùng bấm < 44px trên `/students`. Theo ngưỡng chính thức
**48dp (Chuẩn chung C4)**, con số vi phạm còn cao hơn — số 118 là đo theo ngưỡng 44px cũ,
cần đo lại theo 48dp (xem `facts/MEASUREMENTS.md` §3).

Ví dụ nặng nhất:

| Phần tử | Kích thước | Ghi chú |
|---|---|---|
| Link `Lớp: SE1701(SWP391)` | **149×26** | `rounded-[6px] px-2.5 py-1 text-[12px]` |
| Link `Group 01` | **67×24** | `text-[12px]` + `py-1` |

**Vì sao là vấn đề:** WCAG 2.5.8 (Target Size) tối thiểu 24×24, Material 3 / Chuẩn chung C4
yêu cầu **48×48 dp**. Cao 24–26px là dưới cả ngưỡng tối thiểu. Người dùng persona chính
(38 tuổi, dùng điện thoại khi di chuyển) bấm sai thường xuyên.

**Đề xuất:** link hạng 2 trong danh sách tối thiểu `min-h-12` (48px), hoặc mở rộng vùng bấm bằng `py-3`.

## 2. Chip lọc cao 28–40px — NẶNG

**Đo được:** chip `Fall 2026` = 92×28, `Đang hoạt động` = 130×28, `Bộ lọc` = 86×40, `Chờ review` = 103×28.

**Vì sao là vấn đề:** chip là điều khiển chính để lọc — dùng liên tục. Cao 28px buộc người dùng
phải nhắm chính xác.

**Đề xuất:** chip tối thiểu 48px chiều cao; nếu cần gọn, dùng `min-h-12` với padding dọc lớn hơn.

## 3. Ô tìm kiếm chỉ cao 20px — NẶNG

**Đo được:** `<input>` tìm kiếm cao **20px** (ví dụ `321×20` ở `/documents`, `/projects`, `/reviews`, `/dashboard`).

Khung bao ngoài cao 40px nhưng **vùng bấm của chính input chỉ 20px** — phần còn lại là padding của wrapper.

**Vì sao là vấn đề:** người dùng bấm vào phần padding của khung thì focus không vào input.

**Đề xuất:** cho input `h-full` để vùng bấm khớp khung bao, tối thiểu 48px.

## 4. Link "Xem tất cả" cao 17px — VỪA

**Đo được:** `/dashboard` → `62×17`.

**Vì sao là vấn đề:** đây là lối vào danh sách đầy đủ, lại là vùng bấm nhỏ nhất màn hình.

**Đề xuất:** `min-h-12` + `px-2`.

## 5. Dashboard có khối cuộn ngang không báo — VỪA

**Đo được:** ở 360dp, 13 phần tử nằm ngoài khung (x=381→749) nhưng đều thuộc khối thẻ số liệu
cuộn ngang. `documentElement.scrollWidth == clientWidth` → trang không tràn, khối tự cuộn.

**Vì sao là vấn đề:** người dùng không biết còn thẻ nữa nếu bên phải không có tín hiệu (mép cắt / chấm chỉ báo).

**Đề xuất:** thêm chỉ báo cuộn hoặc cho thẻ cuối bị cắt lộ một phần ở mép phải.

## 6. Chip lọc trùng nhãn với ô sắp xếp — NHẸ

**Đo được:** chip `Fall 2026` và nút sắp xếp cùng xuất hiện trong `/reviews`, `/projects`.

**Vì sao là vấn đề:** hai vùng điều khiển khác chức năng nhưng cùng phong cách → dễ nhầm.

**Đề xuất:** cho ô sắp xếp thêm nhãn "Sắp xếp:" phía trước.

## 7. Không có dấu hiệu "còn nội dung" ở cuối danh sách — NHẸ

**Quan sát:** các danh sách dài không có chỉ báo tổng số hay "đã hết".

**Đề xuất:** hiện "5 yêu cầu" (đã có ở `/reviews`) và thêm dòng "Đã hiển thị tất cả" khi hết.

## 8. Nút "Xóa bộ lọc" chỉ cao 18px — NẶNG

**Đo được:** `69×18`, xuất hiện ở `/documents`, `/projects`, `/reviews`, `/dashboard`.

**Vì sao là vấn đề:** đây **chính là** nút phục hồi khi người dùng lọc ra kết quả rỗng (Nielsen #9).
Vùng bấm 18px khiến việc thoát khỏi ngõ cụt khó khăn.

**Đề xuất:** `min-h-12` — vì đây là đường phục hồi, cần to hơn mức thông thường.

---

## Điểm mạnh đã kiểm chứng (giữ nguyên)

| Điểm mạnh | Bằng chứng |
|---|---|
| Tương phản màu chữ **đạt WCAG AA toàn bộ** | 11/11 cặp ≥ 4.5:1, thấp nhất 4.78 |
| Không vỡ layout ở 360dp lẫn 412dp | `overflowX = 0` trên 9 route |
| Từ vựng trạng thái nhất quán | Một kiểu `Status` dùng chung, nhãn tiếng Việt |
| Ba track trạng thái tách bạch | `documentStatus` / `aiStatus` / `supervisorStatus` |
| Không có ngõ cụt | Mọi màn đều có Back, `*` → `/dashboard` |
| Lỗi luôn có phục hồi | 2 nút: Thử lại + Xem bản lưu |

---

## Ưu tiên sửa

| Ưu tiên | Việc | Vì sao |
|---|---|---|
| 1 | Nút "Xóa bộ lọc" lên 48dp | Là đường phục hồi, đang nhỏ nhất |
| 2 | Vùng bấm màn Sinh viên (≥118 chỗ) | Ảnh hưởng nhiều nhất |
| 3 | Ô tìm kiếm khớp khung | Sai lệch giữa nhìn và bấm |
| 4 | Chip lọc 48dp | Dùng liên tục |
| 5 | Chỉ báo cuộn ngang | Tránh bỏ sót nội dung |
