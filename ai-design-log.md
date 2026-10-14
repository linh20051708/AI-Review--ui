# Nhật ký dùng AI — 3 vòng lặp

**Rubric C — Lặp và critique với AI (15 điểm)**

Mỗi vòng lặp gồm: prompt → output → critique → quyết định → thay đổi trong Figma.
Ba vòng xử lý **ba vấn đề UX khác nhau**, không phải ba lần sửa cùng một chỗ.

---

## Vòng #1 (I01) — Bố cục ban đầu & vùng bấm quá nhỏ

### Prompt

> Thiết kế 8 màn hình mobile-first cho hệ thống quản lý học vụ và review tài liệu cho giảng viên.
> Dùng đúng bảng màu và thang chữ trong `DESIGN.md` §5. Cần các màn: đăng nhập, tổng quan,
> danh sách yêu cầu review, không gian review, kết quả AI review, lớp học, project, tài liệu.
> Ưu tiên: giảng viên thấy việc cần làm trong 5 giây đầu.


## 0. Mã định danh (tầng 4)

| Mã | Vòng lặp AI | Chủ đề |
|---|---|---|
| `4-AI-01` | Vòng 1 | Bố cục ban đầu & vùng bấm quá nhỏ |
| `4-AI-02` | Vòng 2 | Tương phản chữ & khả năng đọc |
| `4-AI-03` | Vòng 3 | Yêu cầu >=48dp |

Mã cũ tương ứng: `I01`, `I02`, `I03`.

### Output

AI sinh bố cục 8 màn hình theo đúng thang màu. Bố cục tổng thể hợp lý.
Nhưng khi **đo bằng `getBoundingClientRect`** trên bản dựng thật, phát hiện nhiều vùng bấm quá nhỏ.

### Critique

| Phát hiện | Số đo | Ngưỡng | Kết luận |
|---|---|---|---|
| Link `Lớp: SE1701(SWP391)` | 149×26 | ≥48 | ❌ thiếu 22px chiều cao |
| Link `Group 01` | 67×24 | ≥48 | ❌ thiếu 24px |
| Chip `Fall 2026` | 92×28 | ≥48 | ❌ thiếu 20px |
| Nút `Xóa bộ lọc` | 69×18 | ≥48 | ❌ thiếu 30px |
| Ô tìm kiếm | 321×20 | ≥48 | ❌ vùng bấm lệch khung bao |

Nguyên tắc Nielsen liên quan: **#4 Nhất quán** — cùng là "nút bấm được" nhưng kích thước chênh nhau 2.5 lần.

**Mức độ:** Nặng. Đây là vấn đề ảnh hưởng nhiều nhất (118 phần tử chỉ riêng màn Sinh viên).

### Quyết định

**Sửa (modify).** Không chấp nhận bố cục gốc. Áp `min-h-12` (48dp, Chuẩn chung C4) cho:
nút phụ, chip lọc, nút phục hồi, và cho input `h-full` khớp khung bao.

### Thay đổi trong Figma

- Page `05 Components` → `comp-button`: ghi rõ "Chiều cao tối thiểu 48dp, bo góc 8px"
- Page `05 Components` → `comp-textfield`: input cao 52px, vùng bấm khớp khung
- Page `03 Final UI`: các khung dùng chip và nút phụ đều theo 48dp
- Page `04 Design System` → `ds-spacing`: ghi ngưỡng vùng bấm tối thiểu

---

## Vòng #2 (I02) — Tương phản chữ & khả năng đọc

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

## Vòng #3 (I03) — Trạng thái lỗi & đường phục hồi

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
4. Nút phục hồi cao **tối thiểu 48dp** (Chuẩn chung C4)
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
| I01 | Vùng bấm < 48dp | Nặng | Sửa | 5 |
| I02 | Tương phản chữ | Không | **Từ chối sửa** | 1 |
| I03 | Lỗi thiếu phục hồi | Nặng | Sửa | 4 |

**Phân bổ quyết định:** 3 loại vấn đề khác nhau · 2 lần sửa · 1 lần từ chối.
Việc từ chối ở vòng #2 là có căn cứ bằng số liệu, không phải bỏ qua AI.

---

## Ảnh kết quả AI (Google Stitch) — ĐÃ CÓ

Ảnh AI sinh thật bằng **Google Stitch**, xuất 2026-10-14. File gốc nằm ở `ai-output/stitch/`.

| File | Nội dung | Trạng thái |
|---|---|---|
| `ai-output/stitch/loop1-before-01-login.png` | Đăng nhập cổng giảng viên | ✅ có |
| `ai-output/stitch/loop1-before-02-dashboard.png` | Tổng quan (việc cần làm) | ✅ có |
| `ai-output/stitch/loop1-before-03-review-list.png` | Danh sách yêu cầu review | ✅ có |
| `ai-output/stitch/loop1-before-04-workspace.png` | Không gian review | ✅ có |
| `ai-output/stitch/loop1-before-05-ai-results.png` | Kết quả AI & rubric | ✅ có |
| `ai-output/stitch/html/*.html` | Mã HTML 5 màn hình (Stitch sinh) | ✅ có |
| `ai-output/stitch/STITCH-DESIGN-TOKENS.md` | Design token Stitch xuất kèm | ✅ có |

> **Bối cảnh sinh:** prompt gõ trong Google Stitch ngày 2026-10-14, dự án `Academic Review Mobile
> Workspace`. Stitch tự đặt tên "Mobi Review" và dựng 5 màn + một design system riêng.
>
> **Điểm cần phê bình (quan trọng cho mục C):** Stitch **tự chọn bảng màu và font khác** với
> `DESIGN.md` của dự án — dùng tím `#4F46E5` (primary), chữ *Newsreader* + *Hanken Grotesk*,
> trong khi dự án chốt xanh `#146B55` và Inter. Đây là **bằng chứng cho vòng critique**: kết quả
> AI đầu tiên **không tuân thủ design system**, phải yêu cầu lại. Không gộp ảnh này vào bộ nộp
> như "bản cuối".

### Vòng 2 — sau khi yêu cầu lại (ĐÃ chạy)

Prompt vòng 2 (tiếng Anh, gõ trong Stitch):

> `Mobi Review academic app teachers use brand green 146B55 primary Inter font text 4.5 to 1 Screens
> login dashboard`

Kết quả Stitch dựng dự án mới tên `Mobi Review Teacher Dashboard` với design system
**Academic Review System**:

| Token Stitch sinh vòng 2 | Giá trị | So với dự án |
|---|---|---|
| Primary | `#146B55` | ✅ **khớp** `--color-brand` |
| Secondary | `#6C9A8B` | xấp xỉ `--color-olive` |
| Tertiary | `#D97706` | ngoài bảng token (amber đậm hơn) |
| Neutral | `#F1F5F9` | ngoài bảng token |
| Headline / Body / Label | `Inter` | ✅ **khớp** `--font-sans` |

Ảnh bằng chứng (screenshot canvas Stitch, `.jpg` vì Stitch chặn tải PNG riêng lẻ ở chế độ này):

| File | Nội dung | Trạng thái |
|---|---|---|
| `ai-output/stitch/loop2-after-01-design-system-tokens.jpg` | Bảng token vòng 2 — `#146B55` + Inter | ✅ có |
| `ai-output/stitch/loop2-after-02-login-prototype.jpg` | Màn Đăng nhập vòng 2 trong prototype | ✅ có |
| `ai-output/stitch/loop2-after-03-canvas-overview.jpg` | Toàn cảnh canvas vòng 2 (design system + login + dashboard + prototype) | ✅ có |

> **Kết luận vòng 2:** yêu cầu lại bằng prompt nêu rõ mã màu + font **đã kéo được AI về đúng
> design system** — đây là bằng chứng "AI có sửa được khi chỉ đích danh token", phần lõi của mục C.
> Giới hạn: ảnh là **screenshot canvas 1430×876**, không phải ảnh từng màn xuất riêng, do dialog
> `Export` của Stitch nằm trong iframe lồng không điều khiển được bằng công cụ hiện có (xem
> `README_ANSWER.md`).

### Vòng 3 — sau khi yêu cầu ≥48dp (ĐÃ chạy)

Prompt vòng 3:

> `Mobi Review teacher app All tap targets at least 48 by 48 dp`

Stitch xác nhận đã hiểu: *"design the Mobi Review teacher mobile app with strict accessibility
compliance (minimum 48×48 dp touch targets across all interactive elements, comfortable thumb reach,
and high-contrast typography)"*, rồi sinh design system **Educator Touch System** với 4 màn
(Review Queue & Dashboard · Assessment & Rubric Scoring · Class Mastery & Insights · Quick Feedback
& Assignment Manager).

**Bằng chứng 48dp đọc được từ DOM thật** (accessible name Stitch tự ghi, không phải suy đoán):

| Phần tử | Context Stitch ghi |
|---|---|
| Nút chuyển sinh viên trước | `Prev Student Nav (Strict 48x48 min touch target)` |
| Nút chuyển sinh viên sau | `Next Student Nav (Strict 48x48 min touch target)` |

**Token vòng 3:** Primary `#2563EB`, Secondary `#0F172A`, Tertiary `#059669`, Neutral `#64748B`,
Headline/Body/Label = **Inter**.

| File | Nội dung | Trạng thái |
|---|---|---|
| `ai-output/stitch/loop3-after-01-canvas-48dp.jpg` | Canvas vòng 3 + panel mô tả 48dp | ✅ có |
| `ai-output/stitch/loop3-after-02-canvas-full.jpg` | Cùng canvas, khung đầy đủ | ✅ có |
| `ai-output/stitch/LOOP3-EVIDENCE.md` | Trích nguyên văn prompt, accessible name, token vòng 3 | ✅ có |

> **Nhận xét trung thực cho mục C:** vòng 3 **giữ đúng font Inter** (ràng buộc vòng 2 dính lại) và
> **tuân thủ đúng ràng buộc 48dp** vừa nêu, nhưng **Primary trôi về xanh dương `#2563EB`** thay vì
> `#146B55`. Đây là minh chứng cho luận điểm: AI giữ được ràng buộc *vừa nêu trong cùng prompt*
> nhưng **dễ quên ràng buộc của vòng trước** — đúng lý do vì sao design system phải do người chốt và
> ghi thành token cứng, không giao cho AI tự nhớ.

> **Ghi chú kỹ thuật ảnh:** cả ảnh vòng 2 và vòng 3 là **screenshot canvas 1430×876** (`.jpg`), không
> phải ảnh từng màn xuất riêng, do dialog `Export` của Stitch nằm trong iframe lồng không điều khiển
> được bằng công cụ hiện có. Bản sửa trong Figma là `03 Final UI` (`figma-svg/output/03-final/`).

---

## Tham chiếu

- Nielsen, J. (1994). *10 Usability Heuristics for User Interface Design*. NN/g.
- W3C (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* — tiêu chí 1.4.3, 2.5.8.
- Google (2024). *Material Design 3 — Accessibility*: vùng bấm tối thiểu 48dp.
- Dữ liệu đo: `facts/MEASUREMENTS.md`.