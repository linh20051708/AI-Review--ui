# Bằng chứng vòng 3 — yêu cầu touch target ≥48×48dp

Ngày chạy: 2026-10-14 (Google Stitch, trình duyệt Brave của Tường)

## Prompt gõ vào Stitch (nguyên văn)

> `Mobi Review teacher app All tap targets at least 48 by 48 dp`

## Stitch xác nhận hiểu yêu cầu (trích nguyên văn)

> "I'd love to help design the **Mobi Review** teacher mobile app with strict accessibility
> compliance (minimum 48×48 dp touch targets across all interactive elements, comfortable thumb
> reach, and high-contrast typography)."

Stitch đề xuất bộ 4 màn và tự sinh: Review Queue & Dashboard · Submission Assessment & Rubric
Scoring · Class Mastery & Insights · Quick Feedback & Assignment Manager.

## Bằng chứng 48dp nằm trong DOM thật (không phải suy đoán)

Đọc từ accessible name (context) của các phần tử tương tác trên màn *Assessment & Rubric Scoring*:

| Phần tử | Accessible name Stitch ghi | Ghi chú |
|---|---|---|
| Nút chuyển sinh viên trước | `Previous student: Marcus Chen` | ctx: **Prev Student Nav (Strict 48x48 min touch target)** |
| Nút chuyển sinh viên sau | `Next student: Jordan Hayes` | ctx: **Next Student Nav (Strict 48x48 min touch target)** |
| Nút điểm rubric | `1 Emerg` / `2 Devel` / `3 Profic` | chip điểm Emerging / Developing / Proficient |

## Bằng chứng trong panel mô tả của Stitch (trích nguyên văn)

> - Search & Filter Chips: **48dp tall** category selectors (All, Praise, Revisions, Lab Technique).
> - Reusable Snippet Cards: ... **48×48dp tap targets** for Insert to Grade, copying, and editing.
> - All four screens share the unified mobile shell with a persistent brand header and a
>   **thumb-accessible 48dp bottom navigation bar**.

## Design token vòng 3 (Stitch tự đặt tên "Educator Touch System")

Đọc trực tiếp trên bảng token trong canvas:

| Vai trò | Giá trị |
|---|---|
| Primary | `#2563EB` |
| Secondary | `#0F172A` |
| Tertiary | `#059669` |
| Neutral | `#64748B` |
| Headline / Body / Label | **Inter** |

> **Nhận xét trung thực cho mục C:** vòng 3 giữ đúng font Inter (yêu cầu vòng 2 dính), **tuân thủ
> đúng ràng buộc 48dp** (thấy rõ trong DOM và mô tả), nhưng **màu Primary lại trôi về xanh dương
> `#2563EB`** thay vì `#146B55`. Đây là minh chứng cho luận điểm: AI giữ được ràng buộc vừa nêu
> trong cùng prompt nhưng **dễ quên ràng buộc của vòng trước** — đúng lý do vì sao design system
> phải do người chốt và ghi thành token cứng, không giao cho AI tự nhớ.

## Tệp ảnh kèm

| File | Nội dung |
|---|---|
| `loop3-after-01-canvas-48dp.jpg` | Canvas vòng 3: design system "Educator Touch System" + 4 màn + panel mô tả 48dp |
| `loop3-after-02-canvas-full.jpg` | Cùng canvas, khung hình đầy đủ |
