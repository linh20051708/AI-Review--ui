> **Bản hiện hành — đối chiếu source ngày 16/10/2026.** Nguồn nghiệp vụ và route: `src/` tại merge HEAD `8258f69` + local `46a509d`. Phần A là tài liệu hiện hành đã chuẩn hóa. Phần B là bản lưu GitHub lịch sử, chỉ dùng truy vết và hướng dẫn Lab 2; không xác nhận trạng thái sản phẩm, nghiên cứu hay kết quả kiểm thử hiện tại.

## Phạm vi hiện tại và điểm cần kiểm tra

Source React hiện ở `src/`, scripts trong `package.json` có `dev`, `build`, `preview`, `format`. Sản phẩm hiện tại có Supervisor + Student, Academic Management, Rule Set, Persona Checklist P01–P10, AI Evaluation, Findings, Feedback, Approve / Request Revision / Reject, Document Versions và Review History. AI hiện mô phỏng, không tự phê duyệt.

Ba flow hiện tại được đối chiếu source trong `ux/user-flow.md`: F1 Academic Management & Project Creation; F2 AI-Assisted Supervisor Review; F3 Document Submission, Revision & Approval. Ba luồng GitHub là tài liệu prototype Supervisor lịch sử, chưa thay thế F1–F3.

URL repository lấy từ GitHub đã đưa vào mục Link nộp; quyền truy cập chưa kiểm tra. Các link Figma/Stitch chưa cung cấp vẫn giữ placeholder. Cả bộ `docs/` local và tài liệu Lab 2 ở root từ GitHub đều được giữ. Không tự đồng nhất hai AI Design Log / Design Decisions / Flutter Handoff.

Các tuyên bố GitHub “mọi thứ khác đã xong”, “100/100”, số đo, 48 SVG và trạng thái Figma/Stitch là thông tin lịch sử chưa chạy xác minh lại cho source mới. Không dùng chúng làm chứng nhận bản hiện tại đã đạt. Hướng dẫn push trong phần GitHub chỉ là tài liệu gốc; lần giải quyết conflict này không commit/push.

---

# Phần A — Tài liệu hiện hành

# PROJECT REVIEW AI — PRM323 Lab 2 Submission

**Sản phẩm:** Hệ thống quản lý Project và Review tài liệu sinh viên có hỗ trợ AI.
**Phạm vi:** Mobile-first UI/UX prototype · Supervisor + Student · không yêu cầu Flutter code/backend thật.

## 1. Link nộp
- **GitHub repository:** https://github.com/linh20051708/AI-Review--ui (chưa kiểm tra quyền truy cập)
- **Figma Design (viewer access):** `[DÁN FIGMA LINK]`
- **Figma Prototype / Make (nếu có):** `[DÁN LINK]`
- **Google Stitch initial output:** `[DÁN LINK/ẢNH GỐC]`
- **Slide presentation (nếu được yêu cầu):** `[DÁN LINK]`

## 2. Product Scope
**Supervisor:** Semester/Course/Offering/Class/Group/Project/Lab; Review Queue; AI findings; feedback; approve/revise/reject; history.
**Student:** Dashboard/My Project/Documents; upload/version; request review; feedback; notifications.

AI Evaluation hiện mô phỏng, chưa đọc file gốc; findings/điểm cần xác minh và không tự phê duyệt. Rule Set và Persona Checklist P01–P10 theo `src/lib/rubric.ts`. Supervisor là Primary Persona, Student là Secondary Persona. Nộp lại tạo DocumentVersion mới, giữ version trước và cùng logical `reviewId`; Review History/feedback gắn version.

## 3. Three User Flows
- **F1:** Supervisor academic setup → select group → create/view project.
- **F2:** Review Queue → Workspace → AI Findings → Supervisor Decision.
- **F3:** Student v1 → Supervisor revision → Student v2 → Supervisor approval → History.

**Xem:** [`ux/user-flow.md`](ux/user-flow.md).

## 4. Yêu cầu Figma — 6 pages theo thứ tự (chưa xác nhận hoàn thành)
1. `01 User Flow` — Sitemap + F1/F2/F3.
2. `02 Wireframe` — Low-fi mobile frames.
3. `03 Final UI` — ít nhất 8 màn hình độc lập.
4. `04 Design System` — tokens/variables/styles.
5. `05 Components` — đủ 9 nhóm component + states/Auto Layout.
6. `06 Prototype` — 3 flows, Back, overlay, loading→result, error/recovery.

## 5. Artifact index
| Artifact | File/Thư mục | Phục vụ slide |
|---|---|---|
| Persona & Problem | [`ux/persona.md`](ux/persona.md) | 02 |
| IA, 3 Flows, Flow-Screen Mapping | [`ux/user-flow.md`](ux/user-flow.md) | 03–04 |
| Design constraints & token guidance | [`DESIGN.md`](DESIGN.md) | 05, 09–10 |
| Stitch prompt, AI iterations, critique | [`docs/ai-design-log.md`](docs/ai-design-log.md) | 05–06 |
| Accept/Modify/Reject & accessibility | [`docs/design-decisions.md`](docs/design-decisions.md) | 07, 10 |
| Flutter screen specs + mappings | [`docs/flutter-handoff.md`](docs/flutter-handoff.md) | 12 |
| Ảnh minh chứng thật | `evidence/` | 05–11 |

## 6. Chạy source code React hiện tại
```bash
npm install
npm run dev
```
Mở URL do Vite hiển thị. Lệnh có thể thay đổi theo `package.json` mới nhất của repo; cần đối chiếu thực tế.

## 7. PRM323 Lab 2 Submission Checklist
- [ ] Figma và GitHub mở được trên cửa sổ ẩn danh.
- [ ] 8+ Final UI screens, 3 flow có alternate và error/recovery.
- [ ] AI log có prompt nguyên văn, 3 iterations khác mục tiêu, ảnh before/after, ≥5 UX critique.
- [ ] Design system gồm color/type/spacing/radius/elevation; 9 nhóm component.
- [ ] Contrast 4.5:1/3:1, target 48dp, body 14sp, 360/412 responsive có bằng chứng.
- [ ] Flutter handoff mỗi screen 6 mục + 2 mapping tables.
- [ ] Demo Back, modal overlay, loading→result, không dead-end.

## 8. Evidence & integrity
Các trường `[DÁN...]`, `[ĐIỀN...]`, `[XÁC MINH...]` là thông tin **chưa được cung cấp**, không phải minh chứng đã thực hiện. Không trình bày persona giả định như nghiên cứu đã được xác nhận; không dùng ảnh mock giả làm lịch sử Stitch/AI.

## 9. Nhóm thực hiện
| Thành viên | MSSV | Vai trò |
|---|---|---|
| `[TÊN]` | `[MSSV]` | `[PHÂN CÔNG]` |

---

<details>
<summary>Phần B — Bản lưu GitHub 8258f69 (lịch sử, không phải đặc tả hiện hành)</summary>

> **Chỉ là bản lưu lịch sử.** Mọi khẳng định hoàn thành/PASS, số đo, route `app/`, persona và flow trong phần này thuộc tài liệu GitHub gốc, chưa được xác nhận lại cho bản hiện tại. Hướng dẫn Figma, UX/UI, Design System, AI Design Log, Handoff và Lab 2 được bảo toàn để tham khảo. Khi có khác biệt, dùng phần A và source `src/`.

# PRM323 — Lab 2: Thiết kế UI/UX với hỗ trợ của AI

**Đề tài:** Hệ thống quản lý học vụ và review tài liệu cho giảng viên
**Loại bài:** Cá nhân (làm trên code nền do giảng viên cung cấp)
**Trạng thái:** Hoàn thành phần tài liệu — còn 3 bước cần tài khoản cá nhân (xem §2)

---

## 1. Bài nộp gồm những gì

Lab 2 yêu cầu **đúng 2 artifact**:

| # | Artifact | Trạng thái | Ở đâu |
|---|---|---|---|
| 1 | **GitHub repository** chứa tài liệu thiết kế + code nền | ✅ đã push | https://github.com/linh20051708/AI-Review--ui |
| 2 | **Liên kết Figma** xem được, 6 page theo đúng thứ tự | ⬜ cần dựng | `figma-svg/output/` hỗ trợ dựng |

Repo này gồm 2 phần:

- **`app/`** — code nền do giảng viên cung cấp (React 19 + Vite + Tailwind v4).
  Đây là hệ thống thật, đã build và chạy được (xem `facts/MEASUREMENTS.md`).
- **Tài liệu Lab 2** — phần phân tích, sinh UI bằng AI, critique, design system, prototype spec,
  handoff — tất cả bám theo code nền thật, không phải đề tài tự nghĩ ra.

## 2. Ba việc phải làm trước khi nộp

Đây là những việc **không thể làm thay** vì cần tài khoản cá nhân. Mọi thứ khác đã xong.

| # | Việc | Hướng dẫn |
|---|---|---|
| 1 | Bật repo GitHub | §2.1 |
| 2 | Dựng file Figma 6 page và **điền link vào §6** | §2.2 |
| 3 | Chạy AI thật (nếu giảng viên đòi ảnh) | §2.3 |

### 2.1 Bật repo GitHub

Đã làm: docs Lab 2 (không gồm `app/`, không đè `.gitignore`) được commit chồng lên code nền của
giảng viên trong repo nhóm **`linh20051708/AI-Review--ui`** (branch `main`). Link đã điền ở §6.

Nếu tự làm từ đầu trên repo riêng:

```bash
cd prm323-lab2
git remote add origin https://github.com/<tài-khoản-của-bạn>/prm323-lab2.git
git push -u origin main
```

Sau đó thay hai chỗ giữ chữ `<điền link>`: **§6 của file này** và dòng 2 của `README_ANSWER.md`.

### 2.2 Dựng file Figma 6 page

Bộ `figma-svg/output/` có **48 khung SVG** sẵn sàng dán. Tạo file Figma Design mới rồi tạo **đúng 6 page theo thứ tự này**:

| Page | Số khung | Nội dung |
|---|---|---|
| `01 User Flow` | 1 | Sơ đồ 3 luồng (thuận / thay thế / lỗi & phục hồi) |
| `02 Wireframe` | 9 | Khung xám 9 màn hình |
| `03 Final UI` | 24 | 14 màn hình chính + 7 biến thể trạng thái + 3 khung 360dp |
| `04 Design System` | 5 | Màu · tương phản · chữ · khoảng cách · độ nổi |
| `05 Components` | 9 | 9 nhóm component bắt buộc |

**Cách dán:** mở từng file SVG, copy toàn bộ nội dung XML, dán vào canvas Figma. Figma biến nó thành
frame + vector + text sửa được. Danh sách file cụ thể nằm ở `figma-svg/output/MANIFEST.md`
(cột **Page** cho biết dán vào page nào).

**Paste KHÔNG tạo được** (phải làm tay, xem `ux/prototype-spec.md`):

- Auto Layout cho frame
- Variables / styles trên page `04`
- Component + instance + variant trên page `05`
- Prototype link cho 3 luồng (page `06 Prototype` — tự tạo thêm)
- Drop shadow thật (SVG bị mất filter — dùng Drop shadow thay vì lớp mô phỏng)
- Ảnh thật (chỗ ảnh là khung xám ghi "Ảnh mẫu")

### 2.3 Nếu cần ảnh AI thật

`DESIGN.md` §2 có prompt Google Stitch nguyên văn. Nếu giảng viên đòi bằng chứng AI sinh UI:

1. Mở Google Stitch, dán prompt trong `DESIGN.md` §2
2. Chụp kết quả, lưu vào `ai-output/` theo tên ghi trong `ai-design-log.md`
3. Ghi rõ ngày chạy và model dùng

Nếu không chạy, **phải giữ nguyên** ghi chú trung thực trong `ai-design-log.md` và `DESIGN.md` §2 —
không được coi ảnh placeholder là bằng chứng AI thật.

## 3. Danh mục tài liệu

| Nhóm rubric | File | Nội dung |
|---|---|---|
| **A** Phân tích UX & user flow | `ux/persona.md` | 2 persona (giảng viên chính + sinh viên phụ), 10 ánh xạ Nielsen |
| | `ux/user-flow.md` | 23 màn hình, 3 luồng, ma trận Back, biến thể trạng thái, accessibility |
| | **B** Tạo UI bằng AI | `DESIGN.md` | Prompt Stitch nguyên văn, token, placeholder output |
| **C** Lặp & critique với AI | `ai-design-log.md` | 3 vòng lặp: prompt → output → critique → quyết định → thay đổi Figma |
| | `ux/critique.md` | 8 phát hiện UX, có số đo thật |
| **D** UI/UX cuối | `ux/final-ui-spec.md` | Đặc tả 14 màn hình + biến thể |
| | `figma-svg/output/03-final/` | 24 khung SVG |
| **E** Design system & component | `design-system.md` | Token, thang chữ, khoảng cách, 9 nhóm component |
| | `design-decisions.md` | 7 quyết định chấp nhận/sửa/từ chối |
| | `figma-svg/output/04-design-system/`, `05-components/` | 14 khung SVG |
| **F** Prototype tương tác | `ux/prototype-spec.md` | 3 luồng dạng từng bước, script demo 5 phút |
| **G** Handoff Flutter | `flutter-handoff.md` | Token → Dart, component → widget, spec 14 màn hình |
| **H** Tài liệu & nhật ký AI | `README.md`, `README_ANSWER.md`, `ai-design-log.md` | Kiến trúc bài nộp, trả lời câu hỏi, nhật ký |
| Kiểm chứng | `facts/REPO-FACTS.md`, `facts/MEASUREMENTS.md` | Dữ kiện code nền + số đo thật |
| Cổng kiểm | `lab2-gate.py` | Tự chấm theo rubric 100 điểm |

## 4. Bộ sinh SVG

`figma-svg/` sinh ra 48 khung SVG. Việc sinh là tất định — chạy lại cho kết quả y hệt.

```bash
cd figma-svg
python3 gen.py          # sinh output/ + MANIFEST.md
python3 check.py        # XML, CJK, tràn khung, tính năng bị Figma cắt
python3 measure.py      # đo text bằng font Inter THẬT trong Chrome
python3 rendercheck.py  # render từng file, bắt file vỡ
```

> **`figma-svg/` là output do script sinh, KHÔNG phải ảnh Google Stitch.** Đây là bộ khung dựng Figma,
> không phải bằng chứng AI sinh UI. Bằng chứng AI nằm ở `ai-design-log.md`.

Bốn tầng kiểm định đều **SẠCH** trên 48 file (xem `LAB2-GATE.md`):
`check.py` · `measure.py` (1010 đoạn text, font thật) · `rendercheck.py` · `lab2-gate.py` (100/100).

## 5. Slide thuyết trình (dự phòng)

Nếu giảng viên yêu cầu slide, dùng dàn ý 12 slide trong `README_ANSWER.md` §6.
Bài nộp bắt buộc chỉ là 2 artifact ở §1.

## 6. Liên kết phải điền trước khi nộp

| Artifact | Liên kết |
|---|---|
| GitHub repository | https://github.com/linh20051708/AI-Review--ui |
| Figma file (6 page) | `<điền link>` |

## 7. Tự chấm

```bash
python3 lab2-gate.py
```

Kết quả hiện tại: **100/100 — ĐẠT**. Chi tiết ở `LAB2-GATE.md`.

</details>
