import { CircleCheck, CircleDashed, CircleDot, Lock } from "lucide-react"
import { Link } from "react-router-dom"
import Badge from "@/components/ui/Badge"
import StatusBadge from "@/components/ui/StatusBadge"
import { lockReason } from "@/data/mockData"
import type { ProjectDocument } from "@/types"
import useDocumentState from "./useDocumentState"

export default function DocumentRoadmapItem({ doc: raw }: { doc: ProjectDocument }) {
  const doc = useDocumentState(raw)
  const Icon = doc.supervisorStatus === "approved" ? CircleCheck : doc.submissionLocked ? Lock : doc.latestVersion ? CircleDot : CircleDashed
  const body = (
    <>
      <Icon size={18} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${doc.supervisorStatus === "approved" ? "text-brand" : "text-muted"}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-ink">{doc.title}</span>
          {doc.latestVersion && <Badge>{doc.latestVersion}</Badge>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {doc.supervisorStatus ? <StatusBadge status={doc.supervisorStatus} /> : <StatusBadge status={doc.documentStatus} />}
          {doc.submissionLocked && doc.documentStatus !== "notStarted" && <StatusBadge status="submissionLocked" />}
        </div>
        {doc.submissionLocked && doc.dependsOn && doc.documentStatus !== "notStarted" && (
          <p className="text-[12px] leading-[1.45] text-muted">
            Phụ thuộc: <span className="font-semibold text-ink">{doc.dependsOn}</span> · {lockReason(doc.dependsOn)}
          </p>
        )}
        {doc.note && <p className="text-[12px] leading-[1.45] text-muted">{doc.note}</p>}
      </div>
    </>
  )
  return (
    <li className="border-b border-line last:border-b-0">
      {doc.reviewId ? (
        <Link to={`/reviews/${doc.reviewId}`} className="flex gap-3 py-3">{body}</Link>
      ) : (
        <div className="flex gap-3 py-3">{body}</div>
      )}
    </li>
  )
}
