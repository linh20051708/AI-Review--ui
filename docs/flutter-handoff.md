# FLUTTER HANDOFF — PROJECT REVIEW AI

**PRM323 Lab 2** · UI specification cho lập trình viên Flutter · **Không yêu cầu viết Flutter code trong Lab 2**.

> Đây là tài liệu thiết kế mục tiêu, không phải xác nhận ứng dụng Flutter đã được triển khai. Route, token value và màn hình phải đồng bộ với Figma mới nhất trước khi giao.

## 1. Quy ước kỹ thuật
- Mobile viewport references: 360 / 390 / 412dp; nội dung có scroll; safe area cho notch và BottomNav.
- Nguồn sự thật: Figma Frame + Variables + Components; không dùng CSS code như thay thế cho Figma tokens.
- Trạng thái cơ bản: initial/loading/success/empty/error/disabled; review statuses: waiting, reviewing, needsRevision, approved, rejected.
- Mock data có thể được thay bằng backend sau Lab 2; không xây dựng API chưa có spec.

## 2. Token → Flutter mapping
| Figma token | Figma value (điền thực tế) | Flutter |
|---|---|---|
| `color.primary` | `[HEX]` | `ColorScheme.primary` |
| `color.surface` | `[HEX]` | `ColorScheme.surface` |
| `color.onSurface` | `[HEX]` | `ColorScheme.onSurface` |
| `color.error` | `[HEX]` | `ColorScheme.error` |
| `type.heading` | `[font/size/weight]` | `TextTheme.titleLarge` |
| `type.body` | `[font/size/weight]` | `TextTheme.bodyMedium` |
| `space.sm` | `[DP]` | `EdgeInsets` / `SizedBox` |
| `space.md` | `[DP]` | `EdgeInsets` / `SizedBox` |
| `radius.card` | `[DP]` | `BorderRadius.circular(...)` |
| `elevation.card` | `[ELEVATION]` | `Material(elevation: ...)` hoặc `BoxShadow` |

## 3. Component → Flutter Widget mapping
| Figma component | Flutter widget | States / notes |
|---|---|---|
| App Bar | `AppBar` | Default/Back |
| Bottom Navigation | `NavigationBar` | Active/Inactive |
| Primary Button | `FilledButton` | Enabled/Disabled/Loading |
| Secondary Button | `OutlinedButton` | Enabled/Disabled |
| Text Field | `TextFormField` | Focus/Error/Disabled |
| Card | `Card` + `InkWell` | Tap/Default |
| Status Badge | `Chip` / custom decorated `Container` | Chữ + icon, không chỉ màu |
| Confirm Dialog | `AlertDialog` | Confirm/Cancel |
| Loading | `CircularProgressIndicator` / `Skeleton` | Loading |
| Empty State | `Column` + CTA | Empty |
| Error State | `Column` + Retry | Error |
| Filter Bottom Sheet | `showModalBottomSheet` | Apply/Clear/Cancel |

## 4. Screen specs — 6 mục bắt buộc cho mỗi màn hình
**Các đặc tả dưới đây là định hướng tương tác**, kiểm tra tên frame/routes với Figma trước bàn giao.

### S01 — Login (Cả hai)
1. **Layout:** Role selection / login form.
2. **Components:** FormCard, TextField, PrimaryButton.
3. **States:** Idle, validationError, loading.
4. **Interactions:** Chọn Supervisor/Student, xác nhận đăng nhập.
5. **Navigation:** Supervisor → Dashboard; Student → Student Dashboard.
6. **UI Constraints:** Không lộ chức năng khác role, input ≥48dp.
**Figma Frame:** `[ĐIỀN URL S01]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S02 — Supervisor Dashboard (Supervisor)
1. **Layout:** AppBar, quick access, work summary, review cards.
2. **Components:** AppBar, StatCard, ReviewCard, NavigationBar.
3. **States:** Loading, content, empty, error.
4. **Interactions:** Mở quick access và review item.
5. **Navigation:** Semester/Course/Class/Project/Review Queue.
6. **UI Constraints:** Cards ưu tiên công việc, nội dung cuộn không che nav.
**Figma Frame:** `[ĐIỀN URL S02]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S03 — Semester List (Supervisor)
1. **Layout:** AppBar, semester list, actions.
2. **Components:** ListCard, Filter, Dialog.
3. **States:** Empty, content, error.
4. **Interactions:** Chọn học kỳ, xem/cấu hình.
5. **Navigation:** Courses / Rule Sets theo ngữ cảnh.
6. **UI Constraints:** Học kỳ hiện chọn phải được giữ trong ngữ cảnh.
**Figma Frame:** `[ĐIỀN URL S03]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S04 — Course List (Supervisor)
1. **Layout:** Course cards, offering list.
2. **Components:** CourseCard, OfferingCard.
3. **States:** Empty, content, loading.
4. **Interactions:** Chọn Course Offering.
5. **Navigation:** Offering Detail.
6. **UI Constraints:** Không nhầm course gốc với offering trong kỳ.
**Figma Frame:** `[ĐIỀN URL S04]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S05 — Course Offering (Supervisor)
1. **Layout:** Header, Lab editor, class list.
2. **Components:** LabItemCard, Accordion, Button.
3. **States:** View/edit, empty, validationError.
4. **Interactions:** Xem Lab, mở lớp.
5. **Navigation:** Class Detail.
6. **UI Constraints:** Dependency phải hiển thị rõ; class override không ảnh hưởng lớp khác.
**Figma Frame:** `[ĐIỀN URL S05]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S06 — Class Detail (Supervisor)
1. **Layout:** Header, tab nội bộ, students/groups.
2. **Components:** Tabs, ListCard, Dialog.
3. **States:** Loading, content, empty.
4. **Interactions:** Chọn nhóm, xem sinh viên.
5. **Navigation:** Group Detail / Project Detail.
6. **UI Constraints:** Nhóm chỉ chứa sinh viên trong đúng lớp.
**Figma Frame:** `[ĐIỀN URL S06]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S07 — Group Detail (Supervisor)
1. **Layout:** Group summary, members, project CTA.
2. **Components:** GroupCard, MemberList, Dialog.
3. **States:** HasProject, noProject, validationError.
4. **Interactions:** Tạo hoặc xem project.
5. **Navigation:** Project Detail.
6. **UI Constraints:** Group có project không cho tạo trùng.
**Figma Frame:** `[ĐIỀN URL S07]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S08 — Project List (Supervisor)
1. **Layout:** Filters, project list.
2. **Components:** FilterSheet, ProjectCard.
3. **States:** Loading, empty, error, content.
4. **Interactions:** Lọc, mở project.
5. **Navigation:** Project Detail.
6. **UI Constraints:** Filter nâng cao không đẩy hết lên màn nhỏ.
**Figma Frame:** `[ĐIỀN URL S08]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S09 — Project Detail (Supervisor)
1. **Layout:** Overview, Lab Items, documents.
2. **Components:** AppBar, LabCard, DocumentCard.
3. **States:** Loading, empty, content.
4. **Interactions:** Mở tài liệu/version.
5. **Navigation:** Documents / Review.
6. **UI Constraints:** Version/status gắn đúng Lab Item.
**Figma Frame:** `[ĐIỀN URL S09]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S10 — Review Queue (Supervisor)
1. **Layout:** Queue filter, review cards.
2. **Components:** FilterSheet, ReviewCard, StatusBadge.
3. **States:** Loading, empty, error, content.
4. **Interactions:** Lọc, mở request.
5. **Navigation:** Review Workspace.
6. **UI Constraints:** Nhận diện waiting và resubmitted bằng nhãn.
**Figma Frame:** `[ĐIỀN URL S10]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S11 — Review Workspace (Supervisor)
1. **Layout:** Document Viewer, AI findings, feedback, decision bar.
2. **Components:** Viewer, FindingCard, TextField, Dialog.
3. **States:** AI idle/loading/done/error, review states.
4. **Interactions:** Run/retry AI, feedback, quyết định.
5. **Navigation:** History, AI Result, Queue.
6. **UI Constraints:** AI không approve; dialog confirm; sticky CTA không che văn bản.
**Figma Frame:** `[ĐIỀN URL S11]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S12 — AI Review Result (Supervisor)
1. **Layout:** Finding summary, list.
2. **Components:** FindingCard, Accordion.
3. **States:** Loading, success, error.
4. **Interactions:** Mở finding, trở lại workspace.
5. **Navigation:** Workspace.
6. **UI Constraints:** Phân biệt AI finding với supervisor feedback.
**Figma Frame:** `[ĐIỀN URL S12]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S13 — Version History (Supervisor)
1. **Layout:** Version timeline, item detail.
2. **Components:** Timeline, VersionCard.
3. **States:** Empty, content.
4. **Interactions:** Chọn version, mở preview.
5. **Navigation:** Workspace/Review History.
6. **UI Constraints:** Không ghi đè version đã nộp.
**Figma Frame:** `[ĐIỀN URL S13]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### S14 — Review History (Supervisor)
1. **Layout:** Timeline events, decision details.
2. **Components:** Timeline, FeedbackCard.
3. **States:** Empty, content.
4. **Interactions:** Xem sự kiện/version.
5. **Navigation:** Version History/Workspace.
6. **UI Constraints:** Lịch sử có timestamp và người quyết định.
**Figma Frame:** `[ĐIỀN URL S14]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### ST01 — Student Dashboard (Student)
1. **Layout:** Profile summary, my tasks, project card.
2. **Components:** Header, SummaryCard, NavigationBar.
3. **States:** Loading, content, empty.
4. **Interactions:** Mở project/tài liệu.
5. **Navigation:** My Project / Documents.
6. **UI Constraints:** Chỉ hiển thị dữ liệu của sinh viên.
**Figma Frame:** `[ĐIỀN URL ST01]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### ST02 — My Project (Student)
1. **Layout:** Project info, Lab items, progress.
2. **Components:** ProjectCard, LabCard.
3. **States:** Loading, content, empty.
4. **Interactions:** Mở Lab Item.
5. **Navigation:** Student Documents.
6. **UI Constraints:** Không cho chỉnh cấu trúc Lab từ Student.
**Figma Frame:** `[ĐIỀN URL ST02]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### ST03 — Student Documents (Student)
1. **Layout:** Document list, review status, feedback entry.
2. **Components:** DocumentCard, StatusBadge.
3. **States:** NoSubmission, waiting, needsRevision, approved.
4. **Interactions:** Xem status, mở upload.
5. **Navigation:** Student Upload / Version History.
6. **UI Constraints:** Hiển thị rõ yêu cầu bắt buộc và dependency.
**Figma Frame:** `[ĐIỀN URL ST03]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### ST04 — Student Upload (Student)
1. **Layout:** Upload field, validation, submit.
2. **Components:** FilePicker, TextField, Button.
3. **States:** Idle, invalid, uploading, success, error.
4. **Interactions:** Chọn file, kiểm tra, tạo version và request.
5. **Navigation:** Student Documents / Review Status.
6. **UI Constraints:** Đúng file types, không overwrite version cũ.
**Figma Frame:** `[ĐIỀN URL ST04]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

### ST05 — Student Review Result (Student)
1. **Layout:** Status summary, supervisor feedback, versions.
2. **Components:** StatusBadge, FeedbackCard, Timeline.
3. **States:** Waiting, revision, approved, rejected.
4. **Interactions:** Đọc feedback, upload version mới.
5. **Navigation:** Student Upload / History.
6. **UI Constraints:** Không cho resubmit trùng pending request.
**Figma Frame:** `[ĐIỀN URL ST05]` · **Route:** `[XÁC MINH TRONG CODE MỚI NHẤT]`

## 5. Prototype → Flutter interaction mapping
| Sự kiện | Kết quả UI | Flutter suggestion |
|---|---|---|
| Navigation tap | Mở tab, giữ active | `NavigationBar` + router |
| Open review | Mở đúng request ID | Named route with ID |
| Confirm approval | Dialog rồi cập nhật status | `showDialog` + state mutation |
| Retry AI | Error→Loading→Result | async state machine |
| Upload new version | vN+1; không overwrite vN | immutable version model |
| Browser Back tương đương | Trở về ngữ cảnh trước | `Navigator.pop` / router pop |

## 6. Checklist handoff trước khi bàn giao
- [ ] Bảng token có giá trị/variables thực tế từ Figma.
- [ ] Các component là instances; ghi đủ states.
- [ ] Mỗi screen có frame, route, 6 mục.
- [ ] Kiểm tra 360/412, contrast, tap target.
- [ ] Demo 3 flow và error/retry trong Figma Prototype.
- [ ] Người đọc chưa biết dự án có thể lần theo ID S01–ST05.
