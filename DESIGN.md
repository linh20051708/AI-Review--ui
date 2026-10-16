> **Bản hiện hành — đối chiếu source ngày 16/10/2026.** Nguồn nghiệp vụ và route: `src/` tại merge HEAD `8258f69` + local `46a509d`. Phần A là tài liệu hiện hành đã chuẩn hóa. Phần B là bản lưu GitHub lịch sử, chỉ dùng truy vết và hướng dẫn Lab 2; không xác nhận trạng thái sản phẩm, nghiên cứu hay kết quả kiểm thử hiện tại.

## Đối chiếu source hiện tại

- `src/app/router.tsx` triển khai Supervisor và Student; source ở `src/`, không phải `app/src/`. Con số 23 route trong prompt GitHub chỉ mô tả phạm vi Supervisor cũ; router hiện có thêm 8 route màn hình Student (không tính index redirect và wildcard).
- Token màu và Inter trong phần GitHub khớp `src/index.css`; các kích thước và ngưỡng accessibility là hướng dẫn/đo lịch sử, không phải kết quả kiểm thử mới. Mục tiêu thiết kế hiện hành là 48dp/14sp theo phần A; 44px/13px của GitHub chỉ là hướng dẫn lịch sử, không phải chuẩn hiện hành song song. Chưa xác nhận UI đạt mục tiêu này.
- Rule Set, Persona Checklist P01–P10, AI Evaluation, Findings/Feedback: xem `src/lib/rubric.ts`, `src/types/index.ts`, `src/data/reviewStore.ts`. AI Evaluation lưu document version, rule version và rule snapshot, có loading/completed/error. Điểm/findings hiện là mô phỏng, chưa đọc file gốc và cần Supervisor xác minh.
- Approve / Request Revision / Reject tương ứng `approved` / `needsRevision` / `notAccepted`; AI không quyết định. Revision cần feedback tổng quan; Reject cần lý do (Khác cần ghi chú). Feedback được chọn trở thành official và audit lưu version/feedback IDs.
- Document Versions và Review History được bảo toàn khi nộp lại. `submitVersion` thêm version và cập nhật cùng logical review request; không tạo reviewId mới cho mỗi lần nộp lại.

## Bằng chứng còn thiếu

Prompt GitHub được lưu ở phần B như bản chuẩn bị/lịch sử. Phần A cần prompt thực sự đã chạy và bằng chứng; chưa khẳng định prompt GitHub đã được thực thi. Chưa xác minh Figma, Stitch và các tuyên bố nghiệm thu trong tài liệu lịch sử.

---

# Phần A — Tài liệu hiện hành

# PROJECT REVIEW AI — DESIGN SPECIFICATION

**PRM323 Lab 2** · Mobile-first · Version 1.0 · **Trạng thái:** tài liệu định hướng thiết kế; giá trị thực tế phải đối chiếu Figma/CSS.

## 1. Product Vision
Hệ thống quản lý Project và tài liệu giữa Supervisor–Student, gồm học vụ, cấu trúc Lab cấu hình linh hoạt, AI findings, giảng viên review, sửa version và phê duyệt. AI **chỉ hỗ trợ**, quyết định chính thức do Supervisor.

## 2. Users & tasks
- **Primary Supervisor:** theo dõi review queue, đọc tài liệu và AI findings, phản hồi, quyết định; quản lý cấu hình học vụ.
- **Secondary Student:** xem project/Lab, nộp tài liệu, nhận phản hồi, nộp version mới.
- Chi tiết hành vi và mức độ bằng chứng: [`ux/persona.md`](ux/persona.md).

## 3. Core Navigation & IA
Supervisor bottom navigation 5 mục: Dashboard, Projects, Reviews, Notifications, Profile. Academic Management là Quick Access trên Dashboard, gồm Semester/Course/Class/Student/Group. Student 5 mục: Dashboard, My Project, Documents, Notifications, Profile. Xem [`ux/user-flow.md`](ux/user-flow.md).

## 4. Nghiệp vụ cần giữ nguyên
1. Semester → Course → Course Offering → Class → Group → Project; Lab được kế thừa từ Offering/Class override.
2. Group tối đa một Project trong phạm vi nghiệp vụ đã thiết kế.
3. Document → Document Version: nộp lại thêm version mới, giữ file/version trước và cùng logical `reviewId`; trạng thái review được cập nhật và lịch sử gắn version.
4. Review request trỏ đúng tài liệu/version; AI Review: chưa chạy/đang chạy/hoàn thành/lỗi.
5. Supervisor Decision: Approved / Needs Revision / Rejected. AI không tự approve.

## 5. Mobile UI constraints
- Khung tham chiếu 390×844; phải thử chiều rộng 360 và 412.
- Body text ≥14sp; tap target ≥48×48dp; tương phản chữ thường ≥4.5:1, chữ lớn/điều khiển ≥3:1.
- Không chỉ dùng màu truyền trạng thái: kết hợp text/icon.
- Safe area header/footer; BottomNav không che vùng cuộn.
- Empty, loading, error, success, disabled là trạng thái bắt buộc có minh chứng.

## 6. Design Tokens — phân biệt CSS hiện tại và Figma chưa xác minh
| Token | Ý nghĩa | Giá trị thực tế | Flutter mapping |
|---|---|---|---|
| `color.primary` | CTA chủ đạo | `[ĐIỀN HEX]` | `ColorScheme.primary` |
| `color.surface` | nền/card | `[ĐIỀN HEX]` | `ColorScheme.surface` |
| `color.text` | chữ | `[ĐIỀN HEX]` | `ColorScheme.onSurface` |
| `color.error` | trạng thái lỗi | `[ĐIỀN HEX]` | `ColorScheme.error` |
| `type.body` | văn bản chính | `[FONT/SIZE/WEIGHT]` | `TextTheme.bodyMedium` |
| `space.md` | khoảng cách chuẩn | `[ĐIỀN DP]` | `EdgeInsets` |
| `radius.md` | góc bo chuẩn | `[ĐIỀN DP]` | `BorderRadius.circular` |
| `elevation.card` | đổ bóng | `[ĐIỀN]` | `Material.elevation`/`BoxShadow` |

Giá trị CSS đã đối chiếu: `brand #146B55`, `canvas #FAFBFA`, `ink #24332D`, `danger #A34343`, font Inter (`src/index.css`). Bảng màu đầy đủ được bảo toàn ở phần B và khớp CSS. Các ô trên là giá trị Figma/Flutter cần xác minh, không phải CSS chưa có token.

## 7. Components
Button, Text field, Card, Navigation, App bar, Dialog, Loading, Empty, Error. Mỗi thành phần có: chức năng, states/variants, dimensions, Auto Layout, instances. **Figma Variables & Components phải được tạo thật**, HTML/CSS hoặc screenshot không thay thế.

## 8. AI-generated UI: lịch sử cần điền từ bằng chứng
**Công cụ theo yêu cầu môn:** Google Stitch → Figma. Dự án cũng sử dụng Figma Make/Cline/Codex khi triển khai UI; không được gộp nhầm vai trò các công cụ.

**Prompt Stitch nguyên văn:** `[DÁN PROMPT THẬT — gồm persona, task, mobile platform, constraints, style]`
**Ngày chạy / hình Stitch ban đầu:** `[NGÀY]` / `[LINK ẢNH]`
**Version thiết kế đầu tiên:** `[LINK FIGMA]`

Tham chiếu đầy đủ: [`docs/ai-design-log.md`](docs/ai-design-log.md).

## 9. Deliverables và Acceptance Criteria
- Figma đúng thứ tự pages: `01 User Flow`, `02 Wireframe`, `03 Final UI`, `04 Design System`, `05 Components`, `06 Prototype`.
- Final UI ≥8 màn hình khác nhau; có ≥3 flow, alternate và ≥1 recoverable error.
- Có 3 vòng AI iterations với 3 mục tiêu **khác nhau**, screenshot trước/sau và ≥5 UX issues.
- Contrast/responsive có bằng chứng, không chỉ tuyên bố.
- Flutter handoff mô tả 6 mục/màn hình và 2 bảng mapping.

## 10. Links
- Figma: `[URL]`
- GitHub: `[URL]`
- Stitch output: `[URL nếu có]`
- Audit/test evidence: `[PATH]`

---

<details>
<summary>Phần B — Bản lưu GitHub 8258f69 (lịch sử, không phải đặc tả hiện hành)</summary>

> **Chỉ là bản lưu lịch sử.** Mọi khẳng định hoàn thành/PASS, số đo, route `app/`, persona và flow trong phần này thuộc tài liệu GitHub gốc, chưa được xác nhận lại cho bản hiện tại. Hướng dẫn Figma, UX/UI, Design System, AI Design Log, Handoff và Lab 2 được bảo toàn để tham khảo. Khi có khác biệt, dùng phần A và source `src/`.

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
/ 14 thân / 13 thân nhỏ / 12 nhãn / 11 siêu nhỏ. Thân tối thiểu 13px.

BO GÓC: chip 6, nút 8, thẻ 12, hộp thoại 16, viên thuốc 999.
KHOẢNG CÁCH: 4 / 8 / 12 / 16 / 24 / 32 / 48. Padding ngang 20px.
NỀN: SÁNG. Không làm chế độ tối.

KHUNG: rộng 412dp và 360dp. Header 56px, bottom nav 64px.
Vùng bấm tối thiểu 44x44px. Nút chính cao 44-48px.

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
| Vùng bấm ≥ 44px | Kết quả đo cho thấy code nền chưa đạt — prompt sửa luôn |
| Tiếng Việt, từ vựng cố định | Code nền có `statusMeta` với nhãn đã chốt |
| Bắt buộc có trạng thái rỗng/lỗi | Đây là mục rubric C và D hay bị bỏ sót |
| Cấm gradient/bóng nặng | Giữ phong cách phẳng, dễ chuyển sang Flutter |

---

## 4. Output của AI

**Trạng thái: chưa chạy trên công cụ AI thật.**

Prompt ở §2 là bản sẵn sàng dán vào Google Stitch (hoặc công cụ tương tự).
Ảnh kết quả cần lưu vào `ai-output/` với tên:

| Tên file | Nội dung |
|---|---|
| `ai-output/loop1-before.png` | Kết quả lần sinh đầu (bản chưa sửa) |
| `ai-output/loop2-contrast.png` | Sau vòng sửa tương phản |
| `ai-output/loop3-touch.png` | Sau vòng sửa vùng bấm |

> **Ghi chú trung thực:** các file trong `ai-output/` hiện **chưa tồn tại**. Không có ảnh nào trong repo này
> là kết quả AI thật. Bộ khung trong `figma-svg/` do script sinh, không phải ảnh AI.

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

</details>
