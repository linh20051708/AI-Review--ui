import PhaseTwoTabs from "@/components/ui/PhaseTwoTabs"

import MoreMenu from "@/components/ui/MoreMenu"

import { ruleDescription } from "@/components/ui/contentText"

import { useState } from "react"

import { Link } from "react-router-dom"

import Badge from "@/components/ui/Badge"

import Button from "@/components/ui/Button"

import Card from "@/components/ui/Card"

import { Field, TextArea, TextInput } from "@/components/ui/Form"

import Modal from "@/components/ui/Modal"

import Notice from "@/components/ui/Notice"

import PageHeading from "@/components/ui/PageHeading"

import EmptyState from "@/components/ui/EmptyState"

import { toast } from "@/components/ui/Toast"

import {
  saveRuleSet,
  updateManagement,
  useManagement,
} from "@/data/managementStore"

import { nextId, offeringLabel } from "@/lib/config"

import { courseRuleScope } from "@/lib/courseRules"

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

export default function RuleSetListPage({ courseId }: { courseId?: string }) {
  const cfg = useManagement()

  const [group, setGroup] = useState("Quy tắc nộp bài")

  const [library, setLibrary] = useState(false)

  const [editing, setEditing] = useState<RuleSet | null>(null)

  const [viewing, setViewing] = useState<RuleSet | null>(null)

  const [assigning, setAssigning] = useState<RuleSet | null>(null)

  const course = cfg.courses.find((c) => c.id === courseId)

  const scope = courseRuleScope(courseId ?? "", cfg)

  const visibleRules = cfg.ruleSets.filter(
    (r) => library || scope.ruleIds.has(r.id),
  )

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

  if (!courseId)
    return (
      <div className="phase-two flex min-w-0 flex-col gap-4">
        <PageHeading
          title="Bộ quy tắc"
          description="Chọn môn học trước khi cấu hình."
        />
        <nav aria-label="Chọn môn học" className="flex flex-col gap-3">
          {cfg.courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="flex min-h-12 flex-col gap-1 rounded-xl border border-line bg-white p-4"
            >
              <span className="font-semibold text-brand">{c.code}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </nav>
        {!cfg.courses.length && (
          <EmptyState
            title="Chưa có môn học"
            action={<Button to="/courses">Mở quản lý môn học</Button>}
          />
        )}
      </div>
    )

  if (!course) return <EmptyState title="Không tìm thấy môn học" />

  return (
    <div className="phase-two flex min-w-0 flex-col gap-4">
      <h2 className="text-[18px] font-semibold">Bộ quy tắc môn học</h2>
      <PhaseTwoTabs
        id="course-rules"
        tabs={["Quy tắc nộp bài", "Checklist & tiêu chí"]}
        active={group}
        onChange={setGroup}
      />
      <section
        role="tabpanel"
        id={`course-rules-panel-${group === "Quy tắc nộp bài" ? 0 : 1}`}
        aria-labelledby={`course-rules-${group === "Quy tắc nộp bài" ? 0 : 1}`}
        className="flex min-w-0 flex-col gap-3"
      >
        <h3 className="font-semibold">
          {group === "Quy tắc nộp bài"
            ? "Quy tắc nộp bài theo loại tài liệu"
            : "Checklist và tiêu chí đánh giá"}
        </h3>
        <p className="text-[14px] text-muted">
          Lớp kế thừa quy tắc theo đợt học. Ưu tiên: Mục tài liệu → Lớp → Đợt
          học. Bản nộp cũ giữ nguyên cấu hình.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setLibrary(true)
              create()
            }}
          >
            Thêm bộ quy tắc
          </Button>
          <Button variant="secondary" onClick={() => setLibrary((v) => !v)}>
            {library ? "Đang áp dụng cho môn" : "Thư viện dùng chung"}
          </Button>
        </div>
        {library && (
          <Notice>
            Bộ quy tắc có thể được nhiều môn sử dụng. Nhân bản trước khi chỉnh
            sửa riêng; dùng Áp dụng để chọn phạm vi của môn này.
          </Notice>
        )}
        {!visibleRules.length && (
          <EmptyState
            title="Chưa có bộ quy tắc áp dụng"
            description="Chọn từ thư viện hoặc tạo bộ quy tắc rồi áp dụng cho đợt học, lớp hoặc mục tài liệu."
          />
        )}
        {visibleRules.map((raw) => {
          const r = normalizeRule(raw)

          return (
            <Card key={r.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <h2 className="text-[16px] font-semibold">{r.name}</h2>
                <Badge tone={r.status === "active" ? "brand" : "neutral"}>
                  {r.status === "active" ? "Đang áp dụng" : "Bản nháp"} · v
                  {r.version}
                </Badge>
              </div>

              {group === "Quy tắc nộp bài" ? (
                <p className="text-[14px]">
                  {r.documentType || "Tất cả loại tài liệu"} ·{" "}
                  {r.allowedFormats.join(" / ")} · {r.maxFileSizeMB} MB
                </p>
              ) : (
                <p className="text-[14px]">
                  {r.criteria?.filter((c) => c.enabled).length ?? 0} tiêu chí
                  bật ·{" "}
                  {r.criteria

                    ?.filter((c) => c.enabled)

                    .reduce((n, c) => n + c.maxScore, 0) ?? 0}{" "}
                  điểm · {r.documentType}
                </p>
              )}
              <p className="text-[14px] text-muted">
                {scope.ruleIds.has(r.id)
                  ? "Đang gán trong môn học"
                  : "Chưa áp dụng cho môn này"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditing(structuredClone(r))}
                  className="flex-1"
                >
                  {group === "Quy tắc nộp bài"
                    ? "Cấu hình nộp bài"
                    : "Chỉnh tiêu chí"}
                </Button>
                <MoreMenu
                  label={`Thao tác ${r.name}`}
                  items={[
                    { label: "Xem chi tiết", onSelect: () => setViewing(r) },

                    {
                      label: "Nhân bản",
                      onSelect: () => {
                        setLibrary(true)
                        setEditing({
                          ...structuredClone(r),
                          id: nextId("rule"),
                          name: r.name + " (bản sao)",
                          version: 1,
                          status: "draft",
                        })
                      },
                    },

                    ...(r.status === "active"
                      ? [{ label: "Áp dụng", onSelect: () => setAssigning(r) }]
                      : []),
                  ]}
                />
              </div>
            </Card>
          )
        })}
      </section>
      {editing && (
        <RuleSetEditor
          rule={editing}
          initialSection={group}
          onClose={() => setEditing(null)}
        />
      )}
      {assigning && (
        <Assignment
          rule={assigning}
          courseId={course.id}
          onClose={() => setAssigning(null)}
        />
      )}
      {viewing && (
        <Modal
          open
          title={viewing.name}
          onClose={() => setViewing(null)}
          footer={<Button onClick={() => setViewing(null)}>Đóng</Button>}
        >
          {ruleDescription(viewing.description) && (
            <p>{ruleDescription(viewing.description)}</p>
          )}
          <details>
            <summary>Quy trình &amp; điều kiện nộp</summary>
            <p>
              AI: {viewing.aiEnabled ? "Bật" : "Tắt"} · AI trước Giảng viên:{" "}
              {viewing.aiRequiredBeforeSupervisor ? "Bắt buộc" : "Tùy chọn"} ·
              Giảng viên: {viewing.supervisorApproval ? "Bắt buộc" : "Tùy chọn"}
            </p>
            <p>
              Prerequisite:{" "}
              {viewing.prerequisiteApproval ? "Bắt buộc" : "Không"} · Nộp lại:{" "}
              {viewing.resubmissionEnabled ? "Có" : "Không"} · Tối đa:{" "}
              {viewing.maxResubmissions ?? "∞"}
            </p>
            <p>
              Tệp: {viewing.allowedFormats.join(" / ")} ·{" "}
              {viewing.maxFileSizeMB} MB · SLA {viewing.reviewSlaDays} ngày
            </p>
            <p>
              Đạt ≥{viewing.passThreshold}% · Cần cải thiện ≥
              {viewing.improveThreshold}% · còn lại Cần làm lại. Điểm đề xuất
              không phải quyết định chính thức.
            </p>
          </details>
          {!viewing.criteria?.length && (
            <Notice>
              Chưa cấu hình bảng tiêu chí. Thêm tiêu chí để chạy Đánh giá AI.
            </Notice>
          )}
          {viewing.criteria?.map((c) => (
            <details key={c.id} className="border-b border-line pb-3">
              <summary>
                {c.name} · {c.maxScore}đ{c.critical ? " · Nghiêm trọng" : ""}
              </summary>
              <p>
                {c.maxScore} điểm · {c.enabled ? "Bật" : "Tắt"} ·{" "}
                {c.critical
                  ? "Nghiêm trọng"
                  : c.required
                    ? "Bắt buộc"
                    : "Thông thường"}
              </p>
              <p>{c.description}</p>
              <p>
                AI: {c.aiEnabled ? "Bật" : "Tắt"} · {c.instruction}
              </p>
              <p>
                Bằng chứng: {c.evidenceRequirement || "Giảng viên xác minh"}
              </p>
            </details>
          ))}
        </Modal>
      )}
    </div>
  )
}

function RuleSetEditor({
  rule,

  initialSection,

  onClose,
}: {
  rule: RuleSet

  initialSection: string

  onClose: () => void
}) {
  const [section, setSection] = useState(initialSection)

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
      <Notice>
        Bộ quy tắc dùng chung: lưu thay đổi tạo phiên bản mới cho các phạm vi
        đang gán. Nhân bản nếu chỉ muốn tùy chỉnh cho môn học này.
      </Notice>
      <PhaseTwoTabs
        id="rule-editor"
        tabs={["Quy tắc nộp bài", "Checklist & tiêu chí"]}
        active={section}
        onChange={setSection}
      />
      <section
        className="flex flex-col gap-3"
        role="tabpanel"
        id="rule-editor-panel-0"
        aria-labelledby="rule-editor-0"
        hidden={section !== "Quy tắc nộp bài"}
      >
        <p className="text-[14px] text-muted">
          Phiên bản {r.version} · Nhấn Lưu để áp dụng
        </p>
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
            <option value="draft">Bản nháp</option>
            <option value="active">Đang áp dụng</option>
          </select>
        </Field>
        <Field label="Loại tài liệu / phạm vi đánh giá">
          <TextInput
            value={r.documentType}
            onChange={(e) => set("documentType", e.target.value)}
          />
        </Field>
        <p className="text-[14px] text-muted">
          Gán cấu hình qua thao tác Áp dụng.
        </p>
        <h3 className="font-semibold">Quy trình đánh giá</h3>
        {([
          ["aiEnabled", "Bật Đánh giá AI"],

          ["aiRequiredBeforeSupervisor", "AI bắt buộc trước Giảng viên"],

          ["supervisorApproval", "Giảng viên bắt buộc phê duyệt"],

          ["prerequisiteApproval", "Yêu cầu duyệt tài liệu phụ thuộc"],

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
            onChange={(e) =>
              set("aiReview", e.target.value as "auto" | "manual")
            }
          >
            <option value="manual">Giảng viên bắt đầu</option>
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
        <Field label="Hạn đánh giá (ngày)">
          <TextInput
            type="number"
            value={r.reviewSlaDays}
            onChange={(e) => set("reviewSlaDays", Number(e.target.value))}
          />
        </Field>
      </section>
      <section
        className="flex flex-col gap-3"
        role="tabpanel"
        id="rule-editor-panel-1"
        aria-labelledby="rule-editor-1"
        hidden={section !== "Checklist & tiêu chí"}
      >
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
        <h3 className="font-semibold">Bảng tiêu chí đánh giá</h3>
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
              {c.name || "Tiêu chí mới"} · {c.maxScore}đ
              {c.critical ? " · Nghiêm trọng" : ""}
            </summary>
            <div className="flex flex-col gap-3 pt-3">
              <Field label="Mã tiêu chí">
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

                ["critical", "Nghiêm trọng"],

                ["evidenceRequired", "Bắt buộc có bằng chứng"],

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
              <Field label="Hướng dẫn đánh giá">
                <TextArea
                  value={c.instruction}
                  onChange={(e) => change(i, { instruction: e.target.value })}
                />
              </Field>
              <Field label="Yêu cầu bằng chứng">
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

function Assignment({
  rule,
  courseId,
  onClose,
}: {
  rule: RuleSet
  courseId: string
  onClose: () => void
}) {
  const cfg = useManagement()

  const scope = courseRuleScope(courseId, cfg)

  const [offeringId, setOffering] = useState("")

  const [classId, setClass] = useState("")

  const [itemId, setItem] = useState("")

  const offering = scope.offerings.find((o) => o.id === offeringId)

  const classes = scope.classes.filter(
    (c) =>
      c.offeringId === offeringId ||
      (!c.offeringId && c.semesterId === offering?.semesterId),
  )

  const cls = classes.find((c) => c.id === classId)

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
              if (
                !offering ||
                (classId && !cls) ||
                (itemId && !items.some((i) => i.id === itemId))
              )
                return

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
      <Field label="Môn học trong học kỳ">
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
          {scope.offerings.map((o) => (
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
          <option value="">
            Mặc định của đợt học (giữ cấu hình riêng của lớp)
          </option>
          {classes

            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — cấu hình riêng của lớp
              </option>
            ))}
        </select>
      </Field>
      <Field label="Mục bài thực hành">
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
        Mục tài liệu ưu tiên cao nhất. Lớp có nội dung riêng không đổi khi gán ở
        đợt học. Cấu hình và kết quả bản nộp trước giữ nguyên.
      </Notice>
    </Modal>
  )
}
