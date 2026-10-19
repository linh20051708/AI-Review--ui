import PhaseTwoTabs from "@/components/ui/PhaseTwoTabs"
import MoreMenu from "@/components/ui/MoreMenu"
import { ruleDescription } from "@/components/ui/contentText"
import { useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { Field, TextArea, TextInput } from "@/components/ui/Form"
import Modal from "@/components/ui/Modal"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import { toast } from "@/components/ui/Toast"
import {
  saveRuleSet,
  updateManagement,
  useManagement,
} from "@/data/managementStore"
import { nextId, offeringLabel } from "@/lib/config"
import { newCriterion, normalizeRule, validateRule } from "@/lib/rubric"
import type { RubricCriterion, RuleSet } from "@/types"

const selectClass =
  "min-h-12 w-full rounded-lg border border-line bg-white p-3 text-[14px]"
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 text-[14px]">
      <span>{label}</span>
      <input
        type="checkbox"
        className="size-5 shrink-0 accent-[#146b55]"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}
export default function RuleSetListPage() {
  const cfg = useManagement()
  const [editing, setEditing] = useState<RuleSet | null>(null)
  const [viewing, setViewing] = useState<RuleSet | null>(null)
  const [assigning, setAssigning] = useState<RuleSet | null>(null)
  const create = () =>
    setEditing(
      normalizeRule({
        id: nextId("rule"),
        name: "",
        description: "",
        status: "draft",
        aiReview: "manual",
        aiRequiredBeforeSupervisor: false,
        supervisorApproval: true,
        prerequisiteApproval: true,
        allowedFormats: ["PDF", "DOCX"],
        maxFileSizeMB: 20,
        reviewSlaDays: 3,
      }),
    )
  return (
    <div className="phase-two flex min-w-0 flex-col gap-4">
      <PageHeading
        eyebrow="QUẢN LÝ"
        title="Bộ quy tắc"
        
      />
      <Button onClick={create}>Thêm bộ quy tắc</Button>
      <p className="text-[14px] text-muted">Ưu tiên: Mục Lab → Lớp → Đợt học. Cấu hình mới áp dụng cho bản nộp mới.</p>
      {cfg.ruleSets.map((raw) => {
        const r = normalizeRule(raw)
        return (
          <Card key={r.id}>
            <div className="flex flex-wrap justify-between gap-2">
              <h2 className="text-[16px] font-semibold">{r.name}</h2>
              <Badge tone={r.status === "active" ? "brand" : "neutral"}>
                {r.status === "active" ? "Active" : "Draft"} · v{r.version}
              </Badge>
            </div>
            
            
            <p className="text-[14px]">
              {r.criteria?.filter((c) => c.enabled).length ?? 0} tiêu chí bật ·{" "}
              {r.criteria
                ?.filter((c) => c.enabled)
                .reduce((n, c) => n + c.maxScore, 0) ?? 0}{" "}
              điểm · {r.documentType}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={()=>setViewing(r)} className="flex-1">Checklist</Button>
              <MoreMenu label={`Thao tác ${r.name}`} items={[
                {label:"Chỉnh sửa",onSelect:()=>setEditing(structuredClone(r))},
                {label:"Nhân bản",onSelect:()=>setEditing({...structuredClone(r),id:nextId("rule"),name:r.name+" (bản sao)",version:1,status:"draft"})},
                ...(r.status==="active"?[{label:"Áp dụng",onSelect:()=>setAssigning(r)}]:[])
              ]}/>
            </div>
          </Card>
        )
      })}
      {editing && (
        <RuleSetEditor rule={editing} onClose={() => setEditing(null)} />
      )}
      {assigning && (
        <Assignment rule={assigning} onClose={() => setAssigning(null)} />
      )}
      {viewing && (
        <Modal
          open
          title={viewing.name}
          onClose={() => setViewing(null)}
          footer={<Button onClick={() => setViewing(null)}>Đóng</Button>}
        >
          {ruleDescription(viewing.description) && <p>{ruleDescription(viewing.description)}</p>}
          <details><summary>Quy trình &amp; điều kiện nộp</summary>
          <p>
            AI: {viewing.aiEnabled ? "Bật" : "Tắt"} · AI trước Supervisor:{" "}
            {viewing.aiRequiredBeforeSupervisor ? "Bắt buộc" : "Tùy chọn"} ·
            Supervisor: {viewing.supervisorApproval ? "Bắt buộc" : "Tùy chọn"}
          </p>
          <p>
            Prerequisite: {viewing.prerequisiteApproval ? "Bắt buộc" : "Không"}{" "}
            · Nộp lại: {viewing.resubmissionEnabled ? "Có" : "Không"} · Tối đa:{" "}
            {viewing.maxResubmissions ?? "∞"}
          </p>
          <p>
            File: {viewing.allowedFormats.join(" / ")} · {viewing.maxFileSizeMB}{" "}
            MB · SLA {viewing.reviewSlaDays} ngày
          </p>
          <p>
            Đạt ≥{viewing.passThreshold}% · Cần cải thiện ≥
            {viewing.improveThreshold}% · còn lại Cần làm lại. Điểm đề xuất
            không phải quyết định chính thức.
          </p>
          </details>
          {!viewing.criteria?.length && (
            <Notice>
              Chưa cấu hình checklist. Thêm tiêu chí để chạy AI Evaluation.
            </Notice>
          )}
          {viewing.criteria?.map((c) => (
            <details key={c.id} className="border-b border-line pb-3"><summary>{c.name} · {c.maxScore}đ{c.critical ? " · Critical" : ""}</summary>
              <p>
                {c.maxScore} điểm · {c.enabled ? "Bật" : "Tắt"} ·{" "}
                {c.critical
                  ? "Critical"
                  : c.required
                    ? "Bắt buộc"
                    : "Thông thường"}
              </p>
              <p>{c.description}</p>
              <p>
                AI: {c.aiEnabled ? "Bật" : "Tắt"} · {c.instruction}
              </p>
              <p>Evidence: {c.evidenceRequirement || "Supervisor xác minh"}</p>
            </details>
          ))}
        </Modal>
      )}
    </div>
  )
}
function RuleSetEditor({
  rule,
  onClose,
}: {
  rule: RuleSet
  onClose: () => void
}) {
  const [section, setSection] = useState("Thông tin")
  const [r, setR] = useState(rule)
  const [error, setError] = useState("")
  const set = <K extends keyof RuleSet>(key: K, value: RuleSet[K]) =>
    setR((s) => ({ ...s, [key]: value }))
  const change = (index: number, patch: Partial<RubricCriterion>) =>
    set(
      "criteria",
      r.criteria!.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    )
  const invalid = validateRule(r)
  return (
    <Modal
      open
      title="Cấu hình bộ quy tắc"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={Boolean(invalid)}
            onClick={() => {
              try {
                saveRuleSet(r)
                toast("Đã lưu bộ quy tắc và phiên bản cấu hình mới")
                onClose()
              } catch (e) {
                setError((e as Error).message)
              }
            }}
          >
            Lưu bộ quy tắc
          </Button>
        </>
      }
    >
      <PhaseTwoTabs id="rule-editor" tabs={["Thông tin", "Quy trình", "Tiêu chí"]} active={section} onChange={setSection} />
      <section className="flex flex-col gap-3" role="tabpanel" id="rule-editor-panel-0" aria-labelledby="rule-editor-0" hidden={section!=="Thông tin"}>
      <p className="text-[14px] text-muted">Phiên bản {r.version} · Nhấn Lưu để áp dụng</p>
      <Field label="Tên bộ quy tắc">
        <TextInput
          value={r.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </Field>
      <Field label="Mô tả">
        <TextArea
          value={r.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>
      <Field label="Trạng thái">
        <select
          className={selectClass}
          value={r.status}
          onChange={(e) => set("status", e.target.value as RuleSet["status"])}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>
      </Field>
      <Field label="Document Type / phạm vi rubric">
        <TextInput
          value={r.documentType}
          onChange={(e) => set("documentType", e.target.value)}
        />
      </Field>
      <p className="text-[14px] text-muted">Gán cấu hình qua thao tác Áp dụng.</p>
      </section><section className="flex flex-col gap-3" role="tabpanel" id="rule-editor-panel-1" aria-labelledby="rule-editor-1" hidden={section!=="Quy trình"}>
      <h3 className="font-semibold">Quy trình review</h3>
      {([
        ["aiEnabled", "Bật AI Review"],
        ["aiRequiredBeforeSupervisor", "AI bắt buộc trước Supervisor"],
        ["supervisorApproval", "Supervisor Approval Required"],
        ["prerequisiteApproval", "Prerequisite Approval"],
        ["resubmissionEnabled", "Cho phép nộp lại"],
      ] as const).map(([key, label]) => (
        <Toggle
          key={key}
          label={label}
          value={Boolean(r[key])}
          onChange={(v) => set(key, v)}
        />
      ))}
      <Field label="Khởi chạy AI">
        <select
          className={selectClass}
          value={r.aiReview}
          onChange={(e) => set("aiReview", e.target.value as "auto" | "manual")}
        >
          <option value="manual">Supervisor bắt đầu</option>
          <option value="auto">Tự chạy khi nộp mới</option>
        </select>
      </Field>
      <Field label="Nộp lại tối đa (trống = không giới hạn)">
        <TextInput
          type="number"
          min={0}
          value={r.maxResubmissions ?? ""}
          onChange={(e) =>
            set(
              "maxResubmissions",
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
        />
      </Field>
      {["PDF", "DOCX"].map((f) => (
        <Toggle
          key={f}
          label={f}
          value={r.allowedFormats.includes(f)}
          onChange={(v) =>
            set(
              "allowedFormats",
              v
                ? [...r.allowedFormats, f]
                : r.allowedFormats.filter((x) => x !== f),
            )
          }
        />
      ))}
      <Field label="Dung lượng tối đa MB">
        <TextInput
          type="number"
          value={r.maxFileSizeMB}
          onChange={(e) => set("maxFileSizeMB", Number(e.target.value))}
        />
      </Field>
      <Field label="Hạn review (ngày)">
        <TextInput
          type="number"
          value={r.reviewSlaDays}
          onChange={(e) => set("reviewSlaDays", Number(e.target.value))}
        />
      </Field>
      <Field label="Chế độ chấm">
        <select
          className={selectClass}
          value={r.scoringMode ?? "weighted"}
          onChange={(e) =>
            set("scoringMode", e.target.value as "binary" | "weighted")
          }
        >
          <option value="weighted">Điểm theo trọng số maxScore</option>
          <option value="binary">Đạt: điểm tối đa / Chưa đạt: 0</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Đạt từ (%)">
          <TextInput
            type="number"
            value={r.passThreshold}
            onChange={(e) => set("passThreshold", Number(e.target.value))}
          />
        </Field>
        <Field label="Cải thiện từ (%)">
          <TextInput
            type="number"
            value={r.improveThreshold}
            onChange={(e) => set("improveThreshold", Number(e.target.value))}
          />
        </Field>
      </div>
      </section><section className="flex flex-col gap-3" role="tabpanel" id="rule-editor-panel-2" aria-labelledby="rule-editor-2" hidden={section!=="Tiêu chí"}>
      <h3 className="font-semibold">Checklist / Rubric</h3>
      <p>
        Tổng điểm tiêu chí bật:{" "}
        {(r.criteria ?? [])
          .filter((c) => c.enabled)
          .reduce((n, c) => n + c.maxScore, 0)}
        . Tắt tiêu chí thay đổi mẫu số; ngưỡng tính theo %.
      </p>
      {(r.criteria ?? []).map((c, i) => (
        <details key={i} className="rounded-xl border border-line p-3">
          <summary className="min-h-12 cursor-pointer text-[14px] font-semibold">
            {c.name || "Tiêu chí mới"} · {c.maxScore}đ{c.critical ? " · Critical" : ""}
          </summary>
          <div className="flex flex-col gap-3 pt-3">
            <Field label="Criterion ID">
              <TextInput
                value={c.id}
                onChange={(e) => change(i, { id: e.target.value })}
              />
            </Field>
            <Field label="Tên tiêu chí">
              <TextArea
                value={c.name}
                onChange={(e) => change(i, { name: e.target.value })}
              />
            </Field>
            <Field label="Mô tả tiêu chí">
              <TextArea
                value={c.description}
                onChange={(e) => change(i, { description: e.target.value })}
              />
            </Field>
            <Field label="Điểm tối đa">
              <TextInput
                type="number"
                value={c.maxScore}
                onChange={(e) =>
                  change(i, { maxScore: Number(e.target.value) })
                }
              />
            </Field>
            {([
              ["enabled", "Bật tiêu chí"],
              ["required", "Bắt buộc"],
              ["critical", "Critical"],
              ["evidenceRequired", "Evidence Required"],
              ["aiEnabled", "AI cho tiêu chí"],
              ["suggestScore", "AI đề xuất điểm"],
              ["suggestFindings", "AI đề xuất findings"],
              ["suggestSuggestions", "AI đề xuất suggestions"],
            ] as const).map(([key, label]) => (
              <Toggle
                key={key}
                label={label}
                value={c[key]}
                onChange={(v) => change(i, { [key]: v })}
              />
            ))}
            <Field label="Evaluation Instruction">
              <TextArea
                value={c.instruction}
                onChange={(e) => change(i, { instruction: e.target.value })}
              />
            </Field>
            <Field label="Evidence Requirement">
              <TextArea
                value={c.evidenceRequirement}
                onChange={(e) =>
                  change(i, { evidenceRequirement: e.target.value })
                }
              />
            </Field>
            <Button
              variant="secondary"
              onClick={() =>
                set(
                  "criteria",
                  r.criteria!.filter((_, index) => index !== i),
                )
              }
            >
              Xóa tiêu chí
            </Button>
          </div>
        </details>
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          set("criteria", [
            ...(r.criteria ?? []),
            newCriterion(nextId("criterion")),
          ])
        }
      >
        Thêm tiêu chí
      </Button>
      </section>
      {(invalid || error) && (
        <p role="alert" className="text-[14px] text-danger">
          {invalid || error}
        </p>
      )}
    </Modal>
  )
}
function Assignment({ rule, onClose }: { rule: RuleSet; onClose: () => void }) {
  const cfg = useManagement()
  const [offeringId, setOffering] = useState("")
  const [classId, setClass] = useState("")
  const [itemId, setItem] = useState("")
  const offering = cfg.offerings.find((o) => o.id === offeringId)
  const cls = cfg.classes.find((c) => c.id === classId)
  const items = (cls?.labOverride ?? offering?.labs ?? []).flatMap(
    (l) => l.items,
  )
  return (
    <Modal
      open
      title={"Áp dụng: " + rule.name}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={!offering}
            onClick={() => {
              updateManagement((s) =>
                classId
                  ? {
                      classes: s.classes.map((c) =>
                        c.id !== classId
                          ? c
                          : itemId
                            ? {
                                ...c,
                                labOverride: structuredClone(
                                  c.labOverride ?? offering!.labs,
                                ).map((l) => ({
                                  ...l,
                                  items: l.items.map((i) =>
                                    i.id === itemId
                                      ? { ...i, ruleSetId: rule.id }
                                      : i,
                                  ),
                                })),
                              }
                            : { ...c, ruleSetOverride: rule.id },
                      ),
                    }
                  : {
                      offerings: s.offerings.map((o) =>
                        o.id !== offeringId
                          ? o
                          : itemId
                            ? {
                                ...o,
                                labs: o.labs.map((l) => ({
                                  ...l,
                                  items: l.items.map((i) =>
                                    i.id === itemId
                                      ? { ...i, ruleSetId: rule.id }
                                      : i,
                                  ),
                                })),
                              }
                            : { ...o, ruleSetId: rule.id },
                      ),
                    },
              )
              toast("Đã áp dụng bộ quy tắc cho bản nộp mới")
              onClose()
            }}
          >
            Xác nhận áp dụng
          </Button>
        </>
      }
    >
      <Field label="Course Offering">
        <select
          className={selectClass}
          value={offeringId}
          onChange={(e) => {
            setOffering(e.target.value)
            setClass("")
            setItem("")
          }}
        >
          <option value="">Chọn môn trong học kỳ</option>
          {cfg.offerings.map((o) => (
            <option key={o.id} value={o.id}>
              {offeringLabel(o, cfg.courses, cfg.semesters)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Phạm vi lớp">
        <select
          className={selectClass}
          value={classId}
          onChange={(e) => {
            setClass(e.target.value)
            setItem("")
          }}
        >
          <option value="">Course Offering (giữ override lớp)</option>
          {cfg.classes
            .filter((c) => c.offeringId === offeringId)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — override lớp
              </option>
            ))}
        </select>
      </Field>
      <Field label="Lab Item">
        <select
          className={selectClass}
          value={itemId}
          onChange={(e) => setItem(e.target.value)}
        >
          <option value="">Mặc định cho phạm vi đã chọn</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.code} · {i.title}
            </option>
          ))}
        </select>
      </Field>
      <Notice>
        Lab Item ưu tiên cao nhất. Lớp có bản sao Lab riêng không đổi khi gán ở
        Offering. Snapshot và kết quả bản nộp trước giữ nguyên.
      </Notice>
    </Modal>
  )
}
