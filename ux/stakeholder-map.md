# Stakeholder / User Map — Hệ thống quản lý học vụ & Review tài liệu

**Bước Lab 2:** Analyze · **Phase PRM393:** P0 (Idea & Problem) · **Gate:** G0
**Trạng thái bằng chứng:** ASSUMED — suy từ vai trò có trong code nền (`app/src/types/index.ts`).

---

## 1. Bản đồ các bên liên quan

| Mã | Bên liên quan | Loại | Tương tác với hệ thống | Quyền hạn | Bằng chứng trong code |
|---|---|---|---|---|---|
| SH-01 | **Giảng viên / Supervisor** | Người dùng trực tiếp | Duyệt tài liệu, để lại phản hồi, xem việc cần làm | Quyết định cuối (`supervisorStatus`) | `currentUser = "Nguyễn Văn An", "Giảng viên / Supervisor"` |
| SH-02 | **Sinh viên / Trưởng nhóm** | Người dùng trực tiếp | Nộp tài liệu, gửi yêu cầu review, xem phản hồi | Nộp bài trong nhóm mình | `students`, `studentGroups`, `joinRequests` |
| SH-03 | **Sinh viên thành viên** | Người dùng gián tiếp | Được ghi danh vào nhóm, không trực tiếp nộp | Không | `students` (danh sách thành viên nhóm) |
| SH-04 | **Quản trị học vụ / Giáo vụ** | Người dùng trực tiếp (vai khác) | Cấu hình học kỳ, môn, lớp, rule set, deadline | Cấu hình cấp cao | `semesters`, `courses`, `courseOfferings`, `classes`, `ruleSets` |
| SH-05 | **Hệ thống AI Review** | Hệ thống | Phân tích tài liệu, sinh phát hiện | Không quyết định — chỉ gợi ý | `aiStatus`, `aiFindings`, `AIFinding.level/category/pageRef` |
| SH-06 | **Bộ môn / Khoa** | Gián tiếp | Đặt quy chuẩn chấm/review | Quy định chính sách | `RuleSet` (SLA ngày, định dạng cho phép, số lần nộp lại) |

---

## 2. Ai là người dùng của Lab 2

Lab 2 là **bài cá nhân, phạm vi hẹp** → chọn **một vai thiết kế chính**:

| Vai | Có thiết kế sâu? | Lý do |
|---|---|---|
| SH-01 Supervisor (P01) | ✅ **Primary** | Người dùng mặc định trong code; quyết định layout + luồng chính |
| SH-02 Sinh viên trưởng nhóm (P02) | ⚠️ Secondary | Có nhu cầu khác biệt thật → giữ làm persona phụ, không thiết kế đủ 8 màn |
| SH-04 Giáo vụ | ❌ Không | Có route (`/semesters`, `/rule-sets`…) nhưng ngoài phạm vi Lab 2 |
| SH-05 AI | — | Là hệ thống, không phải người dùng |
| SH-03, SH-06 | ❌ Không | Gián tiếp, không thao tác UI |

---

## 3. Người dùng dễ bị bỏ sót (mục kiểm #2 của Persona rubric)

| Nhóm dễ bị bỏ sót | Vì sao dễ bỏ sót | Có xử lý không |
|---|---|---|
| **Sinh viên chỉ có điện thoại, mạng yếu** | Thiết kế hay giả định desktop + mạng ổn | ✅ Có — P02 dùng Android, có nhánh lỗi mạng ở Luồng 3 |
| **Giảng viên lớn tuổi, thao tác chậm** | Ngưỡng 48dp và chữ 14sp hay bị coi là "tốn chỗ" | ✅ Có — P01 (38 tuổi) + ngưỡng C4 áp toàn hệ thống |
| **Sinh viên năm nhất chưa quen quy trình nộp** | Hay bị gộp chung vào "sinh viên" | ⚠️ Một phần — có `EmptyState` gợi ý, nhưng **chưa có persona riêng** |
| **Giảng viên dùng máy tính bảng** | Phạm vi Lab 2 là mobile | ❌ Ngoài phạm vi, ghi nhận để sau |
| **Trợ giảng / người chấm phụ** | Code nền chưa có vai này | ❌ Không tồn tại trong code → không bịa |

**Kết luận:** nhóm bỏ sót đáng lo nhất là **sinh viên năm nhất** — cần kiểm chứng ở `ux/research-plan.md`.

---

## 4. Ma trận quyền hạn (ai làm được gì)

| Hành động | SH-01 Supervisor | SH-02 Trưởng nhóm | SH-04 Giáo vụ |
|---|---|---|---|
| Xem việc cần làm | ✅ | ✅ (bài của mình) | ✅ |
| Phê duyệt tài liệu | ✅ **duy nhất** | ❌ | ❌ |
| Yêu cầu chỉnh sửa | ✅ **duy nhất** | ❌ | ❌ |
| Nộp tài liệu | ❌ | ✅ | ❌ |
| Gửi yêu cầu review | ❌ | ✅ | ❌ |
| Cấu hình rule set / deadline | ❌ | ❌ | ✅ |

Nguồn: `app/src/data/reviewStore.ts` (chỉ `reviewActions` của supervisor đổi `supervisorStatus`);
`app/src/lib/config.ts` (deadline kế thừa từ Offering → Class → Project).
