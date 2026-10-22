import { groupMemberLimit } from "@/data/selfServicePolicy"
import { enrolled, addMemberBySupervisor } from "@/data/selfService"
import { activityText } from "@/components/ui/contentText"
import { FolderPlus, Pencil, Trash2, UserMinus, UserPlus } from "lucide-react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import GroupFormModal from "@/components/project/GroupFormModal"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import Avatar from "@/components/ui/Avatar"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmModal from "@/components/ui/ConfirmModal"
import EmptyState from "@/components/ui/EmptyState"
import { Field, Select } from "@/components/ui/Form"
import Modal from "@/components/ui/Modal"
import MoreMenu from "@/components/ui/MoreMenu"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import ProgressBar from "@/components/ui/ProgressBar"
import SectionHeader from "@/components/ui/SectionHeader"
import { toast } from "@/components/ui/Toast"
import { groupHealthMeta } from "@/data/mockData"
import { updateManagement, useManagement } from "@/data/managementStore"
import { classOfProject } from "@/lib/config"
import type { Student } from "@/types"

export default function GroupDetailPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { groups, students, projects, classes } = useManagement()
  const [renaming, setRenaming] = useState(false)
  const [adding, setAdding] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)
  const [removing, setRemoving] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [pick, setPick] = useState("")
  const group = groups.find((g) => g.id === groupId)
  if (!group) return <EmptyState title="Không tìm thấy nhóm" />

  const classRoom = classes.find((c) => c.id === group.classId)
  const members = group.memberIds.map((id) => students.find((s) => s.id === id)).filter(Boolean) as Student[]
  const limit = groupMemberLimit(classRoom)
  const available = students.filter(s => enrolled(s, group.classId) && !groups.some(g => g.classId === group.classId && g.memberIds.includes(s.id)))
  const project = projects.find((p) => p.id === group.projectId)
  const unassigned = projects.filter((p) => classOfProject(p, groups, classes)?.id === group.classId && !groups.some((g) => g.projectId === p.id))
  // A group whose project has history cannot be deleted.
  const canDelete = !project?.hasHistory && members.length === 0

  const syncMembers = (memberIds: string[]) =>
    updateManagement((s) => ({
      groups: s.groups.map((g) => (g.id === group.id ? { ...g, memberIds } : g)),
      students: s.students.map((st) => (st.classId !== group.classId ? st : memberIds.includes(st.id) ? { ...st, groupId: group.id } : st.groupId === group.id ? { ...st, groupId: undefined } : st)),
      projects: s.projects.map((p) =>
        p.groupId === group.id ? { ...p, members: memberIds.map((id, i) => { const st = s.students.find((x) => x.id === id)!; return { initials: st.initials, name: st.name, role: i === 0 ? "Trưởng nhóm" : "Thành viên" } }) } : p,
      ),
    }))

  return (
    <>
      <BackLink label={classRoom?.code ?? "Nhóm"} fallback={`/classes/${group.classId}`} />
      <PageHeading
        eyebrow={`QUẢN LÝ NHÓM · ${classRoom?.code}`}
        title={group.name}
        aside={
          <MoreMenu
            items={[
              { label: "Đổi tên nhóm", icon: <Pencil size={16} strokeWidth={1.75} />, onSelect: () => setRenaming(true) },
              ...(canDelete ? [{ label: "Xóa nhóm", danger: true, icon: <Trash2 size={16} strokeWidth={1.75} />, onSelect: () => setDeleting(true) }] : []),
            ]}
          />
        }
      />
      <Card>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-muted">{members.length}/{limit} thành viên · Hoạt động {activityText(group.lastActivity)}</span>
          <Badge tone={groupHealthMeta[group.health].tone}>{groupHealthMeta[group.health].label}</Badge>
        </div>
        <ProgressBar value={group.progress} label="Tiến độ nhóm (ghi nhận)" />
        <p className="text-[12px] text-muted">Chờ đánh giá: <span className="font-semibold text-ink">{group.pendingReviews} tài liệu</span></p>
      </Card>

      {members.length > limit && <p role="status" className="text-[14px] text-amber">Nhóm có {members.length}/{limit} thành viên. Giữ nguyên thành viên; không thể thêm người mới.</p>}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Dự án" />
        {project ? (
          <Card tinted>
            <p className="text-[16px] font-semibold text-ink">{project.name}</p>
            <p className="text-[12px] leading-[1.45] text-muted">{project.description}</p>
            <Button variant="secondary" to={`/projects/${project.id}`}>Xem dự án</Button>
          </Card>
        ) : (
          <Card>
            <p className="text-[13px] text-muted">Nhóm chưa được gán dự án.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setAssigning(true)} disabled={!unassigned.length} className="disabled:opacity-50">Gán dự án</Button>
              <Button icon={<FolderPlus size={16} strokeWidth={1.75} />} onClick={() => setCreatingProject(true)}>Tạo dự án</Button>
            </div>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Thành viên" meta={`${members.length}/${limit} thành viên`} />
        {members.length ? (
          <Card className="gap-0 py-1">
            <ul className="divide-y divide-line">
              {members.map((m, i) => (
                <li key={m.id} className="flex items-center gap-3 py-2.5">
                  <Avatar initials={m.initials} />
                  <div className="min-w-0 flex-1 leading-[1.45]">
                    <p className="text-[14px] font-semibold text-ink">{m.name}</p>
                    <p className="text-[12px] text-muted">{m.studentCode}{i === 0 ? " · Trưởng nhóm" : ""}</p>
                  </div>
                  <button type="button" onClick={() => setRemoving(m)} className="-my-2 inline-flex items-center gap-1 px-2 py-2 text-[12px] font-semibold text-muted hover:text-danger">
                    <UserMinus size={14} strokeWidth={1.75} />Xóa khỏi nhóm
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState title="Nhóm chưa có thành viên" />
        )}
        <Button variant="secondary" icon={<UserPlus size={16} strokeWidth={1.75} />} onClick={() => setAdding(true)}>Thêm thành viên</Button>
        <Notice>Xóa sinh viên khỏi nhóm không xóa tài liệu hay lịch sử đánh giá mà sinh viên đó đã nộp.</Notice>
      </section>

      <GroupFormModal open={renaming} classId={group.classId} group={group} onClose={() => setRenaming(false)} />
      <ProjectFormModal open={creatingProject} defaultGroupId={group.id} onClose={() => setCreatingProject(false)} />

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Thêm thành viên"
        description={`${group.memberIds.length}/${limit} thành viên · Sinh viên ${classRoom?.code} chưa có nhóm`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)}>Hủy</Button>
            <Button
              disabled={!available.length || group.memberIds.length >= limit}
              className="disabled:opacity-50"
              onClick={() => {
                const st = available.find((s) => s.name === pick) ?? available[0]
                if (!st || group.memberIds.length >= limit) { toast("Nhóm đã đạt giới hạn thành viên của lớp."); return }
                try {
                  addMemberBySupervisor(group.id, st.id)
                  toast(`Đã thêm ${st.name} vào ${group.name}`)
                  setAdding(false)
                } catch (error) { toast((error as Error).message) }
              }}
            >
              Thêm vào nhóm
            </Button>
          </>
        }
      >
        {group.memberIds.length >= limit && <Notice>Nhóm đã đạt giới hạn thành viên của lớp.</Notice>}
        {available.length ? (
          <Field label="Sinh viên"><Select options={available.map((s) => s.name)} value={pick || available[0].name} onChange={(e) => setPick(e.target.value)} /></Field>
        ) : (
          <EmptyState title="Không còn sinh viên chưa có nhóm" description="Nhập thêm sinh viên vào lớp hoặc xóa sinh viên khỏi nhóm khác." />
        )}
      </Modal>

      <Modal
        open={assigning}
        onClose={() => setAssigning(false)}
        title="Gán dự án"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssigning(false)}>Hủy</Button>
            <Button
              onClick={() => {
                const p = unassigned.find((x) => x.name === pick) ?? unassigned[0]
                updateManagement((s) => ({ groups: s.groups.map((g) => (g.id === group.id ? { ...g, projectId: p.id } : g)), projects: s.projects.map((x) => (x.id === p.id ? { ...x, groupId: group.id } : x)) }))
                toast(`Đã gán ${p.name}`)
                setAssigning(false)
              }}
            >
              Gán dự án
            </Button>
          </>
        }
      >
        {unassigned.length > 0 && <Field label="Dự án chưa có nhóm"><Select options={unassigned.map((p) => p.name)} onChange={(e) => setPick(e.target.value)} /></Field>}
      </Modal>

      <ConfirmModal
        open={Boolean(removing)}
        title="Xóa khỏi nhóm"
        description={removing ? `${removing.name} sẽ được chuyển về danh sách chưa có nhóm.` : ""}
        confirmLabel="Xóa khỏi nhóm"
        onConfirm={() => {
          if (!removing) return
          syncMembers(group.memberIds.filter((id) => id !== removing.id))
          toast(`Đã xóa ${removing.name} khỏi ${group.name}`)
        }}
        onClose={() => setRemoving(null)}
      >
        <Notice>Tài liệu, phiên bản và lịch sử đánh giá sinh viên đã tham gia vẫn được giữ nguyên.</Notice>
      </ConfirmModal>
      <ConfirmModal
        open={deleting}
        danger
        title="Xóa nhóm"
        description="Nhóm chưa có thành viên và chưa có lịch sử đánh giá."
        confirmLabel="Xóa nhóm"
        onConfirm={() => {
          updateManagement((s) => ({ groups: s.groups.filter((g) => g.id !== group.id) }))
          toast(`Đã xóa ${group.name}`)
          navigate(`/classes/${group.classId}`)
        }}
        onClose={() => setDeleting(false)}
      />
    </>
  )
}
