# PRM323 — Lab 2: Thiết kế UI/UX với hỗ trợ của AI

**Đề tài:** Hệ thống quản lý học vụ và review tài liệu cho giảng viên
**Loại bài:** Cá nhân (làm trên code nền do giảng viên cung cấp)
**Trạng thái:** Hoàn thành phần tài liệu — còn 3 bước cần tài khoản cá nhân (xem §2)

---

## 1. Bài nộp gồm những gì

Lab 2 yêu cầu **đúng 2 artifact** (bài nộp chỉ có 2 thứ này; `flutter_app/` là phần minh hoạ kèm theo,
không phải artifact thứ ba):

| # | Artifact | Trạng thái | Ở đâu |
|---|---|---|---|
| 1 | **GitHub repository** chứa tài liệu thiết kế + code nền | ✅ đã push | https://github.com/linh20051708/AI-Review--ui |
| 2 | **Liên kết Figma** xem được, 6 page theo đúng thứ tự | ⬜ cần dựng | `figma-svg/output/` hỗ trợ dựng |

Repo này gồm 2 phần:

- **`app/`** — code nền do giảng viên cung cấp (React 19 + Vite + Tailwind v4).
  Đây là hệ thống thật, đã build và chạy được (xem `facts/MEASUREMENTS.md`).
- **Tài liệu Lab 2** — phần phân tích, sinh UI bằng AI, critique, design system, prototype spec,
  handoff — tất cả bám theo code nền thật, không phải đề tài tự nghĩ ra.
- **`flutter_app/`** — app Flutter **chạy được**, viết mới trong Lab 2 để minh hoạ phần handoff (mục G).
  Đây **không** phải code của giảng viên; nó port **13 màn + 1 banner dùng chung** từ `app/` sang Flutter, dùng đúng token
  trong `app/src/index.css`, dữ liệu chép từ `app/src/data/mockData.ts`, **không có backend**.
- **`rules/` + `docs/`** — bộ quy tắc chất lượng dạng checkbox, cơ chế đặt mã định danh kiểu SKU,
  kiến trúc tài liệu theo tầng, use case / user story, test case và bảng truy vết.

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

### 2.3 Ảnh AI thật — ĐÃ CÓ

Prompt Google Stitch nguyên văn ở `DESIGN.md` §2 đã được chạy ngày **2026-10-14**.
Stitch sinh 5 màn hình, xuất kèm HTML + design token:

| Nơi lưu | Nội dung |
|---|---|
| `ai-output/stitch/loop1-before-0*.png` | 5 ảnh màn hình AI sinh lần đầu |
| `ai-output/stitch/loop2-after-0*.jpg` | 3 ảnh vòng 2 — AI sửa theo token dự án |
| `ai-output/stitch/loop3-after-0*.jpg` | 2 ảnh vòng 3 — yêu cầu ≥48dp touch target |
| `ai-output/stitch/LOOP3-EVIDENCE.md` | Trích nguyên văn prompt + accessible name 48dp vòng 3 |
| `ai-output/stitch/html/*.html` | Mã HTML 5 màn Stitch sinh |
| `ai-output/stitch/STITCH-DESIGN-TOKENS.md` | Token Stitch xuất kèm |

**Phải nói rõ khi bảo vệ:** vòng 1 Stitch tự chọn bảng màu tím `#4F46E5` + font Newsreader/Hanken
Grotesk, **khác** design system dự án (`#146B55`, Inter). Vì vậy kết quả vòng 1 là **đầu vào của vòng
critique**, không phải bản cuối. Vòng 2, sau khi gõ lại prompt chỉ đích danh `#146B55` + Inter, Stitch
dựng design system mới **Academic Review System** đúng token dự án — xem 3 ảnh `loop2-after-*.jpg`.
Bản cuối nộp là `figma-svg/output/03-final/` (script sinh theo token dự án).

> **`figma-svg/` là output do script sinh, KHÔNG phải ảnh Google Stitch.** Hai nguồn khác nhau, ghi rõ
> để không nhầm. Vòng 3 (≥48dp touch target) đã chạy và có ảnh: `loop3-after-0*.jpg` + `LOOP3-EVIDENCE.md`.

## 3. Danh mục tài liệu

| Nhóm rubric | File | Nội dung |
|---|---|---|
| **A** Phân tích UX & user flow | `ux/persona.md` | 2 persona (giảng viên chính + sinh viên phụ), problem statement, 12 trường lõi, 10 ánh xạ Nielsen, nhãn Assumed |
| | `ux/user-flow.md` | 23 màn hình, 3 luồng (F01–F03), ma trận Back, biến thể trạng thái, accessibility, mã định danh C7 |
| | `ux/stakeholder-map.md` | Stakeholder/User Map, người dùng dễ bị bỏ sót, ma trận quyền hạn |
| | `ux/affinity-board.md` | Affinity Board 5 cụm theo hành vi/nỗi đau, có mã bằng chứng |
| | `ux/persona-coverage-matrix.md` | Ma trận archetype × tác vụ × rào cản × evidence |
| | `ux/persona-decisions.md` | Ma trận Persona → Need → UI decision → Test + chuỗi truy vết E→P→F→S→T |
| | `ux/assumption-backlog.md` | Giả định 4 nhãn C2 (Observed/Reported/Inferred/Assumed) + research backlog |
| | `ux/research-plan.md` | Kế hoạch phỏng vấn/quan sát (chưa thực hiện — ghi rõ) |
| | `ux/use-cases.md` | 17 use case (`1-UC-xx`) suy từ 23 route thật, 4 đặc tả đầy đủ |
| | `ux/user-stories.md` | 14 user story 3C (`1-US-xx`), nghiệm thu dạng Given-When-Then |
| **B** Tạo UI bằng AI | `DESIGN.md` | Prompt Stitch nguyên văn, token, 5 ảnh AI thật vòng 1 + 3 ảnh vòng 2 ở `ai-output/stitch/` |
| **C** Lặp & critique với AI | `ai-design-log.md` | 3 vòng lặp: prompt → output → critique → quyết định → thay đổi Figma |
| | `ux/critique.md` | 8 phát hiện UX, có số đo thật |
| **D** UI/UX cuối | `ux/final-ui-spec.md` | Đặc tả 14 màn hình + biến thể |
| | `figma-svg/output/03-final/` | 24 khung SVG |
| **E** Design system & component | `design-system.md` | Token, thang chữ, khoảng cách, 9 nhóm component |
| | `design-decisions.md` | 7 quyết định chấp nhận/sửa/từ chối |
| | `figma-svg/output/04-design-system/`, `05-components/` | 14 khung SVG |
| **F** Prototype tương tác | `ux/prototype-spec.md` | 3 luồng dạng từng bước, script demo 5 phút |
| **G** Handoff Flutter | `flutter-handoff.md` | Token → Dart, component → widget, spec 14 màn hình |
| | `flutter_app/` | **App Flutter chạy được** (13 màn, phủ đủ 14/14 US), `flutter analyze` sạch, `flutter test` **48/48** xanh |
| | `ai-output/flutter-app/` | **ảnh** chụp app Flutter chạy thật, tên file gắn mã TC (`TC_USxx_*`); thêm `verify/flutter-tap-targets.mjs` đo 77 vùng chạm / 8 màn, 0 mục < 48dp |
| | `rules/check-trace-map.py` | Cổng kiểm bảng truy vết dọc trỏ tới file có thật |
| | `rules/check-commit-msg.py`, `rules/install-hooks.py` | Cưỡng chế commit theo mã SKU |
| **Bổ sung 14/10** | `rules/QUALITY-RULES.md` | Bộ quy tắc chất lượng dạng **checkbox** (rubric A–H + C1–C8) |
| | `rules/ID-SCHEME.md` | Cơ chế đặt mã định danh kiểu SKU (4 tầng, 15 loại) |
| | `docs/ARCHITECTURE-LAYERS.md` | Kiến trúc tài liệu theo tầng, biết thông tin ở cấp mấy |
| | `docs/test-cases.md` | **22 test case** sinh từ use case + user story, có phân loại và mức bao phủ |
| | `docs/traceability.md` | Bảng truy vết hợp nhất (C7) + đối chiếu mã cũ ↔ mới |
| | `rules/check-*.py` | 3 cổng kiểm: mã định danh · truy vết · tầng/folder + cổng tổng |
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

> **`figma-svg/` là output do script sinh, KHÔNG phải ảnh Google Stitch.** Đây là bộ khung dựng Figma.
> Bằng chứng AI thật nằm ở `ai-output/stitch/` (5 ảnh PNG vòng 1 + 3 ảnh JPG vòng 2 + HTML + token,
> Stitch xuất 2026-10-14) và
> `ai-design-log.md`.

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
