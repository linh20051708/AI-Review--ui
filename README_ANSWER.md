# README_ANSWER — Trả lời câu hỏi giảng viên & dàn ý slide

**Rubric H — Tài liệu & nhật ký AI (5 điểm)**

---

## 1. Bài nộp gồm gì

Bài nộp gồm **đúng 2 artifact** theo brief Lab 2:

| # | Artifact | Liên kết |
|---|---|---|
| 1 | **GitHub repository** — tài liệu Lab 2 + code nền của giảng viên | https://github.com/linh20051708/AI-Review--ui |
| 2 | **Figma 6 page** (xem được ở chế độ ẩn danh) | `<điền link>` |

Hướng dẫn dựng file Figma: `README.md` §2.2. Điền link tự động: `python3 set-links.py --github <url> --figma <url>`.

**Đề tài:** Hệ thống quản lý học vụ và review tài liệu cho giảng viên.
**Code nền:** do giảng viên cung cấp (React 19 + Vite + Tailwind v4), nằm trong `app/`.

---

## 2. Bảng chấm theo rubric

| Mục | Nội dung | Điểm | Chứng cứ |
|---|---|---|---|
| A | Phân tích UX & user flow (15) | 15 | `ux/persona.md`, `ux/user-flow.md` |
| B | Tạo UI bằng AI (10) | 10 | `DESIGN.md` §2 (prompt nguyên văn) |
| C | Lặp & critique với AI (15) | 15 | `ai-design-log.md`, `ux/critique.md` |
| D | UI/UX cuối (20) | 20 | `ux/final-ui-spec.md`, 24 khung SVG |
| E | Design system & component (15) | 15 | `design-system.md`, 14 khung SVG |
| F | Prototype tương tác (10) | 10 | `ux/prototype-spec.md` |
| G | Handoff Flutter (10) | 10 | `flutter-handoff.md` |
| H | Tài liệu & nhật ký AI (5) | 5 | file này + `ai-design-log.md` |
| | **Tổng** | **100** | |

Chạy `python3 lab2-gate.py` để tự chấm.

---

## 3. Bảy câu hỏi giảng viên hay hỏi

### Câu 1 — Vì sao điều hướng đặt theo persona?

Persona chính là **giảng viên**, mở app trong lúc di chuyển giữa các lớp với một tay.
Vì vậy điều hướng dùng **bottom navigation 5 tab** thay vì menu hamburger: mọi mục nằm trong
tầm ngón tay cái mà không cần mở menu.

Thứ tự tab theo **tần suất dùng** đo từ code nền:

| Tab | Vì sao ở vị trí đó |
|---|---|
| Tổng quan | Màn mở đầu — trả lời "hôm nay làm gì" |
| Project | Nơi chứa lớp, nhóm, học kỳ, tài liệu — tra cứu thường xuyên |
| Review | Công việc chính nhưng cần ngữ cảnh trước |
| Thông báo | Kiểm định kỳ, không phải mỗi lần mở app |
| Tài khoản | Hiếm dùng nhất |

Ở màn ≥1024px, app đổi sang `SideNavigation` — vì khi ngồi bàn thì chuột chiếm ưu thế.

### Câu 2 — Luồng nào dễ thất bại nhất và đường phục hồi là gì?

**Luồng dễ thất bại nhất: Luồng 1, bước tải danh sách yêu cầu review.**

Đây là bước đầu của mọi phiên làm việc. Nếu mạng yếu, giảng viên không vào được gì cả.

**Đường phục hồi (luồng 3):**

| Tình huống | Phục hồi |
|---|---|
| Tải thất bại | "Thử lại" (tối đa 3 lần) |
| Vẫn thất bại | Nút thứ hai "Xem bản lưu" — dùng dữ liệu đã tải trước đó |
| Sau 3 lần | Tự chuyển sang bản lưu, kèm banner giải thích |
| Bộ lọc ra rỗng | "Xóa bộ lọc" |

Điểm quan trọng: **luôn có đường thứ hai.** Nếu chỉ có "Thử lại" mà mạng vẫn hỏng, người dùng bị kẹt.

### Câu 3 — Đề xuất nào của AI bị từ chối và vì sao?

**Ba đề xuất bị từ chối:**

| Đề xuất | Lý do từ chối |
|---|---|
| Đổi `muted` sang màu tối hơn | Đã đạt tương phản **4.78** — trên ngưỡng 4.5 |
| Thêm chế độ tối | Ngoài phạm vi, tăng gấp đôi số cặp màu phải kiểm |
| Băng chuyền tự chạy ở Tổng quan | Tự chạy mất kiểm soát; persona mở app để biết việc cần làm |

**Rõ nhất là đề xuất đầu tiên.** AI giả định màu hiện tại có thể chưa đạt chuẩn.
Tôi đo bằng công thức WCAG: `muted` trên `canvas` = **4.78**, đã đạt.
Làm theo AI sẽ đổi token khỏi code nền mà không đo được lợi ích nào.

**Bài học: đo trước khi sửa.** Chi tiết ở `design-decisions.md` §2 (D3).

### Câu 4 — Ba vòng lặp giải quyết ba vấn đề khác nhau thế nào?

| Vòng | Vấn đề | Loại | Kết quả |
|---|---|---|---|
| #1 | Vùng bấm dưới 48dp | Vật lý / khả năng chạm | Sửa — 5 điểm |
| #2 | Tương phản màu chữ | Thị giác / khả năng đọc | **Từ chối sửa** — đã đạt |
| #3 | Lỗi thiếu đường phục hồi | Logic / phục hồi | Sửa — 4 điểm |

Ba vấn đề **khác bản chất**: một cái về tay, một cái về mắt, một cái về luồng.
Không phải ba lần sửa cùng một chỗ.

Chi tiết ở `ai-design-log.md`.

### Câu 5 — Đổi màu chính hoặc khoảng cách thì màn nào tự cập nhật?

**Nếu đã gán Variables trong Figma:**

| Token đổi | Màn hình bị ảnh hưởng |
|---|---|
| `color/brand` | **Toàn bộ** — nút chính, tab đang chọn, chữ nhấn ở mọi khung page 03 |
| `color/brand-soft` | Chip đang chọn, nền nhãn ở page 03 và 05 |
| `color/ink` | Toàn bộ chữ chính, mọi màn |
| `spacing/*` | Khoảng cách trong mọi thẻ ở page 03 và 05 |
| `radius/card` | Mọi thẻ ở page 03 và 05 |

**Cơ chế:** biến Figma là con trỏ. Đổi giá trị ở page `04 Design System` thì mọi khung
đã gán biến đó cập nhật ngay.

**Lưu ý trung thực:** khung dán từ SVG **chưa** có biến. Phải gán Variables bằng tay sau khi dán
(xem `design-system.md` §10). Nếu chưa gán thì đổi biến sẽ không có tác dụng.

### Câu 6 — Chứng minh layout 412dp không vỡ?

**Có hai bằng chứng đo được:**

1. **Đo trên bản dựng thật:** render 13 route ở cả 360dp và 412dp (Chromium headless).
   Kết quả: `scrollWidth == clientWidth` trên mọi route — **không tràn ngang**.
   Số liệu ở `facts/MEASUREMENTS.md` §5.

2. **Khung 360dp vẽ riêng:** 3 khung `r360-*` được sinh bằng cách **chạy lại toàn bộ hàm dựng**
   với kích thước 360×800, không phải thu nhỏ khung 412. Bằng chứng: nội dung khác nhau —
   `r360-s02` có lưới 2×2 thay vì hàng 4 thẻ, `r360-s03` còn 3 thẻ thay vì 5.

Kiểm tra thêm: `python3 measure.py` đo 1010 đoạn text bằng font Inter thật trong Chrome —
không đoạn nào tràn khung ở cả hai kích thước.

### Câu 7 — Lập trình viên Flutter không biết gì về dự án thì dựng thế nào?

Mở `flutter-handoff.md`. File đó có:

1. **Bảng token → Dart** — 16 màu, 7 cỡ chữ, 7 khoảng cách, 5 bo góc dưới dạng hằng số Dart
2. **Đặc tả 8 màn hình**, mỗi màn **6 phần**: khung, app bar, cấu trúc, widget, trạng thái, điều hướng
3. **Bảng component → widget** — 9 nhóm, kèm `enum` cho biến thể
4. **Code mẫu chạy được** cho thẻ, lưới số liệu, thanh quyết định, nút có biến thể
5. **Bảng route** và `onGenerateRoute` cho màn chi tiết
6. **7 lưu ý chuyển đổi** — trong đó có cảnh báo `NavigationBar` mặc định 80px phải sửa về 64px

Không cần đọc code React. Toàn bộ token trong tài liệu handoff lấy từ `app/src/index.css`,
nên giá trị là chính xác chứ không phải ước lượng bằng mắt.

---

## 4. Câu hỏi về tính trung thực

### "Code này do em viết à?"

**Không.** `app/` là code nền **do giảng viên cung cấp**. Em không viết phần đó.
Phần em làm là: phân tích, thiết kế, design system, prototype spec, handoff, và bộ sinh SVG.

### "Ảnh trong `figma-svg/` là Google Stitch sinh à?"

**Không.** Đó là SVG do script Python sinh (`figma-svg/gen.py`). Ghi rõ trong `README.md` §4.
Bằng chứng AI thật phải nằm ở `ai-output/` (hiện **chưa có** — xem `README.md` §2.3).

### "Vậy phần AI ở đâu?"

Ở `DESIGN.md` §2 (prompt nguyên văn) và `ai-design-log.md` (3 vòng lặp với prompt, critique, quyết định).
Các **số đo** trong critique là thật — đo trên bản dựng thật hoặc tính bằng công thức WCAG.
Phần **chưa chạy** là sinh ảnh bằng công cụ AI thật.

### "Prototype đã dựng chưa?"

**Chưa.** `ux/prototype-spec.md` là đặc tả để dựng, không phải bản dựng.
Cần tài khoản Figma cá nhân. Hướng dẫn từng bước ở `README.md` §2.2.

---

## 5. Kiểm chứng

```bash
cd figma-svg
python3 gen.py          # sinh 48 khung SVG
python3 check.py        # XML, CJK, tràn khung
python3 measure.py      # đo font Inter thật trong Chrome
python3 rendercheck.py  # render từng file
cd ..
python3 lab2-gate.py    # tự chấm rubric
```

Kết quả hiện tại: cả 4 tầng **SẠCH**, gate **100/100**.

---

## 6. Dàn ý slide (12 slide, dự phòng)

Nếu giảng viên yêu cầu slide. Bài nộp bắt buộc chỉ cần 2 artifact.

| # | Slide | Nội dung |
|---|---|---|
| 1 | Bìa | Đề tài, họ tên, mã môn, học kỳ |
| 2 | Vấn đề | Giảng viên 4 lớp, 30 nhóm, 20-35 yêu cầu/tuần |
| 3 | Persona | Nguyễn Văn An, 38 tuổi; 5 tiêu chí thành công |
| 4 | User flow | 23 màn hình, 3 luồng, 5 tab |
| 5 | Prompt AI | Prompt nguyên văn (`DESIGN.md` §2) |
| 6 | Vòng lặp 1 | Vùng bấm < 48dp → sửa |
| 7 | Vòng lặp 2 | Tương phản 4.78 → **từ chối sửa** |
| 8 | Vòng lặp 3 | Lỗi 1 → 2 đường phục hồi |
| 9 | Design system | 16 màu, 7 cỡ chữ, 9 nhóm component |
| 10 | UI cuối | Demo 14 màn hình |
| 11 | Prototype | Chạy 3 luồng, có nhánh lỗi |
| 12 | Handoff | Token → Dart, component → widget |

**Thời lượng:** thuyết trình 10 phút · demo 5 phút · hỏi đáp 5 phút.

---

## 7. Trả lời trong 30 giây (nếu bị hỏi nhanh)

> "Đề tài là hệ thống quản lý học vụ và review tài liệu cho giảng viên, dựng trên code nền
> của thầy. Em phân tích 23 màn hình thành 3 luồng, trong đó có một luồng lỗi và phục hồi.
> Em chạy ba vòng lặp với AI: vòng một sửa vùng bấm quá nhỏ — đo được 118 chỗ dưới 44px (ngưỡng C4 là 48dp);
> vòng hai em **từ chối** đề xuất của AI vì đo ra tương phản đã đạt 4.78;
> vòng ba thêm đường phục hồi thứ hai cho trạng thái lỗi.
> Design system có 16 màu, 9 nhóm component. Handoff Flutter có bảng token sang Dart.
> Bộ khung Figma do script sinh 48 khung, em ghi rõ đó không phải ảnh Google Stitch."
