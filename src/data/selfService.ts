import { currentRole, getSession } from "@/app/auth"
import { demoStudentId } from "@/data/mockData"
import {
  getManagementState,
  updateManagement,
  type State,
} from "@/data/managementStore"
import type { Student, StudentGroup } from "@/types"
import { groupMemberLimit, groupNameExists } from "@/data/selfServicePolicy"

export const enrolled = (s: Student, classId: string) =>
  s.classId === classId || !!s.enrolledClassIds?.includes(classId)
export const leaderOf = (g: StudentGroup) => g.leaderId ?? g.memberIds[0]
const id = () => crypto.randomUUID()
function actor() {
  if (currentRole() !== "student" || !getSession())
    throw Error("Chỉ Student được thực hiện thao tác này.")
  const student = getManagementState().students.find(
    (s) => s.id === (getSession()?.studentId ?? demoStudentId),
  )
  if (!student) throw Error("Không tìm thấy sinh viên.")
  return student
}
function activeClass(s: State, classId: string) {
  const cls = s.classes.find((c) => c.id === classId && c.state === "active")
  if (!cls || s.semesters.find((x) => x.id === cls.semesterId)?.archived)
    throw Error("Lớp không còn nhận đăng ký.")
  return cls
}
function freeMember(s: State, student: Student, classId: string) {
  activeClass(s, classId)
  if (!enrolled(student, classId)) throw Error("Bạn phải tham gia lớp trước.")
  if (
    s.groups.some(
      (g) => g.classId === classId && g.memberIds.includes(student.id),
    )
  )
    throw Error("Bạn đã có nhóm trong lớp này.")
}
function ownedGroup(groupId: string) {
  const student = actor(),
    s = getManagementState()
  const group = s.groups.find((g) => g.id === groupId)
  if (
    !group ||
    leaderOf(group) !== student.id ||
    !group.memberIds.includes(student.id)
  )
    throw Error("Chỉ trưởng nhóm được thực hiện thao tác này.")
  activeClass(s, group.classId)
  return { student, s, group }
}
const members = (s: State, g: StudentGroup) =>
  g.memberIds.map((memberId) => {
    const st = s.students.find((x) => x.id === memberId)!
    return {
      initials: st.initials,
      name: st.name,
      role: memberId === leaderOf(g) ? "Trưởng nhóm" : "Thành viên",
    }
  })
export function joinClass(code: string) {
  const student = actor(),
    s = getManagementState()
  const cls = s.classes.find(
    (c) => c.joinCode.toLowerCase() === code.trim().toLowerCase(),
  )
  if (!cls) throw Error("Mã lớp không hợp lệ.")
  activeClass(s, cls.id)
  if (enrolled(student, cls.id)) throw Error("Bạn đã tham gia lớp này.")
  const count = Math.max(cls.studentCount, s.students.filter(st => enrolled(st, cls.id)).length)
  if (count >= cls.capacity) throw Error("Lớp đã đủ sinh viên.")
  updateManagement((s) => ({
      students: s.students.map((x) =>
        x.id === student.id
          ? {
              ...x,
              classId: x.classId || cls.id,
              enrolledClassIds: [
                ...new Set([...(x.enrolledClassIds ?? []), cls.id]),
              ],
            }
          : x,
      ),
      classes: s.classes.map((c) =>
        c.id === cls.id ? { ...c, studentCount: count + 1 } : c,
      ),
    }))
  return cls
}
export function createGroup(classId: string, name: string) {
  const student = actor(),
    s = getManagementState()
  freeMember(s, student, classId)
  if (!name.trim()) throw Error("Nhập tên nhóm.")
  if (groupNameExists(s.groups, classId, name))
    throw Error("Tên nhóm đã tồn tại.")
  const group: StudentGroup = {
    id: id(),
    classId,
    name: name.trim(),
    leaderId: student.id,
    memberIds: [student.id],
    health: "onTrack",
    progress: 0,
    pendingReviews: 0,
    lastActivity: new Date().toISOString(),
  }
  updateManagement((s) => ({
    groups: [...s.groups, group],
    students: s.students.map((x) =>
      x.id === student.id && x.classId === classId
        ? { ...x, groupId: group.id }
        : x,
    ),
    classes: s.classes.map((c) =>
      c.id === classId ? { ...c, groupCount: c.groupCount + 1 } : c,
    ),
  }))
  return group
}
function appendGroupMember(s: State, group: StudentGroup, candidate: Student) {
  freeMember(s, candidate, group.classId)
  if (group.memberIds.length >= groupMemberLimit(s.classes.find(c => c.id === group.classId))) throw Error("Nhóm đã đạt giới hạn thành viên của lớp.")
  const next = { ...group, memberIds: [...group.memberIds, candidate.id] }
  updateManagement(state => ({
    groups: state.groups.map(g => g.id === group.id ? next : g),
    students: state.students.map(st => st.id === candidate.id && st.classId === group.classId ? { ...st, groupId: group.id } : st),
    projects: state.projects.map(p => p.groupId === group.id && p.state === "active" ? { ...p, members: members(state, next) } : p),
  }))
}
export function joinGroup(groupId: string) {
  const student = actor(), s = getManagementState()
  const group = s.groups.find(g => g.id === groupId)
  if (!group) throw Error("Không tìm thấy nhóm.")
  appendGroupMember(s, group, student)
}
export function addMember(groupId: string, memberId: string) {
  const { s, group } = ownedGroup(groupId)
  const candidate = s.students.find(st => st.id === memberId)
  if (!candidate) throw Error("Không tìm thấy sinh viên.")
  appendGroupMember(s, group, candidate)
}
export function addMemberBySupervisor(groupId: string, memberId: string) {
  if (!getSession() || currentRole() !== "supervisor") throw Error("Chỉ Supervisor được thực hiện thao tác này.")
  const s = getManagementState(), group = s.groups.find(g => g.id === groupId), candidate = s.students.find(st => st.id === memberId)
  if (!group || !candidate) throw Error("Không tìm thấy nhóm hoặc sinh viên.")
  appendGroupMember(s, group, candidate)
}
export function removeMember(groupId: string, memberId: string) {
  const { s, group } = ownedGroup(groupId)
  if (memberId === leaderOf(group)) throw Error("Không thể xóa trưởng nhóm.")
  if (!group.memberIds.includes(memberId))
    throw Error("Sinh viên không thuộc nhóm.")
  if (
    s.projects.some(
      (p) => p.groupId === groupId && (p.hasHistory || p.state === "active"),
    ) ||
    s.registrations?.some(
      (r) =>
        r.groupId === groupId && ["pending", "approved"].includes(r.status),
    )
  )
    throw Error(
      "Không xóa thành viên khi project đang chờ duyệt/hoạt động hoặc có lịch sử; liên hệ Supervisor.",
    )
  const next = {
    ...group,
    memberIds: group.memberIds.filter((x) => x !== memberId),
  }
  updateManagement((s) => ({
    groups: s.groups.map((g) => (g.id === groupId ? next : g)),
    students: s.students.map((st) =>
      st.id === memberId && st.groupId === groupId
        ? { ...st, groupId: undefined }
        : st,
    ),
  }))
}
export function registerProject(
  groupId: string,
  name: string,
  description: string,
) {
  const { s, group, student } = ownedGroup(groupId)
  if (!name.trim() || !description.trim())
    throw Error("Nhập tên và mô tả project.")
  if (s.projects.some((p) => p.groupId === groupId && p.state === "active"))
    throw Error("Nhóm đã có project hoạt động.")
  const existing = s.registrations?.find(
    (r) =>
      r.groupId === groupId &&
      ["pending", "changesRequested"].includes(r.status),
  )
  if (existing && existing.status !== "changesRequested")
    throw Error("Nhóm đã có đăng ký project đang xử lý.")
  const next = {
    id: existing?.id ?? id(),
    groupId,
    submittedBy: student.id,
    name: name.trim(),
    description: description.trim(),
    status: "pending" as const,
    submittedAt: new Date().toISOString(),
    decisions: existing?.decisions ?? [],
  }
  updateManagement((s) => ({
    registrations: [
      ...(s.registrations ?? []).filter((r) => r.id !== next.id),
      next,
    ],
  }))
}
export function decideRegistration(
  registrationId: string,
  status: "approved" | "changesRequested" | "rejected",
  feedback: string,
) {
  if (!getSession() || currentRole() !== "supervisor")
    throw Error("Chỉ Supervisor được duyệt project.")
  const s = getManagementState(),
    r = s.registrations?.find((r) => r.id === registrationId)
  if (!r || r.status !== "pending") throw Error("Yêu cầu không còn chờ duyệt.")
  if (status !== "approved" && !feedback.trim())
    throw Error("Nhập lý do hoặc nội dung cần sửa.")
  const group = s.groups.find((g) => g.id === r.groupId)
  if (!group || !group.memberIds.includes(r.submittedBy))
    throw Error("Nhóm/người đăng ký không còn hợp lệ.")
  const cls = activeClass(s, group.classId),
    offering = s.offerings.find((o) => o.id === cls.offeringId)
  if (
    !offering ||
    !offering.labs.length ||
    !s.ruleSets.some(
      (x) =>
        x.id === (cls.ruleSetOverride ?? offering.ruleSetId) &&
        x.status === "active",
    )
  )
    throw Error(
      "Cần cấu hình Lab Structure và Rule Set Active trước khi duyệt.",
    )
  if (
    status === "approved" &&
    s.projects.some((p) => p.groupId === group.id && p.state === "active")
  )
    throw Error("Nhóm đã có project hoạt động.")
  const projectId = status === "approved" ? id() : undefined
  updateManagement((s) => ({
    registrations: (s.registrations ?? []).map((x) =>
      x.id === r.id
        ? {
            ...x,
            status,
            feedback: feedback.trim(),
            projectId,
            decisions: [
              ...x.decisions,
              {
                status,
                feedback: feedback.trim(),
                at: new Date().toISOString(),
              },
            ],
          }
        : x,
    ),
    ...(projectId
      ? {
          projects: [
            ...s.projects,
            {
              id: projectId,
              registrationId: r.id,
              groupId: group.id,
              name: r.name,
              description: r.description,
              lecturer: cls.lecturer,
              startDate: cls.startDate,
              deadline: cls.deadline ?? offering.defaultDeadline,
              progress: 0,
              members: members(s, group),
              state: "active" as const,
              hasHistory: false,
            },
          ],
          groups: s.groups.map((g) =>
            g.id === group.id ? { ...g, projectId } : g,
          ),
          classes: s.classes.map((c) =>
            c.id === cls.id ? { ...c, projectCount: c.projectCount + 1 } : c,
          ),
        }
      : {}),
  }))
}
