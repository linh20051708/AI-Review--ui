# PASTE-PLAN — Hướng dẫn dán 48 khung vào Figma

Mỗi khung dưới đây có **toạ độ đặt sẵn** để dán xong là có bố cục gọn,
không chồng lên nhau. Toạ độ tính từ góc trên-trái của page.

**Cách dán một khung:**
1. Mở file SVG (bằng trình duyệt hoặc editor văn bản)
2. Copy toàn bộ nội dung XML
3. Vào Figma, chọn đúng page, bấm vào canvas
4. `Cmd+V` — Figma tạo frame + vector + text sửa được
5. Đặt frame về toạ độ ghi trong bảng (kéo thả, hoặc chỉnh X/Y trong panel)

Khe giữa các khung: **80px**, tối đa **6** khung mỗi hàng.

## 01 User Flow

_1 khung_

| # | Đặt tại X,Y | Kích thước | File | Tên khung |
|---|---|---|---|---|
| 1 | `100, 100` | 1760×1180 | `user-flow-supervisor.svg` | Sơ đồ 3 luồng — Giảng viên |

## 02 Wireframe

_9 khung_

| # | Đặt tại X,Y | Kích thước | File | Tên khung |
|---|---|---|---|---|
| 1 | `100, 100` | 412×892 | `wf-01-dang-nhap.svg` | Đăng nhập |
| 2 | `592, 100` | 412×892 | `wf-02-tong-quan.svg` | Tổng quan |
| 3 | `1084, 100` | 412×892 | `wf-03-yeu-cau-review.svg` | DS yêu cầu review |
| 4 | `1576, 100` | 412×892 | `wf-04-khong-gian-review.svg` | Không gian review |
| 5 | `2068, 100` | 412×892 | `wf-05-ket-qua-ai.svg` | Kết quả AI Review |
| 6 | `2560, 100` | 412×892 | `wf-06-lop-hoc.svg` | DS lớp học |
| 7 | `100, 1072` | 412×892 | `wf-07-project.svg` | DS project |
| 8 | `592, 1072` | 412×892 | `wf-08-tai-lieu.svg` | Tài liệu project |
| 9 | `1084, 1072` | 412×892 | `wf-09-hoc-ky.svg` | DS học kỳ |

## 03 Final UI

_24 khung_

| # | Đặt tại X,Y | Kích thước | File | Tên khung |
|---|---|---|---|---|
| 1 | `100, 100` | 360×800 | `r360-s02-tong-quan.svg` | Tổng quan @360dp |
| 2 | `540, 100` | 360×800 | `r360-s03-yeu-cau.svg` | Yêu cầu review @360dp |
| 3 | `980, 100` | 360×800 | `r360-s07-project.svg` | Project @360dp |
| 4 | `1420, 100` | 412×892 | `s01-dang-nhap.svg` | Đăng nhập |
| 5 | `1912, 100` | 412×892 | `s02-tong-quan.svg` | Tổng quan |
| 6 | `2404, 100` | 412×892 | `s03-yeu-cau-review.svg` | Yêu cầu review |
| 7 | `100, 1072` | 412×892 | `s04-khong-gian-review.svg` | Không gian review |
| 8 | `592, 1072` | 412×892 | `s05-ket-qua-ai.svg` | Kết quả AI Review |
| 9 | `1084, 1072` | 412×892 | `s06-lop-hoc.svg` | Lớp học |
| 10 | `1576, 1072` | 412×892 | `s07-project.svg` | Project |
| 11 | `2068, 1072` | 412×892 | `s08-tai-lieu.svg` | Tài liệu project |
| 12 | `2560, 1072` | 412×892 | `s09-hoc-ky.svg` | Học kỳ |
| 13 | `100, 2044` | 412×892 | `s10-rule-set.svg` | Rule set |
| 14 | `592, 2044` | 412×892 | `s11-sinh-vien.svg` | Sinh viên |
| 15 | `1084, 2044` | 412×892 | `s12-nhom.svg` | Nhóm |
| 16 | `1576, 2044` | 412×892 | `s13-thong-bao.svg` | Thông báo |
| 17 | `2068, 2044` | 412×892 | `s14-tai-khoan.svg` | Tài khoản |
| 18 | `2560, 2044` | 412×892 | `v-s02-offline.svg` | Tổng quan — mất mạng |
| 19 | `100, 3016` | 412×892 | `v-s03-empty.svg` | Danh sách — rỗng |
| 20 | `592, 3016` | 412×892 | `v-s03-error.svg` | Danh sách — lỗi mạng |
| 21 | `1084, 3016` | 412×892 | `v-s03-loading.svg` | Danh sách — đang tải |
| 22 | `1576, 3016` | 412×892 | `v-s04-decision.svg` | Hộp thoại phê duyệt |
| 23 | `2068, 3016` | 412×892 | `v-s04-unavailable.svg` | Tài liệu không khả dụng |
| 24 | `2560, 3016` | 412×892 | `v-s05-running.svg` | AI đang phân tích |

## 04 Design System

_5 khung_

| # | Đặt tại X,Y | Kích thước | File | Tên khung |
|---|---|---|---|---|
| 1 | `100, 100` | 1180×1000 | `ds-colors.svg` | Bảng màu token |
| 2 | `1360, 100` | 1180×700 | `ds-contrast.svg` | Độ tương phản WCAG |
| 3 | `2620, 100` | 1180×380 | `ds-elevation.svg` | Độ nổi |
| 4 | `3880, 100` | 1180×480 | `ds-spacing.svg` | Khoảng cách & bo góc |
| 5 | `5140, 100` | 1180×620 | `ds-typography.svg` | Thang chữ Inter |

## 05 Components

_9 khung_

| # | Đặt tại X,Y | Kích thước | File | Tên khung |
|---|---|---|---|---|
| 1 | `100, 100` | 360×640 | `comp-appbar.svg` | Appbar |
| 2 | `540, 100` | 360×640 | `comp-button.svg` | Button |
| 3 | `980, 100` | 360×640 | `comp-card.svg` | Card |
| 4 | `1420, 100` | 360×640 | `comp-dialog.svg` | Dialog |
| 5 | `1860, 100` | 360×640 | `comp-empty.svg` | Empty |
| 6 | `2300, 100` | 360×640 | `comp-error.svg` | Error |
| 7 | `100, 820` | 360×640 | `comp-loading.svg` | Loading |
| 8 | `540, 820` | 360×640 | `comp-navigation.svg` | Navigation |
| 9 | `980, 820` | 360×640 | `comp-textfield.svg` | Textfield |

---

## Sau khi dán xong — việc phải làm tay

Paste SVG tạo được frame + text sửa được, nhưng **KHÔNG** tạo được:

| Thiếu | Cách làm |
|---|---|
| Auto Layout | Chọn frame → `Shift+A` → đặt hướng và khe |
| Variables | Page `04 Design System` → panel Variables → tạo theo `design-system.md` §10 |
| Component | Chọn nhóm → `Ctrl+Alt+K` |
| Biến thể | Thêm property cho component set |
| Prototype link | Mode Prototype → nối theo `ux/prototype-spec.md` §2–§4 |
| Drop shadow | SVG mất filter → chọn frame → Effects → Drop shadow |
| Ảnh thật | Chỗ ảnh là khung xám ghi "Ảnh mẫu" |
| Page 06 Prototype | Tự tạo thêm — page thứ 6 theo brief |

Tên 6 page phải đúng và đúng thứ tự:
`01 User Flow` · `02 Wireframe` · `03 Final UI` · `04 Design System` · `05 Components` · `06 Prototype`