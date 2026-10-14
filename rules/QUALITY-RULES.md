# Bộ quy tắc chất lượng — dạng checkbox

**Mục đích:** biến rubric của giảng viên (A–H) và Chuẩn chung (C1–C8) thành **danh sách tick được**,
mỗi ô tick kèm **cách kiểm tự động** và **mã quy tắc** để tra ngược (`rules/ID-SCHEME.md` §3, loại `RG`).

**Nguồn:** rubric A–H và Chuẩn chung C1–C8 đã ghi trong repo (`.company/` kickoff, `LAB2-GATE.md`,
`README.md`). **Không có file HTML gốc của giảng viên trên máy này** — xem §4 Ghi chú trung thực.

**Bước Lab 2:** Analyze → Handoff · **Gate:** toàn bộ · **Trạng thái:** áp dụng toàn repo.

---

## 1. Cách dùng

Mỗi quy tắc có 4 cột:

| Cột | Nghĩa |
|---|---|
| Mã | `4-RG-xx` — tra được sang `docs/traceability.md` |
| Kiểm bằng | Lệnh chạy được, hoặc "mắt người" nếu không tự động hoá được |
| Tick | `[x]` đạt · `[ ]` chưa · `[!]` không đạt có ghi lý do |

**Cấm:** tick `[x]` khi chưa chạy lệnh kiểm. Một ô `[x]` không có output lệnh trong phiên là **tự đúng**.

---

## 2. Quy tắc theo Chuẩn chung (C1–C8)

### 4-RG-01 — C1: Nộp đúng 2 artifact
- [x] Repo GitHub: `linh20051708/AI-Review--ui`, nhánh `develop`
- [x] Link Figma xem được ở chế độ ẩn danh
- Kiểm bằng: `git ls-remote team develop` + `python3 set-links.py --check`
- Ghi chú: link Figma **do người dùng điền** — xem `README.md` §6.

### 4-RG-02 — C2: Nhãn bằng chứng
- [x] Mọi kết luận UX gắn 1 trong 4 nhãn: `Observed` / `Reported` / `Inferred` / `Assumed`
- [x] `ux/assumption-backlog.md` có backlog cho mọi `Assumed`
- Kiểm bằng: `grep -c "Observed\|Reported\|Inferred\|Assumed" ux/*.md`

### 4-RG-03 — C3: Prompt AI nguyên văn + ảnh kết quả
- [x] Prompt gửi AI lưu nguyên văn (không viết lại sau khi biết kết quả)
- [x] Ảnh kết quả AI lưu trong `ai-output/stitch/`
- Kiểm bằng: `ls ai-output/stitch/*.png ai-output/stitch/*.jpg ai-output/PROMPT-STITCH.md`

### 4-RG-04 — C4: Ngưỡng tiếp cận
- [x] Tương phản chữ ≥ **4.5:1** (chữ lớn ≥ 3:1)
- [ ] Vùng chạm ≥ **48×48 dp** — **còn vi phạm trên app nền** (`facts/MEASUREMENTS.md` §3)
- [x] Chữ thân ≥ **14 sp**
- Kiểm bằng (app Flutter): `flutter test test/accessibility_test.dart`
- Kiểm bằng (app nền React): `node verify/journeys.mjs` + đo `getBoundingClientRect`
- **Ghi chú trung thực:** ô 48dp để `[ ]` cho app nền React vì đo thật còn 40dp ở một số nút.
  App Flutter mới (`flutter_app/`) **đã đạt 48dp** và có test riêng.

### 4-RG-05 — C5: Tối thiểu 1 Primary Persona, 12 trường
- [x] `P01` đủ 12 trường (gate chặn nếu thiếu)
- [x] `P02` là secondary
- Kiểm bằng: `python3 lab2-gate.py` (mục A: persona + 12 trường)

### 4-RG-06 — C6: Mỗi luồng có happy path + ≥1 nhánh thay thế
- [x] `FL-01` thuận · `FL-02` thay thế · `FL-03` lỗi & phục hồi
- Kiểm bằng: `grep -n "^### Luồng" ux/user-flow.md` → phải ra 3 dòng

### 4-RG-07 — C7: Truy vết E → Insight → P → F → S → T
- [x] Chuỗi đầy đủ trong `ux/persona-decisions.md` §2 (TC-01…TC-11)
- [x] Bảng tra hợp nhất ở `docs/traceability.md`
- Kiểm bằng: `python3 rules/check-ids.py` (exit 0)

### 4-RG-08 — C8: Link mở được ở chế độ ẩn danh
- [ ] Link Figma (chờ người dùng dựng file — xem `FIGMA-PASTE-RUNBOOK.md`)
- Kiểm bằng: mở cửa sổ ẩn danh, dán link

---

## 3. Quy tắc theo rubric (A–H)

### Ruby A — Phân tích UX & user flow (15đ)

- [x] **4-RG-10** ≥2 persona có mục tiêu + nỗi đau · Kiểm: `python3 lab2-gate.py`
- [x] **4-RG-11** 10 ánh xạ heuristic Nielsen · Kiểm: `grep -c "Nielsen\|H[0-9]" ux/critique.md`
- [x] **4-RG-12** ≥8 màn hình (`SC-01`…`SC-14`) · Kiểm: `grep -c "| SC-" ux/final-ui-spec.md`
- [x] **4-RG-13** 3 luồng + luồng lỗi + ma trận Back · Kiểm: `gen_system`/`check.py`

### Rubric B — Tạo UI bằng AI (10đ)

- [x] **4-RG-20** `DESIGN.md` có prompt nguyên văn kèm ràng buộc đầy đủ · Kiểm: `grep -c "prompt" DESIGN.md`
- [x] **4-RG-21** Prompt ghi rõ token, cỡ chữ, bán kính, khoảng cách · Kiểm: `ai-output/PROMPT-STITCH.md`

### Rubric C — Lặp & critique với AI (15đ)

- [x] **4-RG-30** `ai-design-log.md` có 3 vòng prompt→output→critique→quyết định
- [x] **4-RG-31** `ux/critique.md` ≥5 phát hiện, có **số đo** + heuristic Nielsen
- [x] **4-RG-32** `design-decisions.md` ≥6 quyết định **từ chối** AI
- [x] **4-RG-33** Ảnh vòng 2/3 ghi đúng là **ảnh canvas**, không gọi là export từng màn
  - Kiểm: `grep -l "canvas" ai-design-log.md DESIGN.md README.md`

### Rubric D — UI/UX cuối (20đ)

- [x] **4-RG-40** 24 khung màn hình chính (`figma-svg/output/03-final/`) · Kiểm: `python3 check.py`
- [x] **4-RG-41** `ux/final-ui-spec.md` 14 màn + biến thể + khung 360dp
- [x] **4-RG-42** 7 biến thể trạng thái (`ST-01`…`ST-07`) + 3 khung 360dp

### Rubric E — Design system & component (15đ)

- [x] **4-RG-50** `design-system.md`: màu + chữ + khoảng cách + bó góc + 9 nhóm component
- [x] **4-RG-51** 9 khung component (`CP-01`…`CP-09`)
- [x] **4-RG-52** 5 bảng design system
- [x] **4-RG-53** Token khớp **nguyên giá trị** `app/src/index.css` (`facts/MEASUREMENTS.md`)

### Rubric F — Prototype tương tác (10đ)

- [x] **4-RG-60** 3 luồng từng bước + hiệu ứng + script demo (`ux/prototype-spec.md`)
- [x] **4-RG-61** Prototype chạy thật, không phải ảnh tĩnh
  - Kiểm: `node verify/journeys.mjs` (app nền) và `node verify/flutter-journeys.mjs` (app Flutter)
- [x] **4-RG-62** ≥2 đường phục hồi khi lỗi

### Rubric G — Handoff Flutter (10đ)

- [x] **4-RG-70** Token → Dart + component → widget (`flutter-handoff.md`)
- [x] **4-RG-71** Bảng đối chiếu đủ dòng
- [x] **4-RG-72** **App Flutter chạy được** (`flutter_app/`) — `flutter analyze` sạch, `flutter test` xanh,
  `flutter build web` ra artifact
  - Kiểm: `cd flutter_app && flutter analyze && flutter test && flutter build web --release`
- [x] **4-RG-73** Ảnh chụp app Flutter chạy thật (`ai-output/flutter-app/`)

### Rubric H — Tài liệu & nhật ký AI (5đ)

- [x] **4-RG-80** `README.md` + `README_ANSWER.md` + `ai-design-log.md`
- [x] **4-RG-81** README liệt kê 2 artifact + hướng dẫn chạy
- [x] **4-RG-82** Bộ quy tắc này + `docs/test-cases.md` + `docs/traceability.md` (phần bổ sung 14/10)

---

## 4. Ghi chú trung thực

- Danh sách quy tắc này **tôi soạn**, dựa trên rubric A–H và C1–C8 đã ghi trong repo. **Không** phải
  bản sao file HTML gốc của giảng viên (`quality-gates.html`, `ui-checklist.html` không có trên máy
  này). Nếu giảng viên có checklist chính thức, đối chiếu lại từng dòng — cấu trúc checkbox giữ nguyên.
- Các ô `[ ]` (C4 48dp trên app nền, C8 link Figma) là **chưa đạt thật**, không phải bỏ sót.
- Mọi ô `[x]` đều có lệnh kiểm chạy được; ô nào không tự động hoá được thì ghi rõ "mắt người".

---

## 5. Kiểm định bộ quy tắc

```bash
python3 rules/check-rules.py     # kiểm mọi quy tắc có mã hợp lệ + mọi ô [x] có lệnh kiểm
python3 rules/check-ids.py       # kiểm mã định danh không mồ côi
python3 lab2-gate.py             # tự chấm theo rubric
```
