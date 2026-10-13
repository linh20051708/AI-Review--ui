# DESIGN.md — Prompt AI sinh UI & token thiết kế

**Rubric B — Tạo UI bằng AI (10 điểm)**

File này chứa **prompt nguyên văn** dùng để sinh giao diện, và bộ token mà giao diện phải tuân theo.

---

## 1. Bối cảnh trước khi prompt

Hệ thống đã có code nền của giảng viên (`app/`) với:
- React 19 + Vite + Tailwind CSS v4
- Bảng màu trong `app/src/index.css` khối `@theme`
- Màn hình mobile-first, bottom nav 5 tab, header 56px, safe-area 54px
- 23 route đã định nghĩa trong `app/src/app/router.tsx`

Prompt dưới đây yêu cầu AI **giữ đúng ngôn ngữ thiết kế đã có**, không tự phát minh bảng màu mới.
Đây là quyết định có lý do: nếu AI đổi màu, kết quả sẽ không ghép được vào code nền.

---

## 2. Prompt nguyên văn gửi AI

```
Thiết kế giao diện mobile-first cho "Hệ thống quản lý học vụ và review tài liệu cho giảng viên".

NGƯỜI DÙNG: Giảng viên đại học, dùng điện thoại khi di chuyển giữa các lớp.
Mục tiêu: xem hôm nay phải review gì, đọc tài liệu, ra quyết định phê duyệt hoặc yêu cầu chỉnh sửa.
Mỗi học kỳ phụ trách 4 lớp, ~30 nhóm, 20-35 yêu cầu review mỗi tuần.

BẢNG MÀU (bắt buộc dùng đúng, không thay):
- brand #146B55 (nút chính, tab đang chọn)
- brand-soft #EAF4ED, brand-tint #F2F7F3
- ink #24332D (chữ chính), muted #66736D (chữ phụ)
- line #E1E7E3 (viền), canvas #FAFBFA (nền), subtle #F7F9F7
- Trạng thái: olive #637344 (đã nộp), amber #756534 (chờ),
  rust #A65335 (cần sửa), danger #A34343 (không đạt)
- Nền trạng thái tương ứng: #F1F4E9, #F5F2E7, #FBF0EA, #FAEEEE

KIỂU CHỮ: Inter. Cỡ: 22 tiêu đề trang / 20 tiêu đề mục / 16 tiêu đề khối
/ 14 thân / 13 thân nhỏ / 12 nhãn / 11 siêu nhỏ. Thân tối thiểu 14sp (Chuẩn chung C4).

BO GÓC: chip 6, nút 8, thẻ 12, hộp thoại 16, viên thuốc 999.
KHOẢNG CÁCH: 4 / 8 / 12 / 16 / 24 / 32 / 48. Padding ngang 20px.
NỀN: SÁNG. Không làm chế độ tối.

KHUNG: rộng 412dp và 360dp. Header 56px, bottom nav 64px.
Vùng bấm tối thiểu 48x48dp (Chuẩn chung C4). Nút chính cao 48px.

CÁC MÀN HÌNH CẦN THIẾT KẾ (theo thứ tự):
1. Đăng nhập — form email/mật khẩu, logo trên cùng
2. Tổng quan — lời chào, 4 thẻ số liệu, khối việc cần làm,
   danh sách yêu cầu review gần đây
3. Yêu cầu review — ô tìm kiếm, chip lọc, ô sắp xếp, danh sách thẻ
4. Không gian review — thông tin tài liệu, 3 track trạng thái
   (Tài liệu / AI / Giảng viên), tệp đính kèm, phát hiện của AI,
   2 nút quyết định (Cần chỉnh sửa / Phê duyệt)
5. Kết quả AI Review — đếm lỗi/cảnh báo/gợi ý ở đầu, rồi liệt kê từng phát hiện
   kèm mức độ, nhóm lỗi và số trang
6. Lớp học — danh sách lớp kèm tình trạng sức khoẻ nhóm
7. Project — danh sách đồ án kèm thanh tiến độ và tình trạng
8. Tài liệu của project — tiến độ project, danh sách tài liệu kèm trạng thái

YÊU CẦU CHẤT LƯỢNG:
- Mọi danh sách dài phải có trạng thái đang tải (skeleton) và trạng thái rỗng kèm nút gợi ý
- Mọi trạng thái lỗi phải có ít nhất 2 đường phục hồi
- Mọi màn hình phải có nút quay lại, không có ngõ cụt
- Nhãn viết tiếng Việt, dùng đúng từ vựng: "Chờ review", "Đang review",
  "Cần chỉnh sửa", "Đã nộp lại", "Đã phê duyệt", "Không đạt"
- Chữ trên nền phải đạt tương phản 4.5:1

KHÔNG làm: không gradient trang trí, không bóng đổ nặng, không icon nhiều màu,
không hiệu ứng động phức tạp.
```

---

## 3. Vì sao prompt đặt ra các ràng buộc đó

| Ràng buộc | Lý do |
|---|---|
| Bảng màu cố định | Code nền đã có token; đổi màu thì không ghép được |
| Nền sáng | Quy ước dự án: mặc định sáng trừ khi có yêu cầu khác |
| Vùng bấm ≥ 48dp | Chuẩn chung C4 (WCAG 2.5.8 / Material 3); kết quả đo cho thấy code nền chưa đạt — prompt sửa luôn |
| Chữ thân ≥ 14sp | Chuẩn chung C4 (mobile); code nền có cỡ 13px cần nâng |
| Tiếng Việt, từ vựng cố định | Code nền có `statusMeta` với nhãn đã chốt |
| Bắt buộc có trạng thái rỗng/lỗi | Đây là mục rubric C và D hay bị bỏ sót |
| Cấm gradient/bóng nặng | Giữ phong cách phẳng, dễ chuyển sang Flutter |

---

## 4. Output của AI

**Trạng thái: ĐÃ chạy trên Google Stitch (2026-10-14).**

Prompt ở §2 đã dán vào Google Stitch, dự án `Academic Review Mobile Workspace`. Stitch sinh
5 màn hình + một design system riêng, xuất kèm mã HTML.

| Tên file | Nội dung |
|---|---|
| `ai-output/stitch/loop1-before-01-login.png` | Kết quả lần sinh đầu — Đăng nhập |
| `ai-output/stitch/loop1-before-02-dashboard.png` | Kết quả lần sinh đầu — Tổng quan |
| `ai-output/stitch/loop1-before-03-review-list.png` | Kết quả lần sinh đầu — Danh sách review |
| `ai-output/stitch/loop1-before-04-workspace.png` | Kết quả lần sinh đầu — Không gian review |
| `ai-output/stitch/loop1-before-05-ai-results.png` | Kết quả lần sinh đầu — Kết quả AI |
| `ai-output/stitch/html/` | Mã HTML 5 màn hình Stitch sinh |
| `ai-output/stitch/STITCH-DESIGN-TOKENS.md` | Token Stitch xuất kèm |
| `ai-output/stitch/loop2-after-01-design-system-tokens.jpg` | Vòng 2 sau yêu cầu lại: token đúng `#146B55` + Inter |
| `ai-output/stitch/loop2-after-02-login-prototype.jpg` | Vòng 2: màn Đăng nhập trong prototype |
| `ai-output/stitch/loop2-after-03-canvas-overview.jpg` | Vòng 2: toàn cảnh canvas |

> **Ghi chú trung thực:** ảnh `loop1-before-*` là **kết quả AI thật** (Google Stitch xuất PNG từng
> màn). Nhưng Stitch **tự chọn bảng màu tím `#4F46E5` và font Newsreader/Hanken Grotesk**, khác
> design system dự án (`#146B55`, Inter) — đây chính là **đối tượng của vòng critique**. Sau khi
> gõ lại prompt chỉ đích danh mã màu + font (vòng 2), Stitch dựng design system mới
> **Academic Review System** với Primary `#146B55` và Headline/Body/Label đều `Inter` — **khớp token
> dự án**; bằng chứng là 3 ảnh `loop2-after-*.jpg`. Bộ cuối cùng nộp cho Lab 2 là
> `figma-svg/output/03-final/`, **không** phải ảnh Stitch. Vòng 3 (≥48dp) đã khởi chạy nhưng chưa
> chụp được ảnh kết quả.

---

## 5. Token — bảng tham chiếu

### Màu

| Token | Mã | Dùng cho |
|---|---|---|
| `brand` | `#146B55` | Nút chính, tab đang chọn, nhấn mạnh |
| `brand-soft` | `#EAF4ED` | Nền chip đang chọn, nền nhãn thương hiệu |
| `brand-tint` | `#F2F7F3` | Nền thông báo chưa đọc |
| `ink` | `#24332D` | Chữ chính |
| `muted` | `#66736D` | Chữ phụ, nhãn, ghi chú |
| `line` | `#E1E7E3` | Viền, đường phân cách |
| `canvas` | `#FAFBFA` | Nền trang |
| `subtle` | `#F7F9F7` | Nền ô nhập, nền thẻ số liệu |
| `olive` / `#F1F4E9` | `#637344` | Trạng thái đã nộp / đúng tiến độ |
| `amber` / `#F5F2E7` | `#756534` | Trạng thái chờ / sắp đến hạn |
| `rust` / `#FBF0EA` | `#A65335` | Cần chỉnh sửa, lỗi AI |
| `danger` / `#FAEEEE` | `#A34343` | Không đạt, quá hạn |

### Thang chữ

| Vai trò | Cỡ / độ đậm | Dùng cho |
|---|---|---|
| Tiêu đề trang | 22px / 700 | Tên màn hình |
| Tiêu đề mục | 20px / 700 | Hồ sơ, Lớp học |
| Tiêu đề khối | 16px / 600 | Tên tài liệu, tên thẻ |
| Thân | 14px / 400 | Nội dung chính |
| Thân nhỏ | 13px / 500 | Mô tả, placeholder |
| Nhãn | 12px / 600 | Trạng thái, nhãn phụ |
| Siêu nhỏ | 11px / 500 | Ngữ cảnh, thời gian |

### Khoảng cách & bo góc

| Token | Giá trị |
|---|---|
| xs / s / m / l / xl / xxl / huge | 4 / 8 / 12 / 16 / 24 / 32 / 48 |
| Padding ngang màn hình | 20px |
| Bo góc | chip 6 · nút 8 · thẻ 12 · hộp thoại 16 · viên thuốc 999 |

---

## 6. Kiểm tra prompt có bao phủ đủ không

| Từ khoá bắt buộc trong prompt | Có |
|---|---|
| người dùng / persona | ✅ |
| mục tiêu | ✅ |
| màu sắc cụ thể | ✅ |
| kiểu chữ | ✅ |
| khoảng cách | ✅ |
| bo góc | ✅ |
| nền sáng | ✅ |
| kích thước màn hình | ✅ |
| vùng bấm | ✅ |
| danh sách màn hình | ✅ |
| trạng thái rỗng / lỗi | ✅ |
| danh sách điều KHÔNG làm | ✅ |
