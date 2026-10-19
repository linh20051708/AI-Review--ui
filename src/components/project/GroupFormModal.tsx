import { useEffect, useState } from "react"
import { groupNameExists } from "@/data/selfServicePolicy"
import Button from "@/components/ui/Button"
import { Field, TextInput } from "@/components/ui/Form"
import Modal from "@/components/ui/Modal"
import { toast } from "@/components/ui/Toast"
import { updateManagement, useManagement } from "@/data/managementStore"
import type { StudentGroup } from "@/types"

export default function GroupFormModal({ open, classId, group, onClose }: { open: boolean; classId: string; group?: StudentGroup; onClose: () => void }) {
  const { groups } = useManagement()
  const nextName = `Group ${String(groups.filter((g) => g.classId === classId).length + 1).padStart(2, "0")}`
  const [name, setName] = useState("")
  const duplicate = groupNameExists(groups, classId, name, group?.id)
  useEffect(() => {
    if (open) setName(group?.name ?? nextName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group])

  const save = () => {
    if (!name.trim() || duplicate) return
    if (group) {
      updateManagement((s) => ({
        groups: s.groups.map((g) => (g.id === group.id ? { ...g, name: name.trim() } : g)),
        projects: s.projects.map((p) => (p.groupId === group.id ? { ...p, groupName: name.trim() } : p)),
      }))
      toast("Đã đổi tên nhóm")
    } else {
      const created: StudentGroup = { id: `${classId}-group-${Date.now()}`, classId, name: name.trim(), health: "notSubmitted", memberIds: [], progress: 0, pendingReviews: 0, lastActivity: "Vừa tạo" }
      updateManagement((s) => ({ groups: [...s.groups, created], classes: s.classes.map((c) => (c.id === classId ? { ...c, groupCount: c.groupCount + 1 } : c)) }))
      toast(`Đã tạo ${created.name}`)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={group ? "Đổi tên nhóm" : "Thêm nhóm"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={save} disabled={!name.trim() || duplicate} className="disabled:opacity-50">{group ? "Lưu" : "Tạo nhóm"}</Button>
        </>
      }
    >
      <Field label="Tên nhóm" required error={duplicate ? "Tên nhóm đã tồn tại trong lớp." : undefined}><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
    </Modal>
  )
}
