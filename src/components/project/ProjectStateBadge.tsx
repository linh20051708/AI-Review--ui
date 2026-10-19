import Badge from "@/components/ui/Badge"
import { projectStateMeta } from "@/data/projectStatuses"
import type { LifecycleState } from "@/types"

export default function ProjectStateBadge({ state }: {state: LifecycleState}) {
  const meta = projectStateMeta[state]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
