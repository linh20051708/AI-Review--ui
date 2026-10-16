> **Bản hiện hành — đối chiếu source ngày 16/10/2026.** Nguồn nghiệp vụ và route: `src/` tại merge HEAD `8258f69` + local `46a509d`. Phần A là tài liệu hiện hành đã chuẩn hóa. Phần B là bản lưu GitHub lịch sử, chỉ dùng truy vết và hướng dẫn Lab 2; không xác nhận trạng thái sản phẩm, nghiên cứu hay kết quả kiểm thử hiện tại.

## Quy ước hiện hành

Route và tên component trong `src/app/router.tsx` là định danh màn hình chuẩn của implementation. Source không khai báo Screen ID dạng Sxx/STxx. Phần A giữ mã local làm **alias tài liệu** để bảo toàn mapping F1–F3, không khẳng định đó là ID chính thức từ code/Figma. Chỉ bảng mapping phần A được dùng cho tài liệu hiện hành.

Mã GitHub lịch sử trong phần B được ghi với tiền tố `GH-` (ví dụ S03 gốc → GH-S03); không dùng để định danh màn hình hiện hành. ST05 gốc gộp “Student Review Result / History” không tương ứng một route đơn: phần A dùng tên component/route riêng cho Document Detail và Versions, không tự tạo Screen ID mới.

F1–F3 mô tả prototype dùng store/demo hiện tại; không khẳng định backend hoặc AI phân tích file thật. Rule Set phải Active; nếu `aiRequiredBeforeSupervisor` thì AI Evaluation phải completed trước khi review/quyết định. Revision cần feedback tổng quan; Reject cần lý do (Khác cần ghi chú). Feedback được chọn thành official, audit lưu version và feedback IDs.

---

# Phần A — Tài liệu hiện hành

# Project Review AI — Information Architecture & 3 User Flows

**Môn:** PRM323 Lab 2 · **Tài liệu:** UX/User Flow · **Trạng thái:** Đã đối chiếu route và nghiệp vụ với source hiện tại; tương tác runtime, Figma và accessibility chưa được xác nhận.

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
Lưu ý: `Rule Sets` là chức năng cấu hình liên kết theo ngữ cảnh; `Documents` và `Review History Index` có thể xuất hiện như màn hình bổ sung, không phải bottom tabs. Audit 14/10 là thông tin lịch sử, không dùng để kết luận tình trạng hiện tại.

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

## 4. Screen Mapping — alias local, route từ source hiện tại
| ID | Màn hình | Vai trò | Route hiện tại |
|---|---|---|---|
| S01 | Login | Cả hai | `/login` |
| S02 | Dashboard | Supervisor | `/dashboard` |
| S03 | Semester List | Supervisor | `/semesters` |
| S04 | Course List | Supervisor | `/courses` |
| S05 | Course Offering Detail | Supervisor | `/course-offerings/:offeringId` |
| S06 | Class Detail | Supervisor | `/classes/:classId` |
| S07 | Group Detail | Supervisor | `/groups/:groupId` |
| S08 | Project List | Supervisor | `/projects` |
| S09 | Project Detail | Supervisor | `/projects/:projectId` |
| S10 | Review Queue | Supervisor | `/reviews` |
| S11 | Review Workspace | Supervisor | `/reviews/:reviewId` |
| S12 | AI Review Result | Supervisor | `/reviews/:reviewId/ai-result` |
| S13 | Version History | Supervisor | `/reviews/:reviewId/versions` |
| S14 | Review History | Supervisor | `/reviews/:reviewId/history` |
| S15 | Notifications | Supervisor | `/notifications` |
| ST01 | Student Dashboard | Student | `/student/dashboard` |
| ST02 | My Project | Student | `/student/projects/:projectId?` |
| ST03 | Student Documents | Student | `/student/documents` |
| ST04 | Student Upload | Student | `/student/documents/:documentId/upload` |
| — | StudentDocumentDetailPage (feedback/trạng thái) | Student | `/student/documents/:documentId` |
| — | StudentVersionsPage (lịch sử version) | Student | `/student/documents/:documentId/versions` |

Các màn hình bổ sung có trong router (chưa gán alias S/ST):

| Alias | Component | Vai trò | Route hiện tại |
|---|---|---|---|
| — | ClassListPage | Supervisor | `/classes` |
| — | ProjectDocumentsPage | Supervisor | `/projects/:projectId/documents` |
| — | ReviewHistoryIndexPage | Supervisor | `/review-history` |
| — | DocumentListPage | Supervisor | `/documents` |
| — | GroupListPage | Supervisor | `/groups` |
| — | RuleSetListPage | Supervisor | `/rule-sets` |
| — | StudentListPage | Supervisor | `/students` |
| — | ProfilePage | Supervisor | `/profile` |
| — | StudentNotificationsPage | Student | `/student/notifications` |
| — | StudentProfilePage | Student | `/student/profile` |

ST05 gốc được lưu ở đây để truy vết: “Student Review Result / History”, route chưa xác minh; alias này **không dùng trong mapping hiện hành**.

**Chỉ tính màn hình độc lập**; modal, bottom sheet, trạng thái loading không tính thêm vào tối thiểu 8 màn hình.

## 5. F1 — Academic Management & Project Creation
**Actor:** Supervisor. **Start:** Dashboard. **Goal/End:** Project Details hiển thị cấu trúc Lab kế thừa.

```text
START → Supervisor Login → Dashboard → Semester → Course
→ Course Offering → Lab Structure → Class → Students / Groups
→ Select Group → <Group already has a project?>
   YES → View Existing Project → END (alternate)
   NO  → Create Project → Enter Details → <Valid?>
          NO  → Nút lưu disabled / lỗi validation → Edit Details → Kiểm tra lại
          YES → Save Project → Cập nhật store → Toast → Đóng modal
                → Group Detail → Xem project → Project Detail → Inherited Lab → END
```
**Implementation:** `GroupDetailPage` mở `ProjectFormModal`; lưu hợp lệ cập nhật store rồi đóng modal, không tự chuyển tới Project Detail. Nhánh “Save Error → Retry Save” của bản local gốc là đề xuất thiết kế chưa có nhánh lỗi lưu riêng trong modal hiện tại; giữ ghi chú này để truy vết, không mô tả như chức năng đã triển khai.

**Happy:** tạo project hợp lệ. **Alternate:** nhóm đã có project, xem project hiện hữu. **Error/recovery:** thiếu thông tin/sai ràng buộc, chỉnh và thử lại. **Rule:** Group gắn Class, Course Offering, Semester; cấm project trùng; Class Override ưu tiên nếu có.

**Mapping:** S01→S02→S03→S04→S05→S06→S07→(Create Project modal)→S07→Xem project→S09. **Demo checkpoint:** lựa chọn group, hiển thị cảnh báo trùng và trạng thái lưu.

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
→ Review Feedback (Approve: tùy chọn; Revision: bắt buộc; Reject: lý do bắt buộc) → <Decision?>
   Approve | Request Revision | Reject
→ Confirmation Dialog → <Confirm?>
   NO → Return Workspace (alternate)
   YES → Save Decision → <Save succeeded?>
          NO → Save Error → Retry
          YES → Update Review Status → History → END
```
**Implementation:** AI Evaluation dùng `mockEvaluation`, có loading/completed/error và retry. Nhánh “Save Error → Retry” là cách xử lý thông báo lỗi trong dialog, chưa xác nhận lỗi backend/network; prototype lưu store cục bộ. Manual review chỉ khi Rule Set không bắt buộc AI completed.

**Happy:** AI completed + Supervisor Approved. **Alternate:** cancel dialog hoặc manual review đúng Rule Set. **Error/recovery:** AI error→Retry. **Rule:** AI không được phê duyệt tài liệu, yêu cầu chỉnh sửa phải có feedback, version đã nộp là immutable.

**Mapping:** S01→S10→S11→S12 (nếu mở)→S11→Decision dialog→S14. **Demo checkpoint:** loading/result, lỗi và retry, overlay, back.

## 7. F3 — Document Submission, Revision & Approval
**Actors:** Student & Supervisor. **Start:** Student Documents. **Goal/End:** Student xem Approved trên version mới và lịch sử không mất.

```text
START → Student Login → Student Dashboard → My Project → Documents
→ Select Lab Item → Upload v1 → <File valid?>
   NO → Upload Error → Select New File → Validate Again
   YES → Xác nhận nộp v1 → Tạo logical ReviewRequest + DocumentVersion v1 → Waiting
→ Supervisor Login → Review Queue → Review v1 → <Decision?>
   Approve → Notify Student → Approved v1 → Version History → END
   Reject → Not Accepted → Notify Student → History → END
   Request Revision → Feedback v1 → Notify Student
      → Student Login → View Feedback v1 → Edit Document
      → Upload v2 → File Validation → Xác nhận nộp lại
      → Thêm DocumentVersion v2, giữ cùng reviewId → Waiting
      → Supervisor Review v2 → <Decision?>
         Approve → Notify Student → Approved v2 → Version History → END
         Request Revision → New version v3+ (repeat, cùng reviewId)
         Reject → Not Accepted → Notify Student → History → END
```
**Happy:** v1 needs revision, v2 approved. **Alternate:** v1 approved immediately. **Error/recovery:** invalid file→select valid file→retry. **Rule:** Không overwrite file v1; `submitVersion` chỉ cho nộp lại khi `needsRevision`, thêm DocumentVersion mới và cập nhật cùng logical ReviewRequest (`reviewId` giữ nguyên). `submitFirstVersion` tạo request ban đầu và chặn request trùng cho tài liệu/project. Waiting/inReview, Approved và Not Accepted không cho nộp lại qua Upload. Feedback official, AI Evaluation và audit gắn version; notifications liên thông hai role.

**Mapping:** ST01→ST02→ST03→StudentDocumentDetailPage→ST04→S10→S11→StudentDocumentDetailPage→ST04→S10→S11→StudentDocumentDetailPage→StudentVersionsPage. **Demo checkpoint cần kiểm thử:** file/version v1 và feedback official còn trong lịch sử; v2 là DocumentVersion mới, cùng reviewId.

## 8. Ma trận đối chiếu Flow → Screens → Bằng chứng
| Flow | Start / End | Happy | Alternate | Error recovery | Figma evidence |
|---|---|---|---|---|---|
| F1 | S02 → S09 | Tạo project | View existing | Validation/retry | `[LINK/ẢNH F1]` |
| F2 | S10 → S14 | Approved | Cancel/manual | AI error/retry | `[LINK/ẢNH F2]` |
| F3 | ST01 → StudentVersionsPage | v2 approved | v1 approved | Invalid file/retry | `[LINK/ẢNH F3]` |

## 9. Checklist phải xác thực trước khi nộp
- [ ] Tên route và ID khớp Figma bản mới nhất.
- [ ] Cả 3 flow có liên kết click-through từ Start tới End, không dead-end.
- [ ] Error/recovery thật sự bấm được.
- [ ] Back, dialog overlay và loading→result hoạt động.
- [ ] Chụp 3 flow trên Draw.io, chèn vào Figma `01 User Flow`.

---

<details>
<summary>Phần B — Bản lưu GitHub 8258f69 (lịch sử, không phải đặc tả hiện hành)</summary>

> **Chỉ là bản lưu lịch sử.** Mọi khẳng định hoàn thành/PASS, số đo, route `app/`, persona và flow trong phần này thuộc tài liệu GitHub gốc, chưa được xác nhận lại cho bản hiện tại. Hướng dẫn Figma, UX/UI, Design System, AI Design Log, Handoff và Lab 2 được bảo toàn để tham khảo. Khi có khác biệt, dùng phần A và source `src/`.

# User Flow — Hệ thống quản lý học vụ & Review tài liệu

Tài liệu này bám **đúng 23 route** trong `app/src/app/router.tsx`. Không có màn hình nào được bịa.

---

## 1. Kiến trúc điều hướng

Ứng dụng dùng **bottom navigation 5 tab** (`app/src/components/layout/BottomNavigation.tsx`):

| Tab | Route | Gộp thêm |
|---|---|---|
| Tổng quan | `/dashboard` | — |
| Project | `/projects` | `/classes` `/groups` `/semesters` `/documents` `/rule-sets` `/courses` |
| Review | `/reviews` | `/review-history` |
| Thông báo | `/notifications` | — |
| Tài khoản | `/profile` | — |

Ở màn hình ≥1024px, app chuyển sang `SideNavigation` và nội dung mở rộng tới 1440px.

---

## 2. Danh sách màn hình (23 route)

| Mã | Màn hình | Route | Nhóm |
|---|---|---|---|
| GH-S01 | Đăng nhập | `/login` | auth |
| GH-S02 | Tổng quan | `/dashboard` | dashboard |
| GH-S03 | Yêu cầu review | `/reviews` | review |
| GH-S04 | Không gian review | `/reviews/:reviewId` | review |
| GH-S05 | Kết quả AI Review | `/reviews/:reviewId/ai-result` | review |
| GH-S06 | Lịch sử phiên bản | `/reviews/:reviewId/versions` | review |
| GH-S07 | Lịch sử review | `/reviews/:reviewId/history` | review |
| GH-S08 | Mục lịch sử review | `/review-history` | review |
| GH-S09 | Lớp học | `/classes` | học vụ |
| GH-S10 | Chi tiết lớp | `/classes/:classId` | học vụ |
| GH-S11 | Project | `/projects` | đồ án |
| GH-S12 | Chi tiết project | `/projects/:projectId` | đồ án |
| GH-S13 | Tài liệu của project | `/projects/:projectId/documents` | đồ án |
| GH-S14 | Tài liệu (toàn bộ) | `/documents` | đồ án |
| GH-S15 | Nhóm | `/groups` | học vụ |
| GH-S16 | Chi tiết nhóm | `/groups/:groupId` | học vụ |
| GH-S17 | Học kỳ | `/semesters` | học vụ |
| GH-S18 | Rule set | `/rule-sets` | cấu hình |
| GH-S19 | Môn học | `/courses` | học vụ |
| GH-S20 | Chi tiết môn trong kỳ | `/course-offerings/:offeringId` | học vụ |
| GH-S21 | Sinh viên | `/students` | học vụ |
| GH-S22 | Thông báo | `/notifications` | hệ thống |
| GH-S23 | Tài khoản | `/profile` | hệ thống |

**Số màn hình tối thiểu: 23** (không tính dialog/state variants).

---

## 3. Ba luồng người dùng

### Luồng 1 — Thuận (Happy path): duyệt một tài liệu

```
GH-S02 Tổng quan
  → thấy thẻ "Việc cần làm" → chọn "Tài liệu đang chờ review"
  → GH-S03 Yêu cầu review            (lọc sẵn: học kỳ hiện tại + Chờ review)
  → chọn một dòng → GH-S04 Không gian review
      · 3 track hiện trạng thái: Tài liệu / AI / Giảng viên
      · xem tệp đính kèm + phát hiện AI
  → mở GH-S05 Kết quả AI Review      (2 lỗi · 2 cảnh báo · 1 gợi ý)
  → quay lại GH-S04 → bấm "Phê duyệt"
  → [Hộp thoại xác nhận] "Phê duyệt tài liệu?"
  → Đã phê duyệt → mở khoá mục phụ thuộc
  → GH-S22 Thông báo: nhóm nhận thông báo
```

**Thời gian mục tiêu:** ≤ 90 giây cho một tài liệu.

### Luồng 2 — Thay thế: so sánh phiên bản trước khi quyết định

```
GH-S04 Không gian review (v2.1)
  → GH-S06 Lịch sử phiên bản
  → chọn phiên bản cũ v1.3
  → đối chiếu phát hiện AI giữa 2 phiên bản
  → GH-S07 Lịch sử review (audit trail: ai làm gì, lúc nào)
  → quay lại GH-S06 → GH-S04
  → ra quyết định có căn cứ
```

Dùng khi: nhóm nộp lại nhiều lần, giảng viên cần biết **đã sửa được gì** so với lần trước.

### Luồng 3 — Lỗi & phục hồi (bắt buộc có)

```
GH-S03 Yêu cầu review
  → đổi bộ lọc → skeleton hiện 350ms (`ReviewListSkeleton`)
  → nhánh A (thành công) → hiện danh sách → tiếp Luồng 1
  → nhánh B (lỗi mạng):
        → trang lỗi: "Không tải được danh sách"
        → nút "Thử lại"        (tối đa 3 lần)
        → nút "Xem bản lưu"    (dữ liệu đã tải trước đó vẫn xem được)
        → nếu vẫn lỗi sau 3 lần → tự chuyển sang bản lưu, có banner giải thích
```

Ngoài ra hệ thống còn 2 trạng thái phục hồi khác:

| Tình huống | Xử lý | Nguồn |
|---|---|---|
| Tài liệu bị gỡ / hết hạn lưu | Trang "Tài liệu không khả dụng" + nút Tải lại; vẫn xem được phản hồi cũ | `v-s04-unavailable` |
| Mục phụ thuộc chưa duyệt | Nút gửi review bị khoá, kèm lý do | `submissionLocked` |

---

## 4. Ma trận nút Back

Mọi màn hình đều có đường quay lại — **không có ngõ cụt**.

| Từ màn hình | Nút Back đưa về | Ghi chú |
|---|---|---|
| GH-S01 Đăng nhập | — | không có back |
| GH-S02 Tổng quan | — | tab gốc |
| GH-S03 Yêu cầu review | GH-S02 | tab gốc của nhóm Review |
| GH-S04 Không gian review | GH-S03 | giữ nguyên bộ lọc đã chọn |
| GH-S05 Kết quả AI | GH-S04 | có nút phụ "Quay lại không gian review" |
| GH-S06 Lịch sử phiên bản | GH-S04 | |
| GH-S07 Lịch sử review | GH-S04 | |
| GH-S08 Mục lịch sử | GH-S03 | |
| GH-S09 Lớp học | GH-S02 | tab Project |
| GH-S10 Chi tiết lớp | GH-S09 | |
| GH-S11 Project | GH-S02 | tab Project |
| GH-S12 Chi tiết project | GH-S11 | |
| GH-S13 Tài liệu project | GH-S12 | |
| GH-S14 Tài liệu (toàn bộ) | GH-S02 | |
| GH-S15 Nhóm | GH-S09 | |
| GH-S16 Chi tiết nhóm | GH-S15 | |
| GH-S17 Học kỳ | GH-S09 | |
| GH-S18 Rule set | GH-S09 | |
| GH-S19 Môn học | GH-S09 | |
| GH-S20 Chi tiết môn | GH-S19 | |
| GH-S21 Sinh viên | GH-S09 | |
| GH-S22 Thông báo | — | tab gốc |
| GH-S23 Tài khoản | — | tab gốc |

Nút Back của thiết bị/trình duyệt quay về màn trước trong lịch sử, **không thoát app**.
Ở màn tab gốc, bấm Back thoát app (hành vi chuẩn Android).

Route không khớp (`*`) tự chuyển về `/dashboard`.

---

## 5. Biến thể trạng thái (KHÔNG tính là màn hình riêng)

| Màn hình | Biến thể | Kích hoạt |
|---|---|---|
| GH-S02 Tổng quan | Mất mạng | Không có kết nối, hiện banner + nút Thử lại |
| GH-S03 Yêu cầu review | Đang tải | Skeleton 350ms sau khi đổi bộ lọc |
| GH-S03 Yêu cầu review | Rỗng | Bộ lọc không khớp gì → `EmptyState` + "Xóa bộ lọc" |
| GH-S03 Yêu cầu review | Lỗi mạng | Tải thất bại → 2 nút phục hồi |
| GH-S04 Không gian review | Không khả dụng | Tệp bị gỡ |
| GH-S04 Không gian review | Hộp thoại quyết định | Bấm Phê duyệt / Cần chỉnh sửa |
| GH-S05 Kết quả AI | Đang phân tích | AI chạy, hiện tiến độ 15/24 trang |
| GH-S11 Project | Cần chú ý | Nhóm có lỗi AI chưa xử lý |

---

## 6. Trạng thái rỗng & lỗi

Luật áp cho toàn hệ thống:

1. **Trạng thái rỗng luôn có một hành động gợi ý** — ví dụ "Xóa bộ lọc".
2. **Trạng thái lỗi luôn có ≥2 đường phục hồi** — Thử lại và Xem bản lưu.
3. **Skeleton hiện ngay khi đổi bộ lọc**, không để màn hình trắng.
4. **Không bao giờ chặn người dùng mà không nói lý do** — nút bị khoá phải kèm giải thích.

---

## 7. Ghi chú khả năng tiếp cận

| Yêu cầu | Ngưỡng | Trạng thái |
|---|---|---|
| Vùng bấm | ≥ 44×44 px | ⚠️ app nền chưa đạt ở link phụ và chip (đo thật: 17–40px) |
| Tương phản chữ | ≥ 4.5:1 | ✅ đạt — thấp nhất 4.78 (`muted` trên `canvas`) |
| Cỡ chữ thân | ≥ 13 px | ✅ đạt |
| Bề rộng hỗ trợ | 360dp & 412dp | ✅ không tràn ngang ở cả hai |
| Nhãn điều hướng | min-height 48px, có `aria-label` | ✅ đạt |

Số đo cụ thể: `facts/MEASUREMENTS.md`.

</details>
