import { statusMeta } from "@/data/mockData"
import type { Status } from "@/types"
import Badge from "./Badge"

export default function StatusBadge({ status }: { status: Status }) {
  const { label, tone } = statusMeta[status]
  return <Badge tone={tone}>{label}</Badge>
}
