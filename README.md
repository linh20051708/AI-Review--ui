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
