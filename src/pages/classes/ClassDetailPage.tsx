import { Archive, Pencil, Plus, QrCode, UserCheck, UserPlus, UserX } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import GroupFormModal from "@/components/project/GroupFormModal"
import AddStudentsModal from "@/components/project/AddStudentsModal"
import ClassFormModal from "@/components/project/ClassFormModal"
import MoreMenu from "@/components/ui/MoreMenu"
import { toast } from "@/components/ui/Toast"
import { classContext, courseLabel } from "@/lib/academic"
import { fmtDate, fmtRelative, parseISO, scheduleLabel, sessionMeta } from "@/lib/time"
import ProjectCard from "@/components/project/ProjectCard"
import ReviewRequestCard from "@/components/review/ReviewRequestCard"
import Avatar from "@/components/ui/Avatar"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import ProgressBar from "@/components/ui/ProgressBar"
import SectionHeader from "@/components/ui/SectionHeader"
import SegmentedTabs from "@/components/ui/SegmentedTabs"
import StatCard from "@/components/ui/StatCard"
import { groupHealthMeta } from "@/data/mockData"
import { updateManagement, useManagement } from "@/data/managementStore"
import { useReviewStore } from "@/data/reviewStore"
import { isCompleted } from "@/data/selectors"

const TABS = ["Tổng quan", "Nhóm", "Sinh viên", "Project", "Yêu cầu review"]

export default function ClassDetailPage() {
  const { classId } = useParams()
  const [tab, setTab] = useState(TABS[1])
  const [addingGroup, setAddingGroup] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)
  const { classes, semesters, courses, joinRequests, groups: allGroups, students: allStudents, projects: allProjects } = useManagement()
  const { requests } = useReviewStore()
  const classRoom = classes.find((c) => c.id === classId)

  if (!classRoom) return <EmptyState title="Không tìm thấy lớp" description={`Mã lớp “${classId}” không tồn tại.`} />

  const groups = allGroups.filter((g) => g.classId === classRoom.id)
  const students = allStudents.filter((s) => s.classId === classRoom.id)
  const projects = allProjects.filter((p) => groups.some((g) => g.id === p.groupId))
  const pendingJoins = joinRequests.filter((j) => j.classId === classRoom.id)
  const course = courses.find((c) => c.id === classRoom.courseId)
  const resolveJoin = (id: string, accept: boolean) => {
    const j = joinRequests.find((x) => x.id === id)!
    updateManagement((s) => ({
      joinRequests: s.joinRequests.filter((x) => x.id !== id),
      ...(accept && {
        students: [...s.students, { id: `join-${id}`, initials: j.name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase(), name: j.name, studentCode: j.studentCode, email: j.email, classId: j.classId }],
        classes: s.classes.map((c) => (c.id === j.classId ? { ...c, studentCount: c.studentCount + 1 } : c)),
      }),
    }))
    toast(accept ? `Đã chấp nhận ${j.name}` : `Đã từ chối yêu cầu của ${j.name}`)
  }
  const reviews = requests.filter((r) => r.classCode === classRoom.code && !isCompleted(r.supervisorStatus))

  return (
    <>
      <BackLink label="Lớp của tôi" fallback="/classes" />
      <PageHeading
        eyebrow={classContext(classRoom, semesters, courses).toUpperCase()}
        title={classRoom.code}
        description={`${courseLabel(course)} · ${scheduleLabel(classRoom.schedule)} · Buổi ${sessionMeta[classRoom.session].label.toLowerCase()}`}
        aside={<Badge tone={classRoom.state === "archived" ? "neutral" : "brand"}>{classRoom.state === "archived" ? "Đã lưu trữ" : "Đang giảng dạy"}</Badge>}
      />
      <div className="flex gap-2">
        <Button className="flex-1" icon={<UserPlus size={16} strokeWidth={1.75} />} onClick={() => setAdding(true)}>Thêm sinh viên</Button>
        <Button variant="secondary" className="w-auto px-4" icon={<Plus size={16} strokeWidth={1.75} />} onClick={() => setAddingGroup(true)}>Thêm nhóm</Button>
        <MoreMenu
          items={[
            { label: "Chỉnh sửa lớp", icon: <Pencil size={16} strokeWidth={1.75} />, onSelect: () => setEditing(true) },
            { label: "Mã QR tham gia", icon: <QrCode size={16} strokeWidth={1.75} />, onSelect: () => setAdding(true) },
            { label: "Lưu trữ lớp", icon: <Archive size={16} strokeWidth={1.75} />, onSelect: () => { updateManagement((s) => ({ classes: s.classes.map((c) => (c.id === classRoom.id ? { ...c, state: "archived" } : c)) })); toast(`Đã lưu trữ lớp ${classRoom.code}`) } },
          ]}
        />
      </div>
      {pendingJoins.length > 0 && tab !== "Sinh viên" && (
        <button type="button" onClick={() => setTab("Sinh viên")} className="flex items-center gap-2 rounded-[10px] border border-amber/30 bg-amber-soft px-3 py-2.5 text-left text-[13px] text-amber">
          <UserCheck size={16} strokeWidth={1.75} />
          <span className="flex-1"><span className="font-semibold">{pendingJoins.length} yêu cầu tham gia</span> đang chờ bạn duyệt</span>
          <span className="text-[12px] font-semibold">Xem</span>
        </button>
      )}
      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "Tổng quan" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={students.length || classRoom.studentCount} label="Sinh viên" />
            <StatCard value={groups.length} label="Nhóm" />
            <StatCard value={projects.length} label="Project" />
            <StatCard value={reviews.length} label="Chờ / đang review" />
          </div>
          <section className="flex flex-col gap-3">
            <SectionHeader title="Tình trạng nhóm" />
            <Card className="gap-0 py-1">
              <ul>
                {groups.map((g) => (
                  <li key={g.id} className="border-b border-line last:border-b-0">
                    <Link to={`/groups/${g.id}`} className="flex items-center gap-3 py-3">
                      <span className="w-[72px] shrink-0 text-[13px] font-semibold text-ink">{g.name}</span>
                      <div className="min-w-0 flex-1"><ProgressBar value={g.progress} /></div>
                      <Badge tone={groupHealthMeta[g.health].tone}>{groupHealthMeta[g.health].label}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </>
      )}

      {tab === "Nhóm" && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Nhóm sinh viên" meta={`${groups.length} nhóm`} />
          {groups.length ? groups.map((g) => <ProjectCard key={g.id} group={g} />) : <EmptyState title="Chưa có nhóm nào" description="Tạo nhóm để xếp sinh viên và gán project." />}
        </section>
      )}

      {tab === "Sinh viên" && pendingJoins.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Yêu cầu tham gia" meta={`${pendingJoins.length} chờ duyệt`} />
          <Card className="gap-0 py-1">
            <ul className="divide-y divide-line">
              {pendingJoins.map((j) => (
                <li key={j.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1 leading-[1.45]">
                    <p className="text-[14px] font-semibold text-ink">{j.name}</p>
                    <p className="text-[12px] text-muted">{j.studentCode} · {j.email}</p>
                    <p className="text-[11px] text-muted">Quét QR · {fmtRelative(j.requestedAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => resolveJoin(j.id, false)} className="inline-flex h-9 items-center gap-1 rounded-[8px] border border-line px-3 text-[12px] font-semibold text-muted"><UserX size={14} strokeWidth={1.75} />Từ chối</button>
                    <button type="button" onClick={() => resolveJoin(j.id, true)} className="inline-flex h-9 items-center gap-1 rounded-[8px] border border-brand bg-brand px-3 text-[12px] font-semibold text-white"><UserCheck size={14} strokeWidth={1.75} />Chấp nhận</button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {tab === "Sinh viên" && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Sinh viên" meta={`${students.length} sinh viên`} />
          {students.length ? (
            <Card className="gap-0 py-1">
              <ul className="divide-y divide-line">
                {students.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2.5">
                    <Avatar initials={s.initials} />
                    <div className="min-w-0 flex-1 leading-[1.45]">
                      <p className="text-[14px] font-semibold text-ink">{s.name}</p>
                      <p className="text-[12px] text-muted">{s.studentCode}</p>
                    </div>
                    {s.groupId ? <Badge>{allGroups.find((g) => g.id === s.groupId)?.name}</Badge> : <Badge tone="amber">Chưa có nhóm</Badge>}
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <EmptyState title="Chưa có sinh viên" description="Import danh sách sinh viên để bắt đầu." />
          )}
        </section>
      )}

      {tab === "Project" && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Project" meta={`${projects.length} project`} />
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="hover:border-brand/40">
                <div className="flex justify-between gap-2 text-[12px] text-muted"><span>{groups.find((g) => g.id === p.groupId)?.name ?? "—"}</span><span>Deadline {fmtDate(parseISO(p.deadline))}</span></div>
                <p className="text-[15px] font-semibold text-ink">{p.name}</p>
                <ProgressBar value={p.progress} />
              </Card>
            </Link>
          ))}
          {!projects.length && <EmptyState title="Chưa có project" />}
        </section>
      )}

      {tab === "Yêu cầu review" && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Yêu cầu review đang mở" meta={`${reviews.length} yêu cầu`} linkTo="/reviews" />
          {reviews.length ? reviews.map((r) => <ReviewRequestCard key={r.id} review={r} />) : <EmptyState title="Không có yêu cầu đang mở" />}
        </section>
      )}

      <GroupFormModal open={addingGroup} classId={classRoom.id} onClose={() => setAddingGroup(false)} />
      <AddStudentsModal open={adding} classRoom={classRoom} onClose={() => setAdding(false)} />
      <ClassFormModal open={editing} classRoom={classRoom} onClose={() => setEditing(false)} />
    </>
  )
}
