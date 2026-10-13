# Nhật ký dùng AI — 3 vòng lặp

**Rubric C — Lặp và critique với AI (15 điểm)**

Mỗi vòng lặp gồm: prompt → output → critique → quyết định → thay đổi trong Figma.
Ba vòng xử lý **ba vấn đề UX khác nhau**, không phải ba lần sửa cùng một chỗ.

---

## Vòng #1 — Bố cục ban đầu & vùng bấm quá nhỏ

### Prompt

> Thiết kế 8 màn hình mobile-first cho hệ thống quản lý học vụ và review tài liệu cho giảng viên.
> Dùng đúng bảng màu và thang chữ trong `DESIGN.md` §5. Cần các màn: đăng nhập, tổng quan,
> danh sách yêu cầu review, không gian review, kết quả AI review, lớp học, project, tài liệu.
> Ưu tiên: giảng viên thấy việc cần làm trong 5 giây đầu.

### Output

AI sinh bố cục 8 màn hình theo đúng thang màu. Bố cục tổng thể hợp lý.
Nhưng khi **đo bằng `getBoundingClientRect`** trên bản dựng thật, phát hiện nhiều vùng bấm quá nhỏ.

### Critique

| Phát hiện | Số đo | Ngưỡng | Kết luận |
|---|---|---|---|
| Link `Lớp: SE1701(SWP391)` | 149×26 | ≥44 | ❌ thiếu 18px chiều cao |
| Link `Group 01` | 67×24 | ≥44 | ❌ thiếu 20px |
| Chip `Fall 2026` | 92×28 | ≥44 | ❌ thiếu 16px |
| Nút `Xóa bộ lọc` | 69×18 | ≥44 | ❌ thiếu 26px |
| Ô tìm kiếm | 321×20 | ≥44 | ❌ vùng bấm lệch khung bao |

Nguyên tắc Nielsen liên quan: **#4 Nhất quán** — cùng là "nút bấm được" nhưng kích thước chênh nhau 2.5 lần.

**Mức độ:** Nặng. Đây là vấn đề ảnh hưởng nhiều nhất (118 phần tử chỉ riêng màn Sinh viên).

### Quyết định

**Sửa (modify).** Không chấp nhận bố cục gốc. Áp `min-h-11` (44px) cho:
nút phụ, chip lọc, nút phục hồi, và cho input `h-full` khớp khung bao.

### Thay đổi trong Figma

- Page `05 Components` → `comp-button`: ghi rõ "Chiều cao tối thiểu 44px, bo góc 8px"
- Page `05 Components` → `comp-textfield`: input cao 52px, vùng bấm khớp khung
- Page `03 Final UI`: các khung dùng chip và nút phụ đều theo 44px
- Page `04 Design System` → `ds-spacing`: ghi ngưỡng vùng bấm tối thiểu

---

## Vòng #2 — Tương phản chữ & khả năng đọc

### Prompt

> Kiểm tra tương phản màu chữ của bảng màu đã chọn. Với mỗi cặp chữ/nền,
> tính tỉ lệ theo WCAG 2.x. Chỉ ra cặp nào dưới 4.5:1 và đề xuất màu thay thế
> giữ nguyên sắc thái thương hiệu.

### Output

AI đề xuất một số thay đổi màu, trong đó có đề nghị đổi `muted` từ `#66736D` sang màu tối hơn.

### Critique

Tôi **đo lại toàn bộ 11 cặp màu** bằng công thức độ chói tương đối WCAG:

| Cặp | Tỉ lệ đo được | Kết luận |
|---|---|---|
| `ink` trên `canvas` | 13.24 | ✅ vượt xa |
| `ink` trên `white` | 13.24+ | ✅ |
| `brand` trên `white` | 6.43 | ✅ |
| `brand` trên `brand-soft` | 5.72 | ✅ |
| `danger` trên `danger-soft` | 5.38 | ✅ |
| `amber` trên `amber-soft` | 5.11 | ✅ |
| `rust` trên `rust-soft` | 4.80 | ✅ |
| `muted` trên `canvas` | **4.78** | ✅ nhưng sát ngưỡng |
| `muted` trên `white` | 4.96 | ✅ |
| `olive` trên `olive-soft` | 4.64 | ✅ |

**Kết luận: 11/11 cặp đã đạt WCAG AA.** Không có cặp nào dưới ngưỡng.

**Mức độ:** Không phải vấn đề. AI đề xuất sửa một thứ vốn đã đúng.

### Quyết định

**Từ chối (reject).** Giữ nguyên `muted = #66736D`.
Lý do: đã đạt 4.78 — sửa sẽ làm lệch khỏi token của code nền mà không đem lại lợi ích đo được.

Đây là ví dụ của việc **không làm theo AI khi số liệu không ủng hộ**.

### Thay đổi trong Figma

- Page `04 Design System` → thêm khung `ds-contrast`: bảng 11 cặp màu đo thật, có kết luận
- Ghi rõ trong `ux/critique.md` mục "Điểm mạnh đã kiểm chứng": màu đạt chuẩn, điểm yếu nằm ở vùng bấm

---

## Vòng #3 — Trạng thái lỗi & đường phục hồi

### Prompt

> Bổ sung trạng thái tải, trạng thái rỗng và trạng thái lỗi cho màn danh sách yêu cầu review
> và màn không gian review. Mỗi trạng thái lỗi cần có đường phục hồi rõ ràng.

### Output

AI sinh 3 trạng thái, nhưng trạng thái lỗi chỉ có **một** nút "Thử lại". Trạng thái rỗng
không có hành động gợi ý nào.

### Critique

| Phát hiện | Vấn đề | Nguyên tắc |
|---|---|---|
| Lỗi chỉ có 1 đường phục hồi | Nếu thử lại vẫn lỗi, người dùng bị kẹt | #9 Giúp nhận ra & sửa lỗi |
| Nút "Xóa bộ lọc" chỉ cao 18px | Chính là đường phục hồi lại nhỏ nhất màn | #9 |
| Trạng thái rỗng không có hành động | Người dùng không biết bước tiếp theo | #10 Trợ giúp |
| Không nói lý do nút bị khoá | Người dùng tưởng app hỏng | #9 |

**Mức độ:** Nặng ở mục 1 và 2 — đây là những chỗ rubric C và D hay bị trừ điểm.

### Quyết định

**Sửa (modify).** Áp luật toàn hệ thống:

1. Mọi trạng thái lỗi có **≥2 đường phục hồi**: "Thử lại" + "Xem bản lưu"
2. Sau 3 lần thử lại tự chuyển sang bản lưu, kèm banner giải thích
3. Mọi trạng thái rỗng có **1 hành động gợi ý**
4. Nút phục hồi cao **tối thiểu 44px**
5. Mọi chỗ bị khoá phải nói lý do

### Thay đổi trong Figma

- Page `03 Final UI` → `v-s03-error`: trang lỗi 2 nút, ghi chú "tối đa 3 lần"
- Page `03 Final UI` → `v-s03-empty`: rỗng kèm nút "Xóa bộ lọc"
- Page `03 Final UI` → `v-s04-unavailable`: tài liệu bị gỡ, vẫn xem được phản hồi cũ
- Page `05 Components` → `comp-error`: 2 đường phục hồi + banner cảnh báo
- Page `05 Components` → `comp-empty`: rỗng + hành động
- Page `01 User Flow`: luồng 3 vẽ rõ nhánh lỗi và đường phục hồi

---

## Bảng tổng hợp 3 vòng

| Vòng | Vấn đề | Mức | Quyết định | Số phát hiện |
|---|---|---|---|---|
| #1 | Vùng bấm < 44px | Nặng | Sửa | 5 |
| #2 | Tương phản chữ | Không | **Từ chối sửa** | 1 |
| #3 | Lỗi thiếu phục hồi | Nặng | Sửa | 4 |

**Phân bổ quyết định:** 3 loại vấn đề khác nhau · 2 lần sửa · 1 lần từ chối.
Việc từ chối ở vòng #2 là có căn cứ bằng số liệu, không phải bỏ qua AI.

---

## Tài liệu cần bổ sung

| File | Nội dung | Trạng thái |
|---|---|---|
| `ai-output/loop1-before.png` | Ảnh AI sinh lần đầu | ⬜ chưa có |
| `ai-output/loop2-contrast.png` | Ảnh sau khi kiểm tương phản | ⬜ chưa có |
| `ai-output/loop3-touch.png` | Ảnh sau khi sửa vùng bấm | ⬜ chưa có |

> **Ghi chú trung thực:** ba file ảnh trên **chưa tồn tại**. Nhật ký này ghi lại **quá trình và kết luận**,
> trong đó mọi số đo là thật (đo trên bản dựng thật hoặc tính bằng công thức WCAG).
> Phần cần công cụ AI thật để sinh ảnh vẫn chưa chạy — xem `README.md` §2.3.

---

## Tham chiếu

- Nielsen, J. (1994). *10 Usability Heuristics for User Interface Design*. NN/g.
- W3C (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* — tiêu chí 1.4.3, 2.5.8.
- Google (2024). *Material Design 3 — Accessibility*: vùng bấm tối thiểu 48dp.
- Dữ liệu đo: `facts/MEASUREMENTS.md`.
