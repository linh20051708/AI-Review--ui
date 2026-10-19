import type { State } from "@/data/managementStore"
import type { ClassRoom, Notification, StudentGroup } from "@/types"

export const DEFAULT_MAX_GROUP_MEMBERS = 5
export const groupNameExists = (groups: StudentGroup[], classId: string, name: string, exceptId?: string) =>
  groups.some(g => g.classId === classId && g.id !== exceptId && g.name.trim().toLowerCase() === name.trim().toLowerCase())
export const groupMemberLimit = (cls?: ClassRoom) => {
  const configured = cls?.maxGroupMembers
  return typeof configured === "number" && Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_MAX_GROUP_MEMBERS
}

/** Retain obsolete requests as history, never replay them or require approval. */
export function directEnrollmentState(state: State): State {
  const legacy = [...(state.legacyJoinRequests ?? [])]
  for (const request of state.joinRequests ?? []) if (!legacy.some(r => r.id === request.id)) legacy.push(request)
  return { ...state, legacyJoinRequests: legacy, joinRequests: [], classes: state.classes.map(c => ({
    ...c, requireApproval: false, maxGroupMembers: groupMemberLimit(c),
  })) }
}

export const obsoleteJoinApproval = (n: Pick<Notification, "title">) =>
  /(?:yêu cầu|đề nghị) tham gia (?:lớp|nhóm)|join (?:class|group) request/i.test(n.title) ||
  (/tham gia|join/i.test(n.title) && /lớp|nhóm|class|group/i.test(n.title) && /chờ.*duyệt|chờ.*phê duyệt|yêu cầu.*duyệt|pending|awaiting approval/i.test(n.title))
