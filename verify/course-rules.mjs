import assert from "node:assert/strict"
import { register } from "node:module"
register("./self-service-loader.mjs", import.meta.url)
const { courseRuleScope } = await import("../src/lib/courseRules.ts")
const item = (ruleSetId) => ({ id: ruleSetId, ruleSetId })
const cfg = {
  courses: [],
  semesters: [],
  groups: [],
  ruleSets: [],
  offerings: [
    {
      id: "off-a",
      courseId: "a",
      ruleSetId: "default-a",
      labs: [{ items: [item("item-a")] }],
    },
    {
      id: "off-b",
      courseId: "b",
      ruleSetId: "default-b",
      labs: [{ items: [item("item-b")] }],
    },
  ],
  classes: [
    {
      id: "class-a",
      courseId: "a",
      offeringId: "off-a",
      ruleSetOverride: "class-rule",
      labOverride: [{ items: [item("class-item")] }],
    },
    {
      id: "class-b",
      courseId: "b",
      offeringId: "off-b",
      ruleSetOverride: "other-class-rule",
    },
    { id: "legacy-a", courseId: "a", ruleSetOverride: "legacy-rule" },
  ],
}
const original = structuredClone(cfg)
const scope = courseRuleScope("a", cfg)
assert.deepEqual(
  scope.offerings.map((o) => o.id),
  ["off-a"],
)
assert.deepEqual(
  scope.classes.map((c) => c.id),
  ["class-a", "legacy-a"],
)
assert.deepEqual(
  [...scope.ruleIds].sort(),
  ["default-a", "item-a", "class-rule", "class-item", "legacy-rule"].sort(),
)
assert.equal(scope.ruleIds.has("default-b"), false)
assert.equal(courseRuleScope("missing", cfg).ruleIds.size, 0)
assert.deepEqual(
  cfg,
  original,
  "Browsing course context never changes assignments or source data",
)
console.log(
  "PASS course scope includes offering/item/class/legacy assignments; excludes other courses; immutable source",
)
