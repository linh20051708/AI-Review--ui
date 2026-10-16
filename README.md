# PROJECT REVIEW AI — PRM323 Lab 2 Submission

**Sản phẩm:** Hệ thống quản lý Project và Review tài liệu sinh viên có hỗ trợ AI.  
**Phạm vi:** Mobile-first UI/UX prototype · Supervisor + Student · không yêu cầu Flutter code/backend thật.

## 1. Link nộp
- **GitHub repository:** `[DÁN LINK REPO]`
- **Figma Design (viewer access):** `[DÁN FIGMA LINK]`
- **Figma Prototype / Make (nếu có):** `[DÁN LINK]`
- **Google Stitch initial output:** `[DÁN LINK/ẢNH GỐC]`
- **Slide presentation (nếu được yêu cầu):** `[DÁN LINK]`

## 2. Product Scope
**Supervisor:** Semester/Course/Offering/Class/Group/Project/Lab; Review Queue; AI findings; feedback; approve/revise/reject; history.  
**Student:** Dashboard/My Project/Documents; upload/version; request review; feedback; notifications.

AI chỉ hỗ trợ phân tích tài liệu; không tự phê duyệt. Version đã nộp không bị ghi đè.

## 3. Three User Flows
- **F1:** Supervisor academic setup → select group → create/view project.
- **F2:** Review Queue → Workspace → AI Findings → Supervisor Decision.
- **F3:** Student v1 → Supervisor revision → Student v2 → Supervisor approval → History.

**Xem:** [`ux/user-flow.md`](ux/user-flow.md).

## 4. Figma — chính xác 6 pages theo thứ tự
1. `01 User Flow` — Sitemap + F1/F2/F3.
2. `02 Wireframe` — Low-fi mobile frames.
3. `03 Final UI` — ít nhất 8 màn hình độc lập.
4. `04 Design System` — tokens/variables/styles.
5. `05 Components` — đủ 9 nhóm component + states/Auto Layout.
6. `06 Prototype` — 3 flows, Back, overlay, loading→result, error/recovery.

## 5. Artifact index
| Artifact | File/Thư mục | Phục vụ slide |
|---|---|---|
| Persona & Problem | [`ux/persona.md`](ux/persona.md) | 02 |
| IA, 3 Flows, Flow-Screen Mapping | [`ux/user-flow.md`](ux/user-flow.md) | 03–04 |
| Design constraints & token guidance | [`DESIGN.md`](DESIGN.md) | 05, 09–10 |
| Stitch prompt, AI iterations, critique | [`docs/ai-design-log.md`](docs/ai-design-log.md) | 05–06 |
| Accept/Modify/Reject & accessibility | [`docs/design-decisions.md`](docs/design-decisions.md) | 07, 10 |
| Flutter screen specs + mappings | [`docs/flutter-handoff.md`](docs/flutter-handoff.md) | 12 |
| Ảnh minh chứng thật | `evidence/` | 05–11 |

## 6. Chạy source code React (nếu repo chứa app)
```bash
npm install
npm run dev
```
Mở URL do Vite hiển thị. Lệnh có thể thay đổi theo `package.json` mới nhất của repo; cần đối chiếu thực tế.

## 7. PRM323 Lab 2 Submission Checklist
- [ ] Figma và GitHub mở được trên cửa sổ ẩn danh.
- [ ] 8+ Final UI screens, 3 flow có alternate và error/recovery.
- [ ] AI log có prompt nguyên văn, 3 iterations khác mục tiêu, ảnh before/after, ≥5 UX critique.
- [ ] Design system gồm color/type/spacing/radius/elevation; 9 nhóm component.
- [ ] Contrast 4.5:1/3:1, target 48dp, body 14sp, 360/412 responsive có bằng chứng.
- [ ] Flutter handoff mỗi screen 6 mục + 2 mapping tables.
- [ ] Demo Back, modal overlay, loading→result, không dead-end.

## 8. Evidence & integrity
Các trường `[DÁN...]`, `[ĐIỀN...]`, `[XÁC MINH...]` là thông tin **chưa được cung cấp**, không phải minh chứng đã thực hiện. Không trình bày persona giả định như nghiên cứu đã được xác nhận; không dùng ảnh mock giả làm lịch sử Stitch/AI.

## 9. Nhóm thực hiện
| Thành viên | MSSV | Vai trò |
|---|---|---|
| `[TÊN]` | `[MSSV]` | `[PHÂN CÔNG]` |
