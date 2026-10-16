# AI DESIGN LOG — PROJECT REVIEW AI

**Mục đích:** chứng minh quá trình **Prompt → Output → Critique → Decision → Figma Change** cho PRM323 Lab 2.

> **TRUNG THỰC BẰNG CHỨNG:** Các bảng bên dưới là template và *ứng viên vấn đề* được ghi nhận từ audit code cũ; không phải lịch sử prompt thực tế. Chỉ đánh dấu "Đã thực hiện" khi có transcript/log/ảnh trước-sau và URL thật. Không tạo ảnh minh chứng giả.

## 0. Danh sách AI tools và vai trò
| Công cụ | Vai trò thực tế | Bằng chứng |
|---|---|---|
| Google Stitch | Generate UI lần đầu theo yêu cầu Lab | `[PROMPT + OUTPUT + DATE]` |
| Figma Design | Wireframe/Final UI, component, variables, prototype | `[FIGMA LINK]` |
| Figma Make | React UI prototype khi được sử dụng | `[MAKE LINK/ẢNH]` |
| Cline / Codex | Tiếp tục coding, audit, fix interactions | `[LOG/COMMIT]` |

## 1. AI Generation — Initial Prompt (nguyên văn)
- **Ngày:** `[DD/MM/YYYY]`
- **Tool/model:** `[STITCH...]`
- **Persona:** Supervisor `[TRÍCH PERSONA]`
- **Task:** `[NHIỆM VỤ]`
- **Platform:** Mobile 390px, test 360/412
- **Constraints:** 5 tabs, 48dp touch, 14sp body, AI không tự approve
- **Style:** `[PHONG CÁCH GỐC]`

```text
[DÁN NGUYÊN VĂN PROMPT BẠN ĐÃ GỬI GOOGLE STITCH — KHÔNG VIẾT LẠI TỪ TRÍ NHỚ]
```

**Ảnh output Stitch ban đầu:** `../evidence/stitch-initial/[TEN_ANH].png`  
**Điểm tốt/điểm yếu ban đầu:** `[GHI THEO ẢNH THẬT]`  
**Figma import/snapshot:** `[URL]`

## 2. Iteration 01 — Navigation & Information Architecture
- **Mục tiêu KHÁC BIỆT:** người dùng đến đúng màn hình và không có dead-end mobile.
- **Tình trạng đề xuất:** ứng viên cải tiến, chưa xác minh là AI iteration lịch sử.
- **Prompt nguyên văn:**
```text
[DÁN PROMPT LẦN 1]
```
- **Before:** `../evidence/iteration-01/before.png` — `[CHỤP MÀN HÌNH]`
- **AI output:** `../evidence/iteration-01/ai-output.png`
- **Critique có căn cứ:** mục điều hướng Semester→Course; trang Documents/Review History không có lối vào mobile trong audit cũ.
- **Decision:** `[ACCEPT/MODIFY/REJECT + LÝ DO PERSONA/HEURISTIC]`
- **After:** `../evidence/iteration-01/after.png`
- **Figma component/frame thay đổi:** `[LINK FRAME]`

## 3. Iteration 02 — Error Handling & Feedback
- **Mục tiêu KHÁC BIỆT:** trạng thái AI error dễ nhận biết và recoverable.
- **Prompt nguyên văn:**
```text
[DÁN PROMPT LẦN 2]
```
- **Before:** `../evidence/iteration-02/before.png`
- **AI output:** `../evidence/iteration-02/ai-output.png`
- **Critique:** Trong audit cũ, hàm mô phỏng AI error có nhưng chưa được gọi từ UI.
- **Decision:** `[QUYẾT ĐỊNH]`
- **After:** `../evidence/iteration-02/after.png`
- **Figma frame thay đổi:** `[LINK]`

## 4. Iteration 03 — Revision & Version Visibility
- **Mục tiêu KHÁC BIỆT:** Student nhìn thấy feedback và nộp v2 liền mạch, không overwrite v1.
- **Prompt nguyên văn:**
```text
[DÁN PROMPT LẦN 3]
```
- **Before:** `../evidence/iteration-03/before.png`
- **AI output:** `../evidence/iteration-03/ai-output.png`
- **Critique:** audit cũ thiếu Student resubmission; cần xác minh code sau khi thêm Student UI.
- **Decision:** `[QUYẾT ĐỊNH]`
- **After:** `../evidence/iteration-03/after.png`
- **Figma frame thay đổi:** `[LINK]`

## 5. AI Critique — tối thiểu 5 issues trên màn hình cụ thể
| # | Screen | Candidate UX finding từ audit cũ | Heuristic | Severity | Đã kiểm chứng bằng Before/After? |
|---|---|---|---|---|---|
| UX01 | Mobile Navigation | Documents/Review History chưa có lối vào trên mobile | Recognition rather than recall | High | `[ ]` |
| UX02 | Semester List | Không có drill-down đến Course của Semester | Match with real-world workflow | Medium | `[ ]` |
| UX03 | AI Review Section | UI không kích hoạt được AI Error→Retry | Help users recover from errors | High | `[ ]` |
| UX04 | Dashboard | Số liệu thống kê hardcode không khớp record | Visibility of system status | Medium | `[ ]` |
| UX05 | Student Documents | Không có thao tác upload v2 ở audit cũ | User control and freedom | High | `[ ]` |

**Nguồn vấn đề:** báo cáo audit Cline trước khi Student UI được triển khai hoàn chỉnh. Đây không phải 5 finding UX đã kiểm chứng qua người dùng hoặc ảnh AI iteration. Đối chiếu lại UI mới nhất, cập nhật bằng chứng.

## 6. Tổng kết vòng lặp và dữ liệu nộp
| Iteration | Prompt gốc | AI output | Before | After | Quyết định | Figma link |
|---|---|---|---|---|---|---|
| 01 | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| 02 | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| 03 | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |

**Quy tắc:** Không dùng ảnh Final UI hiện tại giả làm output Stitch ban đầu hoặc "before" lịch sử.
