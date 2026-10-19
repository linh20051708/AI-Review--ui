import type { State } from "@/data/managementStore"

/** Additive migration: existing records and submissions are never replaced. */
export function seedSelfService(s: State): State {
  if (s.selfServiceSeedVersion) return s
  const base = s.classes.find((c) => c.id === "demo-ready-class")
  if (!base) return s
  const cls = {
    ...structuredClone(base),
    id: "self-service-class",
    code: "SELF323",
    joinCode: "SELF323",
    requireApproval: false,
    groupCount: 1,
    studentCount: 1,
    projectCount: 0,
    pendingReviews: 0,
  }
  const append = <T extends { id: string }>(saved: T[], added: T[]) => [
    ...saved,
    ...added.filter((a) => !saved.some((x) => x.id === a.id)),
  ]
  return {
    ...s,
    selfServiceSeedVersion: 1,
    registrations: s.registrations ?? [],
    classes: append(s.classes, [cls]),
    students: append(s.students, [
      {
        id: "self-create",
        name: "Lê Mai Linh",
        initials: "ML",
        studentCode: "SELF01",
        email: "create@student.demo",
        classId: "",
      },
      {
        id: "self-join",
        name: "Phạm Tuấn Minh",
        initials: "TM",
        studentCode: "SELF02",
        email: "join@student.demo",
        classId: "",
      },
      {
        id: "self-leader",
        name: "Đỗ Hải An",
        initials: "HA",
        studentCode: "SELF03",
        email: "leader@student.demo",
        classId: cls.id,
        groupId: "self-open-group",
      },
    ]),
    groups: append(s.groups, [
      {
        id: "self-open-group",
        classId: cls.id,
        name: "Nhóm mở SELF323",
        leaderId: "self-leader",
        memberIds: ["self-leader"],
        health: "onTrack",
        progress: 0,
        pendingReviews: 0,
        lastActivity: "Chờ thành viên",
      },
    ]),
  }
}
