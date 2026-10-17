import { NOW, parseVN } from "@/lib/time"
import type {
  AICheck,
  AICounts,
  AIFinding,
  AttentionItem,
  AuditEvent,
  ClassRoom,
  Course,
  JoinRequest,
  RuleSet,
  CourseOffering,
  Lab,
  LabItem,
  LabTemplate,
  DocumentVersion,
  GroupHealth,
  Notification,
  Project,
  ProjectDocument,
  ReviewFeedback,
  ReviewRequest,
  Semester,
  Status,
  Student,
  StudentGroup,
  Tone,
} from "@/types"

export const currentUser = {
  name: "Nguyễn Văn An",
  initials: "NA",
  role: "Giảng viên / Supervisor",
  email: "an.nguyen@university.edu.vn",
  semester: "Fall 2026",
}

/** The demo student used by the Student UI (Nguyễn Minh Anh · SE1701 · Group 01). */
export const demoStudentId = "s1"

export const statusMeta: Record<Status, { label: string; tone: Tone }> = {
  draft: { label: "Bản nháp", tone: "neutral" },
  submitted: { label: "Đã nộp", tone: "olive" },
  reviewRequested: { label: "Đã gửi yêu cầu review", tone: "olive" },
  aiReviewing: { label: "AI đang review", tone: "olive" },
  aiReviewed: { label: "AI đã review", tone: "olive" },
  waiting: { label: "Chờ giảng viên review", tone: "amber" },
  inReview: { label: "Đang review", tone: "brand" },
  needsRevision: { label: "Cần chỉnh sửa", tone: "rust" },
  resubmitted: { label: "Đã nộp lại", tone: "olive" },
  approved: { label: "Đã phê duyệt", tone: "brand" },
  notAccepted: { label: "Không đạt", tone: "danger" },
  submissionLocked: { label: "Khóa gửi review", tone: "neutral" },
  notStarted: { label: "Chưa bắt đầu", tone: "neutral" },
}

export const groupHealthMeta: Record<GroupHealth, { label: string; tone: Tone }> = {
  onTrack: { label: "Đúng tiến độ", tone: "brand" },
  attention: { label: "Cần chú ý", tone: "amber" },
  needsRevision: { label: "Cần chỉnh sửa", tone: "rust" },
  dueSoon: { label: "Sắp đến hạn", tone: "amber" },
  notSubmitted: { label: "Chưa nộp tài liệu", tone: "neutral" },
  overdue: { label: "Quá hạn", tone: "danger" },
  waitingLong: { label: "Chờ review lâu", tone: "rust" },
}

export const aiSummary = (ai?: AICounts) => {
  if (!ai) return "Chưa chạy"
  const parts = [ai.errors && `${ai.errors} lỗi`, ai.warnings && `${ai.warnings} cảnh báo`, ai.suggestions && `${ai.suggestions} gợi ý`].filter(Boolean)
  return parts.length ? parts.join(" · ") : "Không phát hiện lỗi"
}

export const ruleSets: RuleSet[] = [
  {
    id: "swp-standard-2026",
    name: "SWP Standard Review 2026",
    description: "Quy trình review chuẩn cho môn Software Project.",
    aiReview: "auto",
    aiRequiredBeforeSupervisor: false,
    supervisorApproval: true,
    prerequisiteApproval: true,
    allowedFormats: ["PDF", "DOCX"],
    maxFileSizeMB: 20,
    reviewSlaDays: 3,
    maxResubmissions: 5,
  },
  {
    id: "swr-requirements-2026",
    name: "SWR Requirements Review 2026",
    description: "Tập trung vào SRS và các Use Case Diagram cho môn Software Requirements.",
    aiReview: "auto",
    aiRequiredBeforeSupervisor: true,
    supervisorApproval: true,
    prerequisiteApproval: true,
    allowedFormats: ["PDF", "DOCX"],
    maxFileSizeMB: 15,
    reviewSlaDays: 5,
  },
  {
    id: "swp-standard-2025",
    name: "SWP Standard Review 2025",
    description: "Phiên bản cũ, giữ lại cho các học kỳ đã kết thúc.",
    aiReview: "manual",
    aiRequiredBeforeSupervisor: false,
    supervisorApproval: true,
    prerequisiteApproval: false,
    allowedFormats: ["PDF"],
    maxFileSizeMB: 10,
    reviewSlaDays: 7,
  },
]

export const semesters: Semester[] = [
  { id: "fall-2026", name: "Fall 2026", academicYear: "2026–2027", startDate: "2026-09-01", endDate: "2026-12-31", archived: false },
  { id: "summer-2026", name: "Summer 2026", academicYear: "2025–2026", startDate: "2026-05-01", endDate: "2026-08-31", archived: false },
  { id: "spring-2026", name: "Spring 2026", academicYear: "2025–2026", startDate: "2026-01-05", endDate: "2026-04-30", archived: true },
  { id: "spring-2027", name: "Spring 2027", academicYear: "2026–2027", startDate: "2027-01-05", endDate: "2027-04-30", archived: false },
]

export const courses: Course[] = [
  { id: "swp391", code: "SWP391", name: "Software Project", description: "Capstone-style software project course." },
  { id: "swr302", code: "SWR302", name: "Software Requirements", description: "Elicitation, phân tích và đặc tả requirement." },
  { id: "prn212", code: "PRN212", name: "Programming with .NET", description: "Lập trình ứng dụng với C# và .NET." },
]

let uid = 0
const item = (code: string, title: string, deps: string[] = [], extra: Partial<LabItem> = {}): LabItem => ({
  id: `it-${++uid}`,
  code,
  title,
  deliverableType: /Diagram/.test(title) ? "Diagram" : "Document",
  documentType: title,
  required: true,
  aiReview: "required",
  supervisorReview: "required",
  allowedFiles: "Both",
  dependsOn: deps,
  ...extra,
})
/** Resolve dependency codes to ids inside one structure. */
const labs = (list: { code: string; title: string; deadline?: string; items: LabItem[] }[]): Lab[] => {
  const all = list.flatMap((l) => l.items)
  return list.map((l) => ({
    id: `lab-${++uid}`,
    code: l.code,
    title: l.title,
    deadline: l.deadline,
    items: l.items.map((i) => ({ ...i, dependsOn: i.dependsOn.map((code) => all.find((x) => x.code === code)!.id) })),
  }))
}

const swpFall = () =>
  labs([
    { code: "Lab 1", title: "Requirements & Analysis", deadline: "2026-10-15T23:59", items: [item("1.1", "Use Case Diagram"), item("1.2", "Activity Diagram", ["1.1"]), item("1.3", "Sequence Diagram", ["1.2"]), item("1.4", "State Diagram", ["1.3"])] },
    { code: "Lab 2", title: "Specification", deadline: "2026-11-10T23:59", items: [item("2.1", "SRS", ["1.1", "1.4"], { deliverableType: "Document", allowedFiles: "DOCX" }), item("2.2", "SDS", ["2.1"])] },
    { code: "Lab 3", title: "Design", items: [item("3.1", "Detailed Design", ["2.2"], { aiReview: "optional" })] },
  ])

export const courseOfferings: CourseOffering[] = [
  { id: "off-f26-swp391", semesterId: "fall-2026", courseId: "swp391", teachingMethod: "Project-based Learning", ruleSetId: "swp-standard-2026", defaultDeadline: "2026-12-15T23:59", labs: swpFall() },
  {
    id: "off-f26-swr302",
    semesterId: "fall-2026",
    courseId: "swr302",
    teachingMethod: "Flipped Classroom",
    ruleSetId: "swr-requirements-2026",
    defaultDeadline: "2026-12-10T23:59",
    labs: labs([
      { code: "Milestone 1", title: "Elicitation", items: [item("REQ-01", "Use Case Diagram")] },
      { code: "Milestone 2", title: "Specification", items: [item("REQ-02", "SRS", ["REQ-01"], { allowedFiles: "DOCX" })] },
    ]),
  },
  {
    id: "off-s26-prn212",
    semesterId: "summer-2026",
    courseId: "prn212",
    teachingMethod: "Trực tiếp",
    ruleSetId: "swp-standard-2025",
    defaultDeadline: "2026-08-25T23:59",
    labs: labs([
      { code: "Lab 1", title: "Modeling", items: [item("1.1", "Activity Diagram")] },
      { code: "Lab 2", title: "Design", items: [item("2.1", "SDS", ["1.1"], { allowedFiles: "PDF" })] },
    ]),
  },
]

/** SE1702 customises Lab 1 without touching the SWP391 · Fall 2026 base or SE1701. */
const se1702Override = labs([
  { code: "Lab 1", title: "Requirements & Analysis", deadline: "2026-10-20T23:59", items: [item("1.1", "Use Case Diagram"), item("1.2", "Sequence Diagram", ["1.1"]), item("1.3", "Class Diagram", ["1.2"])] },
  { code: "Lab 2", title: "Specification", items: [item("2.1", "SRS", ["1.3"], { allowedFiles: "DOCX" }), item("2.2", "SDS", ["2.1"])] },
])

export const labTemplates: LabTemplate[] = [{ id: "tpl-1", name: "Requirements & Analysis (4 diagram)", lab: swpFall()[0], savedFrom: "SWP391 · Fall 2026" }]

const cls = (id: string, code: string, semesterId: string, courseId: string, schedule: ClassRoom["schedule"], session: ClassRoom["session"], counts: [number, number, number, number], joinSuffix: string): ClassRoom => ({
  id,
  code,
  semesterId,
  courseId,
  offeringId: courseOfferings.find((o) => o.semesterId === semesterId && o.courseId === courseId)!.id,
  startDate: semesters.find((s) => s.id === semesterId)!.startDate,
  endDate: semesters.find((s) => s.id === semesterId)!.endDate,
  capacity: 40,
  schedule,
  session,
  joinCode: `${code}-${semesterId === "fall-2026" ? "F26" : "S26"}-${joinSuffix}`,
  requireApproval: true,
  qrExpiresAt: "2026-10-30T23:59",
  lecturer: "Nguyễn Văn An",
  studentCount: counts[0],
  groupCount: counts[1],
  projectCount: counts[2],
  pendingReviews: counts[3],
  state: "active",
})

export const classes: ClassRoom[] = [
  cls("se1701", "SE1701", "fall-2026", "swp391", "36", "morning", [34, 8, 8, 4], "A7K9"),
  { ...cls("se1702", "SE1702", "fall-2026", "swp391", "25", "afternoon", [9, 2, 2, 1], "B2M4"), labOverride: se1702Override },
  cls("se1703", "SE1703", "fall-2026", "swp391", "47", "evening", [4, 1, 1, 1], "C8P1"),
  cls("se1801", "SE1801", "fall-2026", "swr302", "25", "morning", [8, 2, 2, 1], "D5R7"),
  cls("se1650", "SE1650", "summer-2026", "prn212", "36", "afternoon", [4, 1, 1, 0], "E3T6"),
]

const names = [
  "Nguyễn Minh Anh", "Trần Hoàng Nam", "Lê Gia Huy", "Phạm Thảo My", "Đỗ Khánh Linh", "Võ Quốc Bảo", "Hoàng Thu Trang", "Bùi Gia Bảo",
  "Đặng Hải Yến", "Phan Đức Long", "Ngô Bảo Ngọc", "Trịnh Minh Khoa", "Lý Thanh Tâm", "Mai Phương Thảo", "Vũ Tuấn Kiệt", "Dương Hà Vy",
  "Cao Nhật Minh", "Hồ Ngọc Hân", "Tạ Quang Vinh", "Lâm Bích Ngân", "Kiều Anh Thư", "Quách Gia Hưng", "Châu Mỹ Linh", "Tôn Thất Phúc",
  "La Hoàng Yến", "Đinh Công Danh", "Huỳnh Kim Chi", "Lưu Bảo Châu", "Triệu Minh Tú", "Âu Dương Khang", "Văn Thùy Dung", "Hà Trọng Nghĩa",
  "Từ Diệu Linh", "Mạc Văn Toàn",
]
const otherNames: [string, string][] = [
  ["se1702", "Nguyễn Hữu Phát"], ["se1702", "Trần Ngọc Ánh"], ["se1702", "Lê Thành Đạt"], ["se1702", "Phạm Gia Hân"], ["se1702", "Võ Minh Quân"],
  ["se1702", "Đỗ Thu Hà"], ["se1702", "Bùi Anh Tuấn"], ["se1702", "Hoàng Yến Nhi"], ["se1702", "Ngô Đức Thịnh"],
  ["se1703", "Trịnh Bảo Anh"], ["se1703", "Lý Quốc Huy"], ["se1703", "Mai Khánh Vy"], ["se1703", "Vũ Đình Khôi"],
  ["se1801", "Dương Minh Châu"], ["se1801", "Cao Gia Linh"], ["se1801", "Hồ Tấn Phong"], ["se1801", "Tạ Mỹ Duyên"],
  ["se1801", "Lâm Hoàng Long"], ["se1801", "Kiều Thanh Trúc"], ["se1801", "Quách Bảo Ngọc"], ["se1801", "Châu Minh Nhật"],
  ["se1650", "Tôn Nữ Thảo"], ["se1650", "La Văn Hậu"], ["se1650", "Đinh Ngọc Mai"], ["se1650", "Huỳnh Gia Khang"],
]
export const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/)
  return ((parts.at(-2)?.[0] ?? "") + (parts.at(-1)?.[0] ?? "")).toUpperCase()
}
export const emailOf = (name: string, code: string) => {
  const plain = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().split(" ")
  return `${plain.at(-1)}${plain.slice(0, -1).map((w) => w[0]).join("")}${code.slice(-4)}@university.edu.vn`
}

const groupSizes = [4, 5, 4, 4, 4, 4, 4, 5]
const se1701Students: Student[] = names.map((name, i) => {
  let acc = 0
  const groupIndex = groupSizes.findIndex((size) => (acc += size) > i)
  const studentCode = `SE17${String(120 + i).padStart(4, "0")}`
  return { id: `s${i + 1}`, initials: initialsOf(name), name, studentCode, email: emailOf(name, studentCode), classId: "se1701", groupId: groupIndex >= 0 ? `se1701-group-0${groupIndex + 1}` : undefined }
})
const otherStudents: Student[] = otherNames.map(([classId, name], i) => {
  const studentCode = `SE18${String(300 + i).padStart(4, "0")}`
  return { id: `o${i + 1}`, initials: initialsOf(name), name, studentCode, email: emailOf(name, studentCode), classId }
})
// Seat the first 4 students of each other class into their first group, the rest into group 02.
otherStudents.forEach((s) => {
  const peers = otherStudents.filter((x) => x.classId === s.classId)
  s.groupId = `${s.classId}-group-0${peers.indexOf(s) < 4 ? 1 : 2}`
})
export const students: Student[] = [...se1701Students, ...otherStudents]

const group = (classId: string, n: number, projectId: string | undefined, health: GroupHealth, progress: number, pendingReviews: number, lastActivity: string): StudentGroup => ({
  id: `${classId}-group-0${n}`,
  classId,
  name: `Group 0${n}`,
  projectId,
  health,
  memberIds: students.filter((s) => s.groupId === `${classId}-group-0${n}`).map((s) => s.id),
  progress,
  pendingReviews,
  lastActivity,
})

export const studentGroups: StudentGroup[] = [
  group("se1701", 1, "smart-campus-management", "onTrack", 65, 1, "15 phút trước"),
  group("se1701", 2, "hospital-management-system", "attention", 54, 1, "3 giờ trước"),
  group("se1701", 3, "student-services-portal", "needsRevision", 48, 1, "1 ngày trước"),
  group("se1701", 4, "smart-attendance-system", "onTrack", 32, 1, "2 giờ trước"),
  group("se1701", 5, "dormitory-management-platform", "dueSoon", 40, 1, "5 giờ trước"),
  group("se1701", 6, "ai-learning-assistant", "notSubmitted", 12, 0, "2 ngày trước"),
  group("se1701", 7, "event-management-system", "overdue", 25, 0, "3 ngày trước"),
  group("se1701", 8, "campus-service-portal", "waitingLong", 46, 1, "45 phút trước"),
  group("se1702", 1, "library-booking-system", "onTrack", 30, 1, "Hôm qua"),
  group("se1702", 2, undefined, "notSubmitted", 0, 0, "4 ngày trước"),
  group("se1703", 1, "clinic-appointment-app", "waitingLong", 28, 1, "6 ngày trước"),
  group("se1801", 1, "requirement-tracker", "onTrack", 35, 1, "15 phút trước"),
  group("se1801", 2, "elearning-platform-srs", "attention", 20, 0, "2 ngày trước"),
  group("se1650", 1, "canteen-ordering-system", "onTrack", 100, 0, "Summer 2026"),
]

const projectInfo: Record<string, { name: string; description: string; method?: string }> = {
  "smart-campus-management": { name: "Smart Campus Management", description: "Hệ thống quản lý cơ sở vật chất, lịch phòng và dịch vụ trong khuôn viên trường." },
  "hospital-management-system": { name: "Hospital Management System", description: "Quản lý lịch khám, hồ sơ bệnh nhân và thanh toán viện phí." },
  "student-services-portal": { name: "Student Services Portal", description: "Cổng dịch vụ một cửa cho sinh viên: đơn từ, học phí, lịch học." },
  "smart-attendance-system": { name: "Smart Attendance System", description: "Điểm danh bằng QR và nhận diện khuôn mặt cho lớp học." },
  "dormitory-management-platform": { name: "Dormitory Management Platform", description: "Quản lý đăng ký phòng, hóa đơn và bảo trì ký túc xá." },
  "ai-learning-assistant": { name: "AI Learning Assistant", description: "Trợ lý học tập gợi ý tài liệu và câu hỏi ôn tập." },
  "event-management-system": { name: "Event Management System", description: "Tổ chức, đăng ký và check-in sự kiện của trường." },
  "campus-service-portal": { name: "Campus Service Portal", description: "Đặt dịch vụ in ấn, gửi xe và hỗ trợ kỹ thuật trong trường." },
  "library-booking-system": { name: "Library Booking System", description: "Đặt chỗ phòng học nhóm và mượn sách trực tuyến.", method: "Hybrid" },
  "clinic-appointment-app": { name: "Clinic Appointment App", description: "Đặt lịch khám cho phòng khám đa khoa.", method: "Blended Learning" },
  "requirement-tracker": { name: "Requirement Tracker", description: "Quản lý requirement, truy vết từ Use Case tới SRS.", method: "Flipped Classroom" },
  "elearning-platform-srs": { name: "E-learning Platform SRS", description: "Đặc tả yêu cầu cho nền tảng học trực tuyến.", method: "Flipped Classroom" },
  "canteen-ordering-system": { name: "Canteen Ordering System", description: "Đặt món căng tin trước giờ nghỉ.", method: "Trực tiếp" },
}

const roles = ["Trưởng nhóm", "Thành viên", "Thành viên", "Thành viên", "Thành viên"]

export const projects: Project[] = studentGroups
  .filter((g) => g.projectId)
  .map((g) => {
    const c = classes.find((x) => x.id === g.classId)!
    const sem = semesters.find((x) => x.id === c.semesterId)!
    const info = projectInfo[g.projectId!]
    return {
      id: g.projectId!,
      name: info.name,
      description: info.description,
      groupId: g.id,
      lecturer: "Nguyễn Văn An",
      startDate: sem.startDate,
      deadline: `${sem.endDate.slice(0, 8)}${sem.id === "fall-2026" ? "15" : "25"}T23:59`,
      reviewCutoff: sem.id === "fall-2026" ? "2026-12-10T23:59" : undefined,
      progress: g.progress,
      members: g.memberIds.map((id, i) => {
        const s = students.find((x) => x.id === id)!
        return { initials: s.initials, name: s.name, role: roles[i] }
      }),
      state: "active" as const,
      hasHistory: g.health !== "notSubmitted",
      ...(g.projectId === "smart-campus-management" && {
        nextStep: "Review Sequence Diagram v2. State Diagram đang chờ sinh viên nộp version mới; SRS vẫn khóa gửi review.",
      }),
    }
  })

export const joinRequests: JoinRequest[] = [
  { id: "j1", classId: "se1701", name: "Phùng Thanh Sơn", studentCode: "SE170255", email: "sonpt0255@university.edu.vn", requestedAt: NOW - 25 * 60_000 },
  { id: "j2", classId: "se1701", name: "Giang Mỹ Tiên", studentCode: "SE170261", email: "tiengm0261@university.edu.vn", requestedAt: NOW - 3 * 3_600_000 },
]

/** University directory used by manual add (students not yet in a class). */
export const directoryStudents = [
  ["SE170201", "Nguyễn Văn Bình"], ["SE170202", "Trần Thị Cúc"], ["SE170203", "Lê Hoàng Dũng"], ["SE170204", "Phạm Ngọc Giàu"],
  ["SE170205", "Võ Thị Hồng"], ["SE170206", "Đặng Quốc Khánh"], ["SE170207", "Bùi Thị Lan"], ["SE170208", "Hoàng Văn Mạnh"],
  ["SE170209", "Ngô Thị Nga"], ["SE170210", "Phan Thanh Phong"], ["SE170211", "Trương Mỹ Quyên"], ["SE170212", "Lý Văn Sang"],
].map(([studentCode, name]) => ({ studentCode, name, email: emailOf(name, studentCode), initials: initialsOf(name) }))


export const documents: ProjectDocument[] = [
  { id: "use-case", projectId: "smart-campus-management", title: "Use Case Diagram", order: 1, latestVersion: "v3", versionCount: 3, documentStatus: "resubmitted", supervisorStatus: "approved", ai: { errors: 0, warnings: 0, suggestions: 1 }, submitter: "Nguyễn Minh Anh", updatedAt: "14/09/2026", reviewId: "review-003" },
  { id: "activity", projectId: "smart-campus-management", title: "Activity Diagram", order: 2, latestVersion: "v2", versionCount: 2, documentStatus: "resubmitted", supervisorStatus: "approved", ai: { errors: 0, warnings: 1, suggestions: 0 }, submitter: "Trần Hoàng Nam", updatedAt: "20/09/2026", dependsOn: "Use Case Diagram" },
  { id: "sequence", projectId: "smart-campus-management", title: "Sequence Diagram", order: 3, latestVersion: "v2", versionCount: 2, documentStatus: "resubmitted", supervisorStatus: "waiting", ai: { errors: 2, warnings: 3, suggestions: 1 }, submitter: "Trần Hoàng Nam", updatedAt: "03/10/2026", dependsOn: "Activity Diagram", reviewId: "review-008", note: "Nộp lại sau feedback v1: sửa thứ tự message." },
  { id: "state", projectId: "smart-campus-management", title: "State Diagram", order: 4, latestVersion: "v1", versionCount: 1, documentStatus: "submitted", supervisorStatus: "needsRevision", ai: { errors: 1, warnings: 2, suggestions: 0 }, submitter: "Lê Gia Huy", updatedAt: "02/10/2026", dependsOn: "Sequence Diagram", note: "Chờ sinh viên nộp version mới: bổ sung trạng thái sau khi bị trả lại." },
  { id: "srs", projectId: "smart-campus-management", title: "SRS", order: 5, versionCount: 0, documentStatus: "draft", submitter: "Phạm Thảo My", updatedAt: "01/10/2026", dependsOn: "State Diagram", submissionLocked: true },
  { id: "sds", projectId: "smart-campus-management", title: "SDS", order: 6, versionCount: 0, documentStatus: "notStarted", dependsOn: "SRS", submissionLocked: true },
  { id: "detailed-design", projectId: "smart-campus-management", title: "Detailed Design", order: 7, versionCount: 0, documentStatus: "notStarted", dependsOn: "SDS", submissionLocked: true },
]

export const lockReason = (dependsOn: string) => `Chưa thể gửi yêu cầu review vì ${dependsOn} chưa được phê duyệt.`

export type ReqInput = Omit<ReviewRequest, "fileName" | "fileType" | "pageCount" | "semesterId" | "courseId" | "classId" | "groupId" | "classCode" | "groupName" | "projectName" | "requestedTs"> &
  Partial<Pick<ReviewRequest, "fileType" | "pageCount" | "classCode" | "groupName" | "projectName">>

/** Fills the full academic context (semester → course → class → group → project) from the project. */
const req = (r: ReqInput): ReviewRequest => {
  const project = projects.find((p) => p.id === r.projectId)!
  const group = studentGroups.find((g) => g.id === project.groupId)!
  const c = classes.find((x) => x.id === group.classId)!
  const fileType = r.fileType ?? "PDF"
  const slug = r.documentTitle.toLowerCase().replace(/\s+/g, "-")
  return {
    ...r,
    documentId: r.documentId ?? (c.labOverride ?? courseOfferings.find((o) => o.id === c.offeringId)?.labs ?? []).flatMap((l) => l.items).find((i) => i.title === r.documentTitle)?.id,
    semesterId: c.semesterId,
    courseId: c.courseId,
    classId: c.id,
    groupId: project.groupId,
    classCode: c.code,
    groupName: group.name,
    projectName: project.name,
    requestedTs: parseVN(r.requestedAt),
    fileType,
    pageCount: r.pageCount ?? 12,
    fileName: `${slug}-${r.version}.${fileType === "PDF" ? "pdf" : "docx"}`,
  }
}

/** Public builder used by the Student UI to create the first review request of a new document. */
export const buildReviewRequest = req

export const reviewRequests: ReviewRequest[] = [
  req({ id: "review-001", projectId: "smart-attendance-system", classCode: "SE1701", groupName: "Group 04", projectName: "Smart Attendance System", documentTitle: "Use Case Diagram", version: "v2", submitter: "Nguyễn Minh Anh", submittedAt: "03/10/2026 · 08:15", requestedAt: "03/10/2026 · 08:20", documentStatus: "resubmitted", aiStatus: "aiReviewed", ai: { errors: 2, warnings: 3, suggestions: 4 }, supervisorStatus: "waiting", revisionRound: 1, note: "Nộp lại sau feedback v1 · 1 feedback cũ cần kiểm tra", pageCount: 12 }),
  req({ id: "review-008", projectId: "smart-campus-management", classCode: "SE1701", groupName: "Group 01", projectName: "Smart Campus Management", documentTitle: "Sequence Diagram", version: "v2", submitter: "Trần Hoàng Nam", submittedAt: "03/10/2026 · 07:40", requestedAt: "03/10/2026 · 07:45", documentStatus: "resubmitted", aiStatus: "aiReviewed", ai: { errors: 2, warnings: 3, suggestions: 1 }, supervisorStatus: "waiting", revisionRound: 1, note: "Nộp lại sau feedback v1 · sửa thứ tự message" }),
  req({ id: "review-005", projectId: "dormitory-management-platform", classCode: "SE1701", groupName: "Group 05", projectName: "Dormitory Management Platform", documentTitle: "Activity Diagram", version: "v1", submitter: "Hoàng Thu Trang", submittedAt: "02/10/2026 · 08:55", requestedAt: "02/10/2026 · 09:00", documentStatus: "submitted", aiStatus: "aiReviewed", ai: { errors: 0, warnings: 1, suggestions: 2 }, supervisorStatus: "waiting", fileType: "DOCX", pageCount: 9 }),
  req({ id: "review-004", projectId: "campus-service-portal", classCode: "SE1701", groupName: "Group 08", projectName: "Campus Service Portal", documentTitle: "Sequence Diagram", version: "v2", submitter: "Võ Quốc Bảo", submittedAt: "29/09/2026 · 16:30", requestedAt: "29/09/2026 · 16:40", documentStatus: "resubmitted", aiStatus: "aiReviewed", ai: { errors: 1, warnings: 1, suggestions: 0 }, supervisorStatus: "waiting", revisionRound: 1, note: "Chờ giảng viên hơn 72 giờ" }),
  req({ id: "review-002", projectId: "hospital-management-system", classCode: "SE1701", groupName: "Group 02", projectName: "Hospital Management System", documentTitle: "Sequence Diagram", version: "v3", submitter: "Đỗ Khánh Linh", submittedAt: "03/10/2026 · 07:05", requestedAt: "03/10/2026 · 07:10", documentStatus: "resubmitted", aiStatus: "aiReviewed", ai: { errors: 0, warnings: 2, suggestions: 1 }, supervisorStatus: "inReview", revisionRound: 2, note: "Bạn đã bắt đầu review lúc 09:40" }),
  req({ id: "review-006", projectId: "student-services-portal", classCode: "SE1701", groupName: "Group 03", projectName: "Student Services Portal", documentTitle: "State Diagram", version: "v2", submitter: "Lê Gia Huy", submittedAt: "03/10/2026 · 09:50", requestedAt: "03/10/2026 · 09:55", documentStatus: "resubmitted", aiStatus: "aiReviewing", ai: { errors: 0, warnings: 0, suggestions: 0 }, supervisorStatus: "inReview", revisionRound: 1, fileType: "DOCX", pageCount: 8 }),
  req({ id: "review-009", projectId: "student-services-portal", classCode: "SE1701", groupName: "Group 03", projectName: "Student Services Portal", documentTitle: "Activity Diagram", version: "v2", submitter: "Phạm Thảo My", submittedAt: "01/10/2026 · 10:00", requestedAt: "01/10/2026 · 10:05", documentStatus: "resubmitted", aiStatus: "aiReviewed", ai: { errors: 1, warnings: 2, suggestions: 0 }, supervisorStatus: "needsRevision", revisionRound: 1, note: "Đã yêu cầu chỉnh sửa lần 2 · chờ sinh viên tạo version mới" }),
  req({ id: "review-003", projectId: "smart-campus-management", classCode: "SE1701", groupName: "Group 01", projectName: "Smart Campus Management", documentTitle: "Use Case Diagram", version: "v3", submitter: "Nguyễn Minh Anh", submittedAt: "14/09/2026 · 10:32", requestedAt: "14/09/2026 · 10:32", documentStatus: "resubmitted", aiStatus: "aiReviewed", ai: { errors: 0, warnings: 0, suggestions: 1 }, supervisorStatus: "approved", revisionRound: 2 }),
  req({ id: "review-010", projectId: "event-management-system", classCode: "SE1701", groupName: "Group 07", projectName: "Event Management System", documentTitle: "Activity Diagram", version: "v1", submitter: "Đặng Hải Yến", submittedAt: "28/09/2026 · 21:10", requestedAt: "28/09/2026 · 21:12", documentStatus: "submitted", aiStatus: "aiReviewed", ai: { errors: 0, warnings: 0, suggestions: 0 }, supervisorStatus: "notAccepted", note: "Không đạt · Sai loại tài liệu (nộp nhầm biên bản họp)" }),
]

reviewRequests.push(
  req({ id: "review-011", projectId: "library-booking-system", documentTitle: "Use Case Diagram", version: "v1", submitter: "Nguyễn Hữu Phát", submittedAt: "02/10/2026 · 14:25", requestedAt: "02/10/2026 · 14:30", documentStatus: "submitted", aiStatus: "aiReviewed", ai: { errors: 1, warnings: 2, suggestions: 1 }, supervisorStatus: "waiting" }),
  req({ id: "review-012", projectId: "requirement-tracker", documentTitle: "SRS", version: "v1", submitter: "Dương Minh Châu", submittedAt: "03/10/2026 · 10:00", requestedAt: "03/10/2026 · 10:05", documentStatus: "submitted", aiStatus: "aiReviewed", ai: { errors: 0, warnings: 3, suggestions: 2 }, supervisorStatus: "waiting", fileType: "DOCX", pageCount: 18 }),
  req({ id: "review-013", projectId: "clinic-appointment-app", documentTitle: "Activity Diagram", version: "v2", submitter: "Trịnh Bảo Anh", submittedAt: "27/09/2026 · 19:40", requestedAt: "27/09/2026 · 19:45", documentStatus: "resubmitted", aiStatus: "aiReviewed", ai: { errors: 1, warnings: 0, suggestions: 1 }, supervisorStatus: "waiting", revisionRound: 1, note: "Chờ giảng viên 6 ngày" }),
  req({ id: "review-014", projectId: "canteen-ordering-system", documentTitle: "SDS", version: "v2", submitter: "Tôn Nữ Thảo", submittedAt: "20/08/2026 · 09:00", requestedAt: "20/08/2026 · 09:05", documentStatus: "resubmitted", aiStatus: "aiReviewed", ai: { errors: 0, warnings: 0, suggestions: 1 }, supervisorStatus: "approved", revisionRound: 1 }),
)

export const aiFindings: AIFinding[] = [
  { id: "f1", level: "error", category: "Incorrect Relationship", message: "Use Case Submit Document chưa có relationship phù hợp với Actor Student.", pageRef: "Trang 8" },
  { id: "f2", level: "error", category: "Missing Element", message: "Use Case Login chưa được liên kết với Actor nào.", pageRef: "Trang 7" },
  { id: "f3", level: "warning", category: "Naming Issue", message: "Use Case Manage Project có phạm vi quá rộng.", pageRef: "Trang 8" },
  { id: "f4", level: "warning", category: "Requirement Mismatch", message: "FR-05 (Request Review) chưa được thể hiện bằng Use Case tương ứng.", pageRef: "Mục 2.3" },
  { id: "f5", level: "warning", category: "UML Violation", message: "Quan hệ Include giữa Upload Document và Request Review đang ngược chiều.", pageRef: "Trang 9" },
  { id: "f6", level: "suggestion", category: "Logic Issue", message: "Cân nhắc tách Manage Project thành Create Project, Update Project và Archive Project.", pageRef: "Trang 8" },
  { id: "f7", level: "suggestion", category: "Naming Issue", message: "Dùng động từ thống nhất cho tên Use Case (Submit / Upload).", pageRef: "Mục 3.1" },
]

export const aiChecks: AICheck[] = [
  { title: "Định dạng file", result: "Hợp lệ", tone: "brand", detail: "File đọc được, 12 trang, không bị khóa mật khẩu." },
  { title: "Cấu trúc tài liệu", result: "Hợp lệ", tone: "brand", detail: "Có đủ mục Giới thiệu, Actor, Use Case, Mô tả chi tiết." },
  { title: "Relationship", result: "2 lỗi", tone: "rust", detail: "Submit Document và Login thiếu Association phù hợp." },
  { title: "Tính nhất quán tên", result: "2 cảnh báo", tone: "amber", detail: "Manage Project có phạm vi quá rộng." },
  { title: "Đối chiếu requirement", result: "1 cảnh báo", tone: "amber", detail: "FR-05 chưa có Use Case tương ứng." },
]

export const feedbackCategories = ["Missing Element", "Incorrect Relationship", "Naming Issue", "Logic Issue", "UML Violation", "Requirement Mismatch", "Other"]

export const reviewFeedback: ReviewFeedback[] = [
  { id: "fb1", reviewId: "review-001", version: "v1", author: "Nguyễn Văn An", createdAt: "30/09/2026 · 15:20", severity: "Major", category: "Missing Element", pageRef: "Trang 6", message: "Bổ sung Actor Student cho luồng nộp tài liệu.", official: true },
  { id: "fb2", reviewId: "review-001", version: "v1", author: "Nguyễn Văn An", createdAt: "30/09/2026 · 15:24", severity: "Major", category: "Incorrect Relationship", pageRef: "Trang 8", message: "Relationship giữa Student và Submit Document chưa đúng.", official: true },
  { id: "fb3", reviewId: "review-001", version: "v1", author: "Nguyễn Văn An", createdAt: "30/09/2026 · 15:30", severity: "Minor", category: "Naming Issue", pageRef: "Mục 3.2.1", message: "Đặt lại tên Use Case Manage Project cho cụ thể hơn.", official: true },
]

export const documentVersions: DocumentVersion[] = [
  { id: "r1v1", reviewId: "review-001", version: "v1", fileName: "use-case-diagram-v1.pdf", submittedAt: "30/09/2026 · 10:05", submitter: "Nguyễn Minh Anh", documentStatus: "submitted", ai: { errors: 3, warnings: 2, suggestions: 2 }, supervisorStatus: "needsRevision", feedbackCount: 3, summary: "Thiếu Actor Student, relationship Submit Document chưa đúng." },
  { id: "r1v2", reviewId: "review-001", version: "v2", fileName: "use-case-diagram-v2.pdf", submittedAt: "03/10/2026 · 08:15", submitter: "Nguyễn Minh Anh", documentStatus: "resubmitted", ai: { errors: 2, warnings: 3, suggestions: 4 }, supervisorStatus: "waiting", feedbackCount: 0, isCurrent: true },
  { id: "r3v1", reviewId: "review-003", version: "v1", fileName: "use-case-diagram-v1.pdf", submittedAt: "10/09/2026 · 09:20", submitter: "Nguyễn Minh Anh", documentStatus: "submitted", ai: { errors: 3, warnings: 1, suggestions: 2 }, supervisorStatus: "needsRevision", feedbackCount: 3, summary: "Thiếu Actor Student, Association của Login và điều kiện gửi review." },
  { id: "r3v2", reviewId: "review-003", version: "v2", fileName: "use-case-diagram-v2.pdf", submittedAt: "12/09/2026 · 14:05", submitter: "Nguyễn Minh Anh", documentStatus: "resubmitted", ai: { errors: 1, warnings: 1, suggestions: 1 }, supervisorStatus: "needsRevision", feedbackCount: 1, summary: "Login vẫn chưa liên kết với Supervisor." },
  { id: "r3v3", reviewId: "review-003", version: "v3", fileName: "use-case-diagram-v3.pdf", submittedAt: "14/09/2026 · 10:32", submitter: "Nguyễn Minh Anh", documentStatus: "resubmitted", ai: { errors: 0, warnings: 0, suggestions: 1 }, supervisorStatus: "approved", feedbackCount: 1, summary: "Phê duyệt bởi Nguyễn Văn An lúc 11:20.", isCurrent: true },
]

export const versionChanges = [
  { title: "Association của Login", before: "Login chỉ liên kết với Student.", after: "Bổ sung Association Supervisor — Login." },
  { title: "Điều kiện gửi review", after: "Bổ sung Business Rule: chỉ cho phép Request Review sau khi Upload Document thành công." },
]

export const auditEvents: AuditEvent[] = [
  { id: "e1", reviewId: "review-001", time: "30/09/2026 · 10:05", title: "Nguyễn Minh Anh đã upload v1.", actor: "Sinh viên", tone: "neutral" },
  { id: "e2", reviewId: "review-001", time: "30/09/2026 · 15:30", title: "Giảng viên yêu cầu chỉnh sửa v1.", actor: "Nguyễn Văn An", quote: "“Bổ sung Actor Student và sửa relationship Submit Document.”", tone: "rust" },
  { id: "e3", reviewId: "review-001", time: "03/10/2026 · 08:15", title: "Nguyễn Minh Anh đã upload v2.", actor: "Sinh viên", tone: "neutral" },
  { id: "e4", reviewId: "review-001", time: "03/10/2026 · 08:20", title: "Sinh viên gửi yêu cầu review.", actor: "Nguyễn Minh Anh", tone: "neutral" },
  { id: "e5", reviewId: "review-001", time: "03/10/2026 · 08:21", title: "AI Review bắt đầu.", actor: "Hệ thống", tone: "olive" },
  { id: "e6", reviewId: "review-001", time: "03/10/2026 · 08:22", title: "AI Review hoàn tất.", actor: "Hệ thống · 2 lỗi · 3 cảnh báo · 4 gợi ý", tone: "olive" },
  { id: "e7", reviewId: "review-003", time: "14/09/2026 · 10:32", title: "Nguyễn Minh Anh đã upload v3.", actor: "Sinh viên", tone: "neutral" },
  { id: "e8", reviewId: "review-003", time: "14/09/2026 · 10:32", title: "Sinh viên gửi yêu cầu review.", actor: "Nguyễn Minh Anh", tone: "neutral" },
  { id: "e9", reviewId: "review-003", time: "14/09/2026 · 10:34", title: "AI Review hoàn tất.", actor: "Hệ thống · 1 gợi ý", tone: "olive" },
  { id: "e10", reviewId: "review-003", time: "14/09/2026 · 11:05", title: "Nguyễn Văn An bắt đầu review.", actor: "Giảng viên", tone: "brand" },
  { id: "e11", reviewId: "review-003", time: "14/09/2026 · 11:12", title: "Giảng viên thêm feedback.", actor: "Nguyễn Văn An", quote: "“Association giữa Supervisor và Login đã chính xác.”", tone: "amber" },
  { id: "e12", reviewId: "review-003", time: "14/09/2026 · 11:20", title: "Giảng viên phê duyệt v3.", actor: "Nguyễn Văn An · Activity Diagram được mở gửi review", tone: "brand" },
]

export const attentionItems: AttentionItem[] = [
  { label: "Quá hạn", tone: "danger", title: "Group 07 · Event Management System", detail: "Quá hạn nộp lại Activity Diagram 2 ngày", projectId: "event-management-system" },
  { label: "Chờ quá lâu", tone: "rust", title: "Group 08 · Campus Service Portal", detail: "Sequence Diagram v2 chờ review 4 ngày", projectId: "campus-service-portal" },
  { label: "Vừa nộp lại", tone: "olive", title: "Group 01 · Smart Campus Management", detail: "Sequence Diagram v2 đã nộp lại sau feedback", projectId: "smart-campus-management" },
  { label: "Chỉnh sửa nhiều lần", tone: "rust", title: "Group 03 · Student Services Portal", detail: "Activity Diagram đã yêu cầu chỉnh sửa 2 lần", projectId: "student-services-portal" },
  { label: "Sắp đến hạn", tone: "amber", title: "Group 05 · Dormitory Management Platform", detail: "Deadline SRS 08/10 · còn 4 ngày", projectId: "dormitory-management-platform" },
]

export type NotificationKind = "file-up" | "badge-check" | "clock" | "bell"

export const notifications: (Notification & { kind: NotificationKind; section: string })[] = [
  { id: "n1", title: "Group 04 vừa gửi yêu cầu review cho Use Case Diagram v2", meta: "SE1701 · Smart Attendance System · 2 giờ trước", unread: true, link: "/reviews/review-001", kind: "file-up", section: "Hôm nay · 04/10/2026" },
  { id: "n2", title: "AI Review đã hoàn tất cho Sequence Diagram", meta: "SE1701 · Group 01 · Smart Campus Management · v2 · 2 giờ trước", unread: true, link: "/reviews/review-008", kind: "badge-check", section: "Hôm nay · 04/10/2026" },
  { id: "n3", title: "Group 02 vừa nộp lại SRS v3", meta: "SE1702 · Hospital Management System · Nộp lại lần 2 · 3 giờ trước", unread: true, link: "/reviews/review-004", kind: "file-up", section: "Hôm nay · 04/10/2026" },
  { id: "n4", title: "Project của Group 07 sắp đến deadline", meta: "SWP391-02 · Event Management System · 08/10/2026 · Còn 4 ngày", unread: false, link: "/reviews/review-006", kind: "clock", section: "Hôm nay · 04/10/2026" },
  { id: "n5", title: "State Diagram của Group 03 đã được cập nhật lên v2", meta: "SE1702 · Hospital Management System · 16:40", unread: false, link: "/reviews/review-006", kind: "file-up", section: "Hôm qua · 03/10/2026" },
  { id: "n6", title: "Bạn đã phê duyệt Activity Diagram của Group 02", meta: "SWP391-01 · AI Learning Assistant · v2 · 11:20", unread: false, link: "/reviews/review-008", kind: "badge-check", section: "Hôm qua · 03/10/2026" },
]
