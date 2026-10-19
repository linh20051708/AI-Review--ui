import { groupMemberLimit } from "@/data/selfServicePolicy"
import type { ProjectRegistration } from "@/types"
import "@/styles/student-refinement.css"
import PhaseTwoTabs from "@/components/ui/PhaseTwoTabs"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { selectStudentClass } from "@/app/auth"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import { Field, TextInput, TextArea } from "@/components/ui/Form"
import { useManagement } from "@/data/managementStore"
import {
  createGroup,
  addMember,
  enrolled,
  joinClass,
  joinGroup,
  leaderOf,
  registerProject,
  removeMember,
} from "@/data/selfService"
import { useStudentContext } from "./useStudentContext"

const labels = {
  pending: "Chờ Supervisor duyệt",
  changesRequested: "Cần chỉnh sửa",
  rejected: "Đã từ chối",
  approved: "Đã duyệt",
}
export default function StudentGroupsPage() {
  const mgmt = useManagement(),
    ctx = useStudentContext(),
    navigate = useNavigate()
  const [showJoin, setShowJoin] = useState(false)
  const [groupTab, setGroupTab] = useState("Tham gia nhóm")
  const [messageKind, setMessageKind] = useState<"success" | "error">("success")
  const [code, setCode] = useState("")
  const [memberId, setMemberId] = useState("")
  const [groupName, setGroupName] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [message, setMessage] = useState("")
  const student = ctx.student
  if (!student) return <Notice>Không tìm thấy tài khoản sinh viên.</Notice>
  const classId = ctx.cls?.id ?? ""
  const cls = mgmt.classes.find((c) => c.id === classId)
  const group = mgmt.groups.find(
    (g) => g.classId === classId && g.memberIds.includes(student.id),
  )
  const registrations =
    mgmt.registrations?.filter((r) => r.groupId === group?.id) ?? []
  const latest = registrations[registrations.length - 1]
  const project = mgmt.projects.find(
    (p) => p.groupId === group?.id && p.state === "active",
  )
  const membershipLocked = Boolean(group && (mgmt.projects.some(p=>p.groupId===group.id && (p.hasHistory || p.state==="active")) || registrations.some(r=>["pending","approved"].includes(r.status))))
  const leader = group && leaderOf(group) === student.id
  const run = (fn: () => void) => {
    try {
      fn()
      setMessageKind("success")
      setMessage("Đã cập nhật thành công.")
    } catch (e) {
      setMessageKind("error")
      setMessage((e as Error).message)
    }
  }
  const pickClass = (id: string) => {
    setMemberId("")
    setShowJoin(false)
    selectStudentClass(id)
    navigate("/student/groups?class=" + encodeURIComponent(id))
    setName("")
    setDescription("")
  }
  return (
    <div className="student-refine phase-two flex min-w-0 flex-col gap-4">
      <PageHeading
        eyebrow="SINH VIÊN"
        title="Lớp & nhóm của tôi"

      />
      {message && (
        <p role={messageKind==="error" ? "alert" : "status"} className={messageKind==="error" ? "border-l-2 border-danger pl-3 text-danger" : "border-l-2 border-brand pl-3 text-brand"}>{message}</p>
      )}
      {cls && enrolled(student,cls.id) && <Button variant="secondary" onClick={()=>setShowJoin(v=>!v)}>{showJoin ? "Đóng" : "Tham gia lớp khác"}</Button>}
      {(!cls || !enrolled(student,cls.id) || showJoin) && <Card>
        <Field
          label="Mã tham gia lớp"
          hint="Nhập mã lớp do giảng viên cung cấp."
        >
          <TextInput value={code} onChange={(e) => setCode(e.target.value)} />
        </Field>
        <Button
          onClick={() =>
            run(() => {
              const c = joinClass(code)
              pickClass(c.id)
            })
          }
        >
          Tham gia lớp
        </Button>
      </Card>}
      {mgmt.classes.some(c=>enrolled(student,c.id)) && <Field label="Lớp đang xem">
          <select
            className="min-h-12 rounded-lg border border-line p-3"
            value={classId}
            onChange={(e) => pickClass(e.target.value)}
          >
            <option value="">Chọn lớp</option>
            {mgmt.classes
              .filter((c) => enrolled(student, c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {mgmt.courses.find(course => course.id === c.courseId)?.code} · {c.code}
                </option>
              ))}
          </select>
        </Field>}
      {cls && enrolled(student, cls.id) && !group && (
        <>
          <PhaseTwoTabs id="student-group" tabs={["Tham gia nhóm","Tạo nhóm"]} active={groupTab} onChange={setGroupTab}/>
          <section role="tabpanel" id="student-group-panel-1" aria-labelledby="student-group-1" hidden={groupTab!=="Tạo nhóm"}><Card>
            <Field label="Tên nhóm mới">
              <TextInput
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </Field>
            <Button
              onClick={() =>
                run(() => {
                  createGroup(cls.id, groupName)
                })
              }
            >
              Tạo nhóm
            </Button>
          <p className="text-muted">Bạn sẽ là trưởng nhóm.</p></Card></section>
          <section role="tabpanel" id="student-group-panel-0" aria-labelledby="student-group-0" hidden={groupTab!=="Tham gia nhóm"} className="flex flex-col gap-3">
          <h2 className="font-semibold">Nhóm trong {cls.code}</h2>
          {mgmt.groups
            .filter((g) => g.classId === cls.id)
            .map((g) => (
              <Card key={g.id}>
                <p className="font-semibold">{g.name}</p>
                <p className="text-sm text-muted">
                  {g.memberIds.length}/{groupMemberLimit(cls)} thành viên · Trưởng nhóm{" "}
                  {mgmt.students.find((s) => s.id === leaderOf(g))?.name}
                </p>
                <Button
                  variant="secondary"
                  disabled={g.memberIds.length >= groupMemberLimit(cls)}
                  onClick={() => run(() => joinGroup(g.id))}
                >
                  {g.memberIds.length >= groupMemberLimit(cls) ? "Nhóm đã đủ thành viên" : "Tham gia nhóm"}
                </Button>
              </Card>
            ))}
          </section>
        </>
      )}
      {group && (
        <>
          <p className="text-[14px] text-muted">{group.name} · {leader ? "Trưởng nhóm" : "Thành viên"}</p>
          <details><summary>Thành viên nhóm ({group.memberIds.length}/{groupMemberLimit(cls)})</summary><Card>
            <h2 className="font-semibold">{group.name}</h2>
            <p className="text-sm text-muted">
              {cls?.code} ·{" "}
              {leader ? "Bạn là trưởng nhóm" : "Bạn là thành viên"}
            </p>
            {group.memberIds.map((id) => (
              <div
                key={id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2"
              >
                <span>
                  {mgmt.students.find((s) => s.id === id)?.name}
                  {id === leaderOf(group) && " · Trưởng nhóm"}
                </span>
                {leader && id !== student.id && (
                  <Button
                    variant="secondary"
                    disabled={membershipLocked}
                    title={membershipLocked ? "Nhóm đã khóa thay đổi thành viên" : undefined}
                    onClick={() => run(() => removeMember(group.id, id))}
                  >
                    Xóa khỏi nhóm
                  </Button>
                )}
              </div>
            ))}
            <p className="text-sm text-muted">
              Chỉ trưởng nhóm được xóa thành viên trước khi project chờ duyệt hoặc hoạt động.
            </p>
          </Card></details>
          {group.memberIds.length > groupMemberLimit(cls) && <p role="status" className="text-[14px] text-amber">Nhóm có {group.memberIds.length}/{groupMemberLimit(cls)} thành viên. Không thể thêm người mới.</p>}
          {leader && <details><summary>Thêm thành viên</summary><div className="flex flex-col gap-3">
            <Field label="Sinh viên cùng lớp chưa có nhóm"><select className="min-h-12 rounded-lg border border-muted p-3 text-[16px]" value={memberId} onChange={e => setMemberId(e.target.value)}>
              <option value="">Chọn sinh viên</option>
              {mgmt.students.filter(st => enrolled(st, classId) && !mgmt.groups.some(g => g.classId === classId && g.memberIds.includes(st.id))).map(st => <option key={st.id} value={st.id}>{st.name} · {st.studentCode}</option>)}
            </select></Field>
            <Button disabled={!memberId || group.memberIds.length >= groupMemberLimit(cls)} onClick={() => run(() => { addMember(group.id, memberId); setMemberId("") })}>Thêm vào nhóm</Button>
          </div></details>}
          {latest && <RegistrationStatus registration={latest}/>}
          {registrations.length>1 && <details><summary>Đăng ký trước ({registrations.length-1})</summary><div className="flex flex-col gap-4">{registrations.slice(0,-1).reverse().map(r=><RegistrationStatus key={r.id} registration={r}/>)}</div></details>}
          {project ? (
            <Card>
              <p className="font-semibold">{project.name}</p>
              <Button to="/student/projects">Mở project</Button>
              <Button variant="secondary" to="/student/documents">
                Nộp tài liệu
              </Button>
            </Card>
          ) : leader &&
            (!latest ||
              latest.status === "changesRequested" ||
              latest.status === "rejected" ||
              latest.status === "approved") ? (
            <Card>
              <h2 className="font-semibold">Đăng ký project</h2>
              {latest?.status === "changesRequested" && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setName(latest.name)
                    setDescription(latest.description)
                  }}
                >
                  Điền lại nội dung cần sửa
                </Button>
              )}
              <Field label="Tên project">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Mô tả">
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Button
                onClick={() =>
                  run(() => registerProject(group.id, name, description))
                }
              >
                Gửi Supervisor duyệt
              </Button>
            </Card>
          ) : (
            <Notice>
              {latest?.status === "pending"
                ? "Chờ Supervisor duyệt trước khi kích hoạt và nộp tài liệu."
                : "Chỉ trưởng nhóm được đăng ký project."}
            </Notice>
          )}
        </>
      )}
    </div>
  )
}

function RegistrationStatus({registration:r}:{registration:ProjectRegistration}) { return (<section key={r.id} className="border-l-2 border-brand pl-3">
              <h2 className="font-semibold">{r.name}</h2>
              <p>{labels[r.status]}</p>
              <details><summary>Chi tiết đăng ký</summary><p className="text-sm text-muted">{r.description}</p>
              </details>
              {r.feedback && <Notice>{r.feedback}</Notice>}
              {r.decisions.length>0 && <details><summary>Lịch sử xét duyệt ({r.decisions.length})</summary>
              {r.decisions.map((d, i) => (
                <p key={i} className="text-sm text-muted">
                  {d.at} · {labels[d.status as keyof typeof labels] ?? d.status} · {d.feedback}
                </p>
              ))}</details>}
            </section>) }
