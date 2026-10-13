# FIGMA PASTE RUNBOOK — dựng 6 page từ 48 SVG có sẵn

Mục tiêu: tạo 1 file Figma Design, có đúng 6 page theo thứ tự, dán 48 khung SVG,
rồi làm tay các phần paste không tạo được. Xong thì copy link (chế độ xem ẩn danh)
vào README §6 và README_ANSWER dòng 2.

## 0. Chuẩn bị
- Mở `figma.com` → New design file.
- Đổi tên 6 page (tab trái) đúng thứ tự:
  `01 User Flow` · `02 Wireframe` · `03 Final UI` · `04 Design System` · `05 Components` · `06 Prototype`
- Các file SVG nằm ở `figma-svg/output/`. Mở bằng editor văn bản, copy toàn bộ XML.

## 1. Dán từng khung (Cmd+V trên canvas Figma)
Figma biến SVG thành frame + vector + text sửa được. Sau khi dán, kéo frame
về toạ độ X,Y ghi dưới đây (panel bên phải) để không chồng nhau.

### Page `01 User Flow` (1 khung)
- `user-flow-supervisor.svg` → `100, 100` (1760×1180)

### Page `02 Wireframe` (9 khung — hàng 1 Y=100, hàng 2 Y=1072)
- wf-01-dang-nhap → 100,100
- wf-02-tong-quan → 592,100
- wf-03-yeu-cau-review → 1084,100
- wf-04-khong-gian-review → 1576,100
- wf-05-ket-qua-ai → 2068,100
- wf-06-lop-hoc → 2560,100
- wf-07-project → 100,1072
- wf-08-tai-lieu → 592,1072
- wf-09-hoc-ky → 1084,1072

### Page `03 Final UI` (24 khung — 4 hàng Y=100 / 1072 / 2044 / 3016)
Hàng 1 (Y=100): r360-s02-tong-quan 100 · r360-s03-yeu-cau 540 · r360-s07-project 980 · s01-dang-nhap 1420 · s02-tong-quan 1912 · s03-yeu-cau-review 2404
Hàng 2 (Y=1072): s04-khong-gian-review 100 · s05-ket-qua-ai 592 · s06-lop-hoc 1084 · s07-project 1576 · s08-tai-lieu 2068 · s09-hoc-ky 2560
Hàng 3 (Y=2044): s10-rule-set 100 · s11-sinh-vien 592 · s12-nhom 1084 · s13-thong-bao 1576 · s14-tai-khoan 2068 · v-s02-offline 2560
Hàng 4 (Y=3016): v-s03-empty 100 · v-s03-error 592 · v-s03-loading 1084 · v-s04-decision 1576 · v-s04-unavailable 2068 · v-s05-running 2560

### Page `04 Design System` (5 khung — hàng Y=100)
- ds-colors → 100,100 (1180×1000)
- ds-contrast → 1360,100
- ds-elevation → 2620,100
- ds-spacing → 3880,100
- ds-typography → 5140,100

### Page `05 Components` (9 khóm — 2 hàng Y=100 / 820)
Hàng 1 (Y=100): comp-appbar 100 · comp-button 540 · comp-card 980 · comp-dialog 1420 · comp-empty 1860
Hàng 2 (Y=820): comp-error 100 · comp-loading 540 · comp-navigation 980 · comp-textfield 1420

### Page `06 Prototype` — tự tạo
Paste KHÔNG tạo prototype. Tạo page này rỗng, nối link theo `ux/prototype-spec.md`
(3 luồng: thuận / lịch sử phiên bản / lỗi-phục hồi). Có thể nối từ các frame đã
dán ở page 03.

## 2. Việc phải làm tay (paste không tạo được)
| Thiếu | Cách làm |
|---|---|
| Auto Layout | Chọn frame → Shift+A |
| Variables | Page 04 → panel Variables → tạo theo `design-system.md` §10 |
| Component | Chọn nhóm → Ctrl+Alt+K |
| Variant | Thêm property cho component set |
| Prototype link | Mode Prototype → nối theo `ux/prototype-spec.md` |
| Drop shadow | SVG mất filter → Effects → Drop shadow |
| Ảnh thật | Khung xám ghi "Ảnh mẫu" (placeholder) |

## 3. Lấy link nộp
- Share → bật "Anyone with the link can view" (chế độ ẩn danh).
- Copy link → nhắn cho agent, hoặc tự chạy:
  `python3 set-links.py --figma <LINK>`
  Agent sẽ đồng bộ README trên repo nhóm `linh20051708/AI-Review--ui`.
