# Project Review AI — Information Architecture & 3 User Flows

**Môn:** PRM323 Lab 2 · **Tài liệu:** UX/User Flow · **Trạng thái:** Đề xuất thiết kế, cần xác thực trên Figma Prototype và code mới nhất.

## 1. Phạm vi và ký hiệu
- **Primary persona:** Supervisor; **Secondary:** Student. Chi tiết: [persona.md](persona.md).
- Hình chữ nhật: màn hình/hành động; hình thoi: quyết định; mũi tên: điều hướng; nhánh lỗi quay lại điểm sửa.
- Sitemap mô tả *cấu trúc màn hình*, không phải trình tự nghiệp vụ.

## 2. Supervisor Sitemap
```text
Project Review AI
└─ Login
   └─ Supervisor App — 5 bottom tabs
      ├─ Dashboard
      │  └─ Quick Access (entry points)
      │     ├─ Semesters
      │     ├─ Courses → Course Offering → Lab Structure
      │     ├─ Classes → Class Detail → Students / Groups
      │     ├─ Students
      │     └─ Groups → Group Detail → Create Project
      ├─ Projects → Project List → Project Detail
      │  └─ Lab & Documents → Document Versions
      ├─ Reviews → Review Queue → Review Workspace
      │  ├─ AI Review Result
      │  ├─ Version History
      │  └─ Review History
      ├─ Notifications → Relevant Review
      └─ Profile
```
Lưu ý: `Rule Sets` là chức năng cấu hình liên kết theo ngữ cảnh; `Documents` và `Review History Index` có thể xuất hiện như màn hình bổ sung, không phải bottom tabs. Một số liên kết mobile chưa đầy đủ theo **audit cũ 14/10**; cần kiểm tra code sau khi Codex cập nhật.

## 3. Student Sitemap (phụ trợ cho Flow 3)
```text
Login → Student App
├─ Dashboard
├─ My Project → Project Detail / Lab Items
├─ Documents → Document Detail → Upload → Request Review
│                         ├─ Supervisor Feedback
│                         └─ Version History
├─ Notifications
└─ Profile
```

## 4. Screen Mapping — ID đề xuất cho Figma
| ID | Màn hình | Vai trò | Route tham khảo từ audit cũ |
|---|---|---|---|
| S01 | Login | Cả hai | `/login` |
| S02 | Dashboard | Supervisor | `/dashboard` |
| S03 | Semester List | Supervisor | `/semesters` |
| S04 | Course List | Supervisor | `/courses` |
| S05 | Course Offering Detail | Supervisor | `/course-offerings/:id` |
| S06 | Class Detail | Supervisor | `/classes/:id` |
| S07 | Group Detail | Supervisor | `/groups/:id` |
| S08 | Project List | Supervisor | `/projects` |
| S09 | Project Detail | Supervisor | `/projects/:id` |
| S10 | Review Queue | Supervisor | `/reviews` |
| S11 | Review Workspace | Supervisor | `/reviews/:id` |
| S12 | AI Review Result | Supervisor | `/reviews/:id/ai-result` |
| S13 | Version History | Supervisor | `/reviews/:id/versions` |
| S14 | Review History | Supervisor | `/reviews/:id/history` |
| S15 | Notifications | Supervisor | `/notifications` |
| ST01 | Student Dashboard | Student | `/student/dashboard` (theo ảnh người dùng) |
| ST02 | My Project | Student | *[XÁC MINH route]* |
| ST03 | Student Documents | Student | *[XÁC MINH route]* |
| ST04 | Student Upload | Student | *[XÁC MINH route]* |
| ST05 | Student Review Result / History | Student | *[XÁC MINH route]* |

**Chỉ tính màn hình độc lập**; modal, bottom sheet, trạng thái loading không tính thêm vào tối thiểu 8 màn hình.

## 5. F1 — Academic Management & Project Creation
**Actor:** Supervisor. **Start:** Dashboard. **Goal/End:** Project Details hiển thị cấu trúc Lab kế thừa.

```text
START → Supervisor Login → Dashboard → Semester → Course
→ Course Offering → Lab Structure → Class → Students / Groups
→ Select Group → <Group already has a project?>
   YES → View Existing Project → END (alternate)
   NO  → Create Project → Enter Details → <Valid?>
          NO  → Validation Error → Edit Details ───┐
          YES → Save Project ←──────────────────────┘
                → <Save successful?>
                    NO → Error → Retry Save
                    YES → Project Detail → Inherited Lab → END
```
**Happy:** tạo project hợp lệ. **Alternate:** nhóm đã có project, xem project hiện hữu. **Error/recovery:** thiếu thông tin/sai ràng buộc, chỉnh và thử lại. **Rule:** Group gắn Class, Course Offering, Semester; cấm project trùng; Class Override ưu tiên nếu có.

**Mapping:** S01→S02→S03→S04→S05→S06→S07→(Create Project modal)→S09. **Demo checkpoint:** lựa chọn group, hiển thị cảnh báo trùng và trạng thái lưu.

## 6. F2 — AI-Assisted Supervisor Review
**Actor:** Supervisor. **Start:** Review Queue. **Goal/End:** quyết định của Supervisor được ghi nhận, Student nhận biết.

```text
START → Login → Review Queue → Select Request → Review Workspace
→ View Document → <AI enabled?>
  NO → Manual Supervisor Review (chỉ nếu Rule Set cho phép)
  YES → AI Loading → <AI succeeded?>
      YES → View AI Findings → Supervisor Review
      NO  → AI Error → <Retry?>
             YES → AI Loading
             NO → Return/Manual Review (nếu được phép)
→ Enter Feedback → <Decision?>
   Approve | Request Revision | Reject
→ Confirmation Dialog → <Confirm?>
   NO → Return Workspace (alternate)
   YES → Save Decision → <Save succeeded?>
          NO → Save Error → Retry
          YES → Update Review Status → History → END
```
**Happy:** AI completed + Supervisor Approved. **Alternate:** cancel dialog hoặc manual review đúng Rule Set. **Error/recovery:** AI error→Retry. **Rule:** AI không được phê duyệt tài liệu, yêu cầu chỉnh sửa phải có feedback, version đã nộp là immutable.

**Mapping:** S01→S10→S11→S12 (nếu mở)→S11→Decision dialog→S14. **Demo checkpoint:** loading/result, lỗi và retry, overlay, back.

## 7. F3 — Document Submission, Revision & Approval
**Actors:** Student & Supervisor. **Start:** Student Documents. **Goal/End:** Student xem Approved trên version mới và lịch sử không mất.

```text
START → Student Login → Student Dashboard → My Project → Documents
→ Select Lab Item → Upload v1 → <File valid?>
   NO → Upload Error → Select New File → Validate Again
   YES → Request Review v1 → Waiting
→ Supervisor Login → Review Queue → Review v1 → <Decision?>
   Approve → Notify Student → Approved v1 → Version History → END
   Request Revision → Feedback v1 → Notify Student
      → Student Login → View Feedback v1 → Edit Document
      → Upload v2 → File Validation → Request Review v2
      → Supervisor Review v2 → <Approved?>
         YES → Notify Student → Approved v2 → Version History → END
         NO → Request Revision → New version v3+ (repeat)
```
**Happy:** v1 needs revision, v2 approved. **Alternate:** v1 approved immediately. **Error/recovery:** invalid file→select valid file→retry. **Rule:** Không overwrite v1, không tạo request trùng khi pending, thao tác phải liên thông dữ liệu hai role.

**Mapping:** ST01→ST02→ST03→ST04→S10→S11→ST05→ST04→S10→S11→ST05. **Demo checkpoint:** version v1 giữ nguyên, feedback v1 vẫn xem được, v2 là request riêng.

## 8. Ma trận đối chiếu Flow → Screens → Bằng chứng
| Flow | Start / End | Happy | Alternate | Error recovery | Figma evidence |
|---|---|---|---|---|---|
| F1 | S02 → S09 | Tạo project | View existing | Validation/retry | `[LINK/ẢNH F1]` |
| F2 | S10 → S14 | Approved | Cancel/manual | AI error/retry | `[LINK/ẢNH F2]` |
| F3 | ST01 → ST05 | v2 approved | v1 approved | Invalid file/retry | `[LINK/ẢNH F3]` |

## 9. Checklist phải xác thực trước khi nộp
- [ ] Tên route và ID khớp Figma bản mới nhất.
- [ ] Cả 3 flow có liên kết click-through từ Start tới End, không dead-end.
- [ ] Error/recovery thật sự bấm được.
- [ ] Back, dialog overlay và loading→result hoạt động.
- [ ] Chụp 3 flow trên Draw.io, chèn vào Figma `01 User Flow`.
