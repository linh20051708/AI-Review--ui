# Dữ kiện repo nền — `linh20051708/AI-Review--ui`

Nguồn: clone `--depth 1` về `/tmp/ai-review-src` (2026-10-13). Đây là **code nền** của Lab 2
(đề tài thật: **Hệ thống quản lý học vụ / Review tài liệu cho giảng viên**).
Mọi tài liệu Lab 2 phải bám file này, không suy diễn.

## 1. Nhận dạng

| Mục | Giá trị |
|---|---|
| Repo | `https://github.com/linh20051708/AI-Review--ui` |
| Chủ | `linh20051708` (dieu linh) |
| Nguồn gốc | Sinh từ **Figma Make** (`.figma/make/site.json`, `AGENTS.md` ghi "running inside Figma Make") |
| Tên nội bộ | `figma-make-app` (package.json) / "AI Review App" (site.json) |
| Mô tả (site.json) | "Hệ thống quản lý học vụ và review tài liệu cho giảng viên." |
| Ngôn ngữ dữ liệu | `vi` |
| Trạng thái | **Không có README** trên `main` |

## 2. Stack (package.json)

- Runtime: **React 19** + React DOM 19, `react-router-dom` 7, `lucide-react` (icon)
- Style: **Tailwind CSS v4** qua `@tailwindcss/vite`, `src/index.css` import `tailwindcss`
- Build: **Vite 8**, TypeScript 5.7, `@vitejs/plugin-react`; format: `oxfmt`
- Dev server (theo AGENTS.md của repo): Vite chạy sẵn ở `$PORT` (mặc định 8443)
- Alias `@` → `src`
- **KHÔNG phải Flutter**, không có Figma Design file kèm repo

## 3. Design token — trong `src/index.css` khối `@theme`

| Token | Giá trị | Vai trò |
|---|---|---|
| `--font-sans` | `"Inter", ui-sans-serif…` | chữ |
| `--color-ink` | `#24332d` | chữ chính |
| `--color-muted` | `#66736d` | chữ phụ |
| `--color-line` | `#e1e7e3` | viền |
| `--color-canvas` | `#fafbfa` | nền trang |
| `--color-subtle` | `#f7f9f7` | nền phụ |
| `--color-brand` | `#146b55` | thương hiệu (mint) |
| `--color-brand-soft` | `#eaf4ed` | nền brand nhạt |
| `--color-brand-tint` | `#f2f7f3` | nền brand mờ |
| `--color-olive` | `#637344` | tone olive |
| `--color-olive-soft` | `#f1f4e9` | |
| `--color-amber` | `#756534` | tone amber |
| `--color-amber-soft` | `#f5f2e7` | |
| `--color-rust` | `#a65335` | tone rust |
| `--color-rust-soft` | `#fbf0ea` | |
| `--color-danger` | `#a34343` | lỗi |
| `--color-danger-soft` | `#faeeee` | |

Khác: `--app-safe-top: max(env(safe-area-inset-top), 54px)`; `.mobile-header-inner` min-height **56px**;
breakpoint `lg` (1024px) đổi sang side nav. Tone enum (`types/index.ts`): `brand | olive | amber | rust | danger | neutral`.

## 4. Layout & điều hướng

- `src/layouts/MobileAppLayout.tsx`: mobile-first, nội dung max-width **480px** (`sm` 720, `lg` 880, `wide` 1440);
  document không cuộn, `.mobile-content` tự cuộn; chặn khi chưa đăng nhập → `/login`.
- `src/layouts/AuthLayout.tsx` — nhánh `login`.
- `src/app/auth.ts` — session giả: `localStorage["project-review:session"] === "1"`.
- Bottom nav **5 tab** (`src/components/layout/BottomNavigation.tsx`):
  `Tổng quan` (/dashboard) · `Project` (/projects, kèm /classes /groups /semesters /documents /rule-sets /courses) ·
  `Review` (/reviews, kèm /review-history) · `Thông báo` (/notifications) · `Tài khoản` (/profile).
  Tab active: `bg-brand-soft text-brand`; min-height 48px; icon lucide size 20 strokeWidth 1.75.
- `SideNavigation.tsx`, `MobileHeader.tsx` cho desktop.

## 5. Màn hình (đúng 23 page, theo `src/app/router.tsx`)

| Nhóm | Màn hình | Route |
|---|---|---|
| auth | LoginPage | `/login` |
| dashboard | DashboardPage | `/dashboard` (index → redirect) |
| classes | ClassListPage, ClassDetailPage | `/classes`, `/classes/:classId` |
| projects | ProjectListPage, ProjectDetailPage, ProjectDocumentsPage | `/projects`, `/projects/:projectId`, `/projects/:projectId/documents` |
| reviews | ReviewRequestsPage, ReviewWorkspacePage, AIReviewResultPage, VersionHistoryPage, ReviewHistoryPage, ReviewHistoryIndexPage | `/reviews`, `/reviews/:reviewId` (wide), `/reviews/:reviewId/ai-result`, `/reviews/:reviewId/versions`, `/reviews/:reviewId/history`, `/review-history` |
| documents | DocumentListPage | `/documents` |
| groups | GroupListPage, GroupDetailPage | `/groups`, `/groups/:groupId` |
| semesters | SemesterListPage, RuleSetListPage, CourseListPage, CourseOfferingDetailPage | `/semesters`, `/rule-sets`, `/courses`, `/course-offerings/:offeringId` |
| students | StudentListPage | `/students` |
| notifications | NotificationsPage | `/notifications` |
| profile | ProfilePage | `/profile` |
| fallback | `*` → `/dashboard` | |

## 6. Domain model (tóm từ `src/types/index.ts`)

- **Status** một từ vựng duy nhất: `draft, submitted, reviewRequested, aiReviewing, aiReviewed, waiting,
  inReview, needsRevision, resubmitted, approved, notAccepted, submissionLocked, notStarted`.
  Tách 3 track: `DocumentStatus` | `AIStatus` | `SupervisorStatus`.
- **GroupHealth**: `onTrack, attention, needsRevision, dueSoon, notSubmitted, overdue, waitingLong`.
- **Cấu trúc học vụ**: `Semester` → `Course` (master data dùng lại) → `CourseOffering` (học kỳ × môn: teachingMethod,
  ruleSetId, defaultDeadline, labs) → `ClassRoom` (lớp: labOverride?, teachingMethodOverride?, ruleSetOverride?,
  deadline?, joinCode, qrExpiresAt, state) → `StudentGroup` → `Project`.
- **Kế thừa cấu hình 3 tầng** (`src/lib/config.ts`): Offering → Class → Project, trả về cả `source` người đọc được
  (`Kế thừa từ …`). Luật: cụ thể nhất thắng; mỗi resolver báo nguồn.
- **RuleSet**: `aiReview: auto|manual`, `aiRequiredBeforeSupervisor`, `supervisorApproval`, `prerequisiteApproval`,
  `allowedFormats[]`, `maxFileSizeMB`, `reviewSlaDays`, `maxResubmissions?`.
- **Lab / LabItem**: `deliverableType Document|Diagram|Report|Other`, `required`, `aiReview required|optional|disabled`,
  `allowedFiles PDF|DOCX|Both`, `deadline?` (ghi đè), `dependsOn[]` (item phải được duyệt trước → `submissionLocked`).
- **ProjectDocument** = tài liệu logic, version tách riêng; `versionCount`, `ai: {errors, warnings, suggestions}`.
- **ReviewRequest**: snapshot đầy đủ ngữ cảnh (semester/course/class/group/project/tài liệu/version/file/pageCount),
  `requestedTs`, `aiStatus`, `supervisorStatus`, `revisionRound?`.
- **AIFinding**: `level error|warning|suggestion`, `category`, `message`, `pageRef?`.
- **ReviewFeedback**: `severity Minor|Major|Critical`, `official: boolean` (feedback thuộc lượt review chính thức = read-only).
- **DocumentVersion**: bất biến; bản `isCurrent` phản ánh trạng thái supervisor sống.
- **AuditEvent**, **Notification**, **AttentionItem**.
- `TeachingMethod`: `Trực tiếp | Trực tuyến | Hybrid | Project-based Learning | Flipped Classroom | Blended Learning | Other`.

## 7. Dữ liệu mẫu (`src/data/mockData.ts`, 476 dòng)

`currentUser` = **"Nguyễn Văn An" (NA), Giảng viên / Supervisor, an.nguyen@university.edu.vn, Fall 2026**.

Bảng `statusMeta: Record<Status, {label, tone}>` (nhãn tiếng Việt đầy đủ) và `groupHealthMeta`.

Các mảng export (dòng): `ruleSets`(70) `semesters`(110) `courses`(117) `courseOfferings`(156) `labTemplates`(190)
`classes`(214) `students`(262) `studentGroups`(276) `projects`(311) `joinRequests`(339) `documents`(352)
`reviewRequests`(390) `attentionItems`(463) `notifications`(471).

Store (in-memory, `useSyncExternalStore`): `managementStore.ts` (cấu trúc học vụ) và `reviewStore.ts`
(luồng supervisor: requests/feedback/audit; version bất biến).

## 8. Thư viện UI tự viết (`src/components/ui/`, 22 file)

Avatar, BackLink, Badge, Button, Card, ConfirmModal, EmptyState, Form, Input, MetaGrid, Modal, MoreMenu,
Notice, PageHeading, ProgressBar, QRCode, SearchInput, SectionHeader, SegmentedTabs, StatCard, StatusBadge, Toast.

Component nghiệp vụ: `document/` (DocumentCard, DocumentRoadmapItem, DocumentViewer, useDocumentState),
`filters/` (OptionList, Popover, SmartFilterBar, TimeControls, useFacetLabels),
`lab/LabStructureEditor`, `layout/` (BottomNavigation, MobileHeader, SideNavigation),
`project/` (AddStudentsModal, ClassCard, ClassFormModal, GroupFormModal, MemberRow, ProjectCard, ProjectFormModal),
`review/` (AIFindingCard, AIReviewSection, DecisionModals, FeedbackComposer, FeedbackItem, ReviewContextCard,
ReviewListSkeleton, ReviewRequestCard, StatusTracks, TimelineItem, VersionCard, severity).

## 9. Quy mô

| Thư mục | LOC |
|---|---|
| `src/pages` | 3417 |
| `src/components` | 3598 |
| `src/data` | 745 |
| `src/lib` | 378 |
| `src/layouts` | 52 |

Đặc điểm kỹ thuật đáng nêu trong báo cáo: **kế thừa cấu hình 3 tầng có báo nguồn**, **3 track trạng thái độc lập**,
**version bất biến + audit trail**, **phụ thuộc lab item** (khóa gửi review), **smart filter theo facet học vụ**.

## 10. Điều PHẢI ghi trung thực trong tài liệu Lab 2

- Repo là **code nền do thầy cung cấp** (qua dieu linh), không phải do người nộp viết.
- Repo **không kèm file Figma Design** — phần Figma 6 page Lab 2 phải do người nộp tự dựng.
- Không có README, không có test, không có CI trong repo gốc.
