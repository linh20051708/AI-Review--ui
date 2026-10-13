import type { SchedulePattern, Session } from "@/lib/time"

export type Tone = "brand" | "olive" | "amber" | "rust" | "danger" | "neutral"

/**
 * The single Vietnamese status vocabulary. Entities expose three separate
 * tracks (document / AI review / supervisor review) that each use a subset.
 */
export type Status =
  | "draft"
  | "submitted"
  | "reviewRequested"
  | "aiReviewing"
  | "aiReviewed"
  | "waiting"
  | "inReview"
  | "needsRevision"
  | "resubmitted"
  | "approved"
  | "notAccepted"
  | "submissionLocked"
  | "notStarted"

export type DocumentStatus = Extract<Status, "draft" | "submitted" | "resubmitted" | "notStarted">
export type AIStatus = Extract<Status, "aiReviewing" | "aiReviewed"> | "notRun"
export type SupervisorStatus = Extract<Status, "waiting" | "inReview" | "needsRevision" | "approved" | "notAccepted">

export type GroupHealth =
  | "onTrack"
  | "attention"
  | "needsRevision"
  | "dueSoon"
  | "notSubmitted"
  | "overdue"
  | "waitingLong"

export type LifecycleState = "active" | "archived"

export interface RuleSet {
  id: string
  name: string
  description: string
  aiReview: "auto" | "manual"
  aiRequiredBeforeSupervisor: boolean
  supervisorApproval: boolean
  prerequisiteApproval: boolean
  allowedFormats: string[]
  maxFileSizeMB: number
  reviewSlaDays: number
  maxResubmissions?: number
}

export interface Semester {
  id: string
  name: string
  academicYear: string
  /** ISO dates */
  startDate: string
  endDate: string
  description?: string
  archived: boolean
}

/** Reusable master data only — no semester-specific structure. */
export interface Course {
  id: string
  code: string
  name: string
  description?: string
}

export type DeliverableType = "Document" | "Diagram" | "Report" | "Other"
export type ReviewRequirement = "required" | "optional" | "disabled"
export type AllowedFiles = "PDF" | "DOCX" | "Both"

export interface LabItem {
  id: string
  code: string
  title: string
  deliverableType: DeliverableType
  documentType: string
  required: boolean
  aiReview: ReviewRequirement
  supervisorReview: Exclude<ReviewRequirement, "disabled">
  allowedFiles: AllowedFiles
  /** ISO datetime, overrides the lab deadline. */
  deadline?: string
  /** Item ids (within the same structure) that must be approved first. */
  dependsOn: string[]
}

export interface Lab {
  id: string
  code: string
  title: string
  description?: string
  /** ISO datetime, overrides class/offering deadline. */
  deadline?: string
  items: LabItem[]
}

/** Semester + Course: owns the semester-specific structure. Copied, never shared, across semesters. */
export interface CourseOffering {
  id: string
  semesterId: string
  courseId: string
  teachingMethod: TeachingMethod
  ruleSetId: string
  /** ISO datetime */
  defaultDeadline: string
  labs: Lab[]
}

export interface LabTemplate {
  id: string
  name: string
  lab: Lab
  savedFrom: string
}

export interface ClassRoom {
  id: string
  code: string
  semesterId: string
  courseId: string
  offeringId: string
  /** Class-specific copy of the lab structure; undefined = inherit from offering. */
  labOverride?: Lab[]
  teachingMethodOverride?: TeachingMethod
  ruleSetOverride?: string
  /** ISO datetime; overrides the offering default deadline. */
  deadline?: string
  startDate: string
  endDate: string
  capacity: number
  schedule: SchedulePattern
  session: Session
  joinCode: string
  requireApproval: boolean
  /** ISO datetime */
  qrExpiresAt: string
  lecturer: string
  groupCount: number
  studentCount: number
  projectCount: number
  pendingReviews: number
  state: LifecycleState
}

export interface Student {
  id: string
  initials: string
  name: string
  studentCode: string
  email: string
  classId: string
  groupId?: string
}

export interface JoinRequest {
  id: string
  classId: string
  name: string
  studentCode: string
  email: string
  requestedAt: number
}

export const teachingMethods = ["Trực tiếp", "Trực tuyến", "Hybrid", "Project-based Learning", "Flipped Classroom", "Blended Learning", "Other"] as const
export type TeachingMethod = (typeof teachingMethods)[number]

export interface StudentMember {
  initials: string
  name: string
  role: string
}

export const deliverableTypes: DeliverableType[] = ["Document", "Diagram", "Report", "Other"]

export interface StudentGroup {
  id: string
  classId: string
  name: string
  projectId?: string
  health: GroupHealth
  memberIds: string[]
  progress: number
  pendingReviews: number
  lastActivity: string
}

export interface Project {
  id: string
  name: string
  description: string
  /** Single academic link: Group → Class → Course Offering → Semester/Course. */
  groupId: string
  lecturer: string
  /** Undefined = inherit from class. */
  teachingMethodOverride?: TeachingMethod
  /** ISO date / datetime */
  startDate: string
  deadline: string
  reviewCutoff?: string
  progress: number
  members: StudentMember[]
  state: LifecycleState
  /** Any submission or review history means the project can only be archived. */
  hasHistory: boolean
  nextStep?: string
}

export interface AICounts {
  errors: number
  warnings: number
  suggestions: number
}

/** Logical document (e.g. "Use Case Diagram"). Versions live separately. */
export interface ProjectDocument {
  id: string
  projectId: string
  title: string
  order: number
  labCode?: string
  labTitle?: string
  itemCode?: string
  required?: boolean
  latestVersion?: string
  versionCount: number
  documentStatus: DocumentStatus
  supervisorStatus?: SupervisorStatus
  ai?: AICounts
  submitter?: string
  updatedAt?: string
  dependsOn?: string
  /** True when dependency blocks sending a review request. */
  submissionLocked?: boolean
  reviewId?: string
  note?: string
}

export type FileType = "PDF" | "DOCX"

export interface ReviewRequest {
  id: string
  projectId: string
  semesterId: string
  courseId: string
  classId: string
  groupId: string
  classCode: string
  groupName: string
  projectName: string
  documentTitle: string
  version: string
  fileName: string
  fileType: FileType
  pageCount: number
  submitter: string
  submittedAt: string
  requestedAt: string
  /** Timestamp of the review request. */
  requestedTs: number
  documentStatus: Extract<DocumentStatus, "submitted" | "resubmitted">
  aiStatus: AIStatus
  ai: AICounts
  supervisorStatus: SupervisorStatus
  revisionRound?: number
  note?: string
}

export type AIFindingLevel = "error" | "warning" | "suggestion"

export interface AIFinding {
  id: string
  level: AIFindingLevel
  category: string
  message: string
  pageRef?: string
}

export interface AICheck {
  title: string
  result: string
  tone: Tone
  detail: string
}

export type FeedbackSeverity = "Minor" | "Major" | "Critical"

export interface ReviewFeedback {
  id: string
  reviewId: string
  version: string
  author: string
  createdAt: string
  severity: FeedbackSeverity
  category: string
  pageRef?: string
  message: string
  /** Part of a completed official review: read-only. */
  official: boolean
}

export interface DocumentVersion {
  id: string
  reviewId: string
  version: string
  fileName: string
  submittedAt: string
  submitter: string
  documentStatus: Extract<DocumentStatus, "submitted" | "resubmitted">
  ai: AICounts
  supervisorStatus: SupervisorStatus
  feedbackCount: number
  summary?: string
  isCurrent?: boolean
}

export interface AuditEvent {
  id: string
  reviewId: string
  time: string
  title: string
  actor: string
  quote?: string
  tone: Tone
}

export interface Notification {
  id: string
  title: string
  meta: string
  unread: boolean
  link?: string
}

export interface AttentionItem {
  label: string
  tone: Tone
  title: string
  detail: string
  projectId: string
}
