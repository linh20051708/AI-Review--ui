import type { AcademicConfig } from "@/lib/config"

/** Course context is derived from existing assignments; no rule ownership migration. */
export function courseRuleScope(courseId: string, cfg: AcademicConfig) {
  const offerings = cfg.offerings.filter((o) => o.courseId === courseId)
  const offeringIds = new Set(offerings.map((o) => o.id))
  const classes = cfg.classes.filter(
    (c) => c.courseId === courseId || offeringIds.has(c.offeringId ?? ""),
  )
  const ruleIds = new Set(
    [
      ...offerings.map((o) => o.ruleSetId),
      ...offerings.flatMap((o) =>
        o.labs.flatMap((l) => l.items.map((i) => i.ruleSetId)),
      ),
      ...classes.map((c) => c.ruleSetOverride),
      ...classes.flatMap((c) =>
        (c.labOverride ?? []).flatMap((l) => l.items.map((i) => i.ruleSetId)),
      ),
    ].filter((id): id is string => Boolean(id)),
  )
  return { offerings, classes, ruleIds }
}
