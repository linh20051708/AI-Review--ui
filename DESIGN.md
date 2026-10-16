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
3. Document → Document Version, version đã nộp bất biến; resubmit tạo version mới.
4. Review request trỏ đúng tài liệu/version; AI Review: chưa chạy/đang chạy/hoàn thành/lỗi.
5. Supervisor Decision: Approved / Needs Revision / Rejected. AI không tự approve.

## 5. Mobile UI constraints
- Khung tham chiếu 390×844; phải thử chiều rộng 360 và 412.
- Body text ≥14sp; tap target ≥48×48dp; tương phản chữ thường ≥4.5:1, chữ lớn/điều khiển ≥3:1.
- Không chỉ dùng màu truyền trạng thái: kết hợp text/icon.
- Safe area header/footer; BottomNav không che vùng cuộn.
- Empty, loading, error, success, disabled là trạng thái bắt buộc có minh chứng.

## 6. Design Tokens — PHẢI LẤY SỐ THỰC TẾ TỪ FIGMA
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
