import { Users2 } from "lucide-react"
import { useState } from "react"
import GroupFormModal from "@/components/project/GroupFormModal"
import ProjectCard from "@/components/project/ProjectCard"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import { useManagement } from "@/data/managementStore"

export default function GroupListPage() {
  const { classes, groups } = useManagement()
  const [creatingFor, setCreatingFor] = useState<string | null>(null)
  return (
    <>
      <PageHeading eyebrow="QUẢN LÝ" title="Nhóm sinh viên" description="Tạo nhóm, xếp sinh viên và gán project trong các lớp bạn phụ trách." />
      {classes.filter((c) => c.state === "active").map((c) => {
        const list = groups.filter((g) => g.classId === c.id)
        return (
          <section key={c.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <SectionHeader title={c.code} meta={`${list.length} nhóm`} />
              <Button variant="secondary" className="w-auto shrink-0 px-3 text-[13px]" onClick={() => setCreatingFor(c.id)}>Thêm nhóm</Button>
            </div>
            {list.length ? (
              list.map((g) => <ProjectCard key={g.id} group={g} />)
            ) : (
              <EmptyState
                icon={<Users2 size={24} className="text-brand" />}
                title="Chưa có nhóm nào trong lớp này"
                description={`Tạo nhóm sinh viên đầu tiên cho lớp ${c.code} để bắt đầu phân công đồ án.`}
                action={
                  <Button
                    variant="secondary"
                    className="w-auto px-4"
                    onClick={() => setCreatingFor(c.id)}
                  >
                    Tạo nhóm
                  </Button>
                }
              />
            )}
          </section>
        )
      })}
      <GroupFormModal open={Boolean(creatingFor)} classId={creatingFor ?? ""} onClose={() => setCreatingFor(null)} />
    </>
  )
}
