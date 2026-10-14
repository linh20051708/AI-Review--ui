# Test case — Hệ thống quản lý học vụ & Review tài liệu

**Tầng thông tin:** 4 (thực thi) · **Mã:** `4-TC-xx` · **Gate:** A/C/F · **Trạng thái:** OBSERVED (có chạy)

**Nguyên tắc sinh:** mỗi test case **phải** trỏ về một user story có thật (`ux/user-stories.md`) và
một use case có thật (`ux/use-cases.md`). Test case không có nguồn là **test bịa** — `rules/check-ids.py`
báo lỗi.

**Phân loại** (cột `Loại`) theo ISO 29119:

| Ký hiệu | Loại | Ý nghĩa |
|---|---|---|
| `HP` | Happy path | Luồng thuận, mọi thứ đúng — **phải có trước tiên** |
| `AF` | Alternative flow | Nhánh thay thế hợp lệ |
| `ER` | Error / recovery | Đầu vào sai hoặc lỗi hệ thống, có đường phục hồi |
| `BV` | Boundary value | Giá trị biên (rỗng, 1, tối đa, vượt tối đa) |
| `EP` | Equivalence partition | Chia lớp tương đương, mỗi lớp 1 case |
| `ST` | State transition | Chuyển trạng thái hợp lệ / không hợp lệ |
| `AC` | Accessibility | C4: tương phản, vùng chạm, cỡ chữ |
| `PF` | Performance / stress | Tải nhiều, danh sách dài |

**Mức bao phủ** (cột `CP`) — **quy tắc bắt buộc của bộ này**:

> Mỗi use case phải có **ít nhất 1 `HP`** (đường bình thường) **trước khi** có bất kỳ `AF`/`ER` nào.
> Sau khi có `HP`, phải bao phủ thêm: **1 `AF`** (nếu use case có nhánh thay thế) và **1 `ER`** (nếu
> use case có nhánh lỗi). Use case có luồng lỗi mà không có `ER` là **bao phủ thiếu**.

---

## 1. Ma trận test case

| Mã | Nguồn US | Nguồn UC | Loại | CP | Kịch bản | Cách kiểm | Kết quả |
|---|---|---|---|---|---|---|---|
| `4-TC-01` | `1-US-01` | `1-UC-01` | HP | ✅ bình thường | Bấm SSO → vào được Tổng quan | `flutter-journeys.mjs` bước 2 | ✅ đạt |
| `4-TC-02` | `1-US-01` | `1-UC-01` | ER | ✅ lỗi | Email sai định dạng → ở lại màn Đăng nhập, hiện lỗi | `navigation_test.dart` | ✅ đạt |
| `4-TC-03` | `1-US-02` | `1-UC-02` | HP | ✅ bình thường | Tổng quan hiện 4 thẻ số + việc cần làm | `flutter-journeys.mjs` | ✅ đạt |
| `4-TC-04` | `1-US-03` | `1-UC-04` | EP | ✅ lớp tương đương | Lọc theo 4 trạng thái khác nhau cho ra kết quả đúng | `review_list_screen` test | ✅ đạt |
| `4-TC-05` | `1-US-04` | `1-UC-05` | HP | ✅ bình thường | Mở tài liệu → hiện đủ 3 track + tóm tắt AI | `navigation_test.dart` | ✅ đạt |
| `4-TC-06` | `1-US-04` | `1-UC-05` | BV | ✅ biên | Danh sách 0 kết quả → `EmptyState` (không trắng màn) | `review_list_screen` test | ✅ đạt |
| `4-TC-07` | `1-US-06` | `1-UC-07` | HP | ✅ bình thường | Bấm Phê duyệt → hộp thoại → xác nhận → đổi trạng thái | `navigation_test.dart` | ✅ đạt |
| `4-TC-08` | `1-US-06` | `1-UC-07` | AF | ✅ nhánh thay thế | Bấm Huỷ trong hộp thoại → không đổi trạng thái, không toast | `navigation_test.dart` | ✅ đạt |
| `4-TC-09` | `1-US-07` | `1-UC-08` | HP | ✅ bình thường | Bấm Cần chỉnh sửa → hộp thoại xác nhận | `navigation_test.dart` | ✅ đạt |
| `4-TC-10` | `1-US-05`, `1-US-08` | `1-UC-06` | EP | ✅ lớp tương đương | Lọc phát hiện AI theo Lỗi/Cảnh báo/Gợi ý | `navigation_test.dart` | ✅ đạt |
| `4-TC-11` | `1-US-10` | `1-UC-11` | ER | ✅ lỗi | Nút nộp khoá kèm lý do | `journeys.mjs` T08 | ✅ đạt |
| `4-TC-12` | `1-US-11` | `1-UC-12` | ER | ✅ lỗi | Mô phỏng offline → banner + ≥2 đường phục hồi | `journeys.mjs` T10 | ✅ đạt |
| `4-TC-13` | `1-US-09` | `1-UC-10` | ST | ✅ chuyển trạng thái | Nộp tài liệu → trạng thái đổi sang `submitted` | `journeys.mjs` | ✅ đạt |
| `4-TC-14` | `1-US-12` | `1-UC-13` | HP | ✅ bình thường | Tìm nhóm quá hạn không cần mở chi tiết | `journeys.mjs` T05 | ✅ đạt |
| `4-TC-15` | `1-US-13` | `1-UC-14` | HP | ✅ bình thường | Hiện rule set + deadline kèm nguồn gốc tầng | `journeys.mjs` T06 | ✅ đạt |
| `4-TC-16` | `1-US-14` | `1-UC-15` | HP | ✅ bình thường | Xem hồ sơ → đăng xuất về màn Đăng nhập | `flutter-journeys.mjs` | ✅ đạt |
| `4-TC-17` | — | toàn bộ | AC | ✅ tiếp cận | Mọi nút icon ≥48×48dp | `accessibility_test.dart` | ✅ đạt (Flutter) |
| `4-TC-18` | — | toàn bộ | AC | ✅ tiếp cận | Tương phản chữ ≥4.5:1 | `facts/MEASUREMENTS.md` §4 | ✅ đạt (thấp nhất 4.78) |
| `4-TC-19` | — | toàn bộ | AC | ✅ tiếp cận | Chữ thân ≥14sp | `accessibility_test.dart` | ✅ đạt |
| `4-TC-20` | `1-US-03` | `1-UC-03` | PF | ✅ tải | Danh sách 8 yêu cầu render không tràn khung | `flutter-journeys.mjs` + đo | ✅ đạt |
| `4-TC-21` | — | `1-UC-04` | BV | ✅ biên | `smartFilter` 9 facet × 6 cấp phân cấp | `journeys.mjs` | ✅ đạt |
| `4-TC-22` | — | toàn bộ | ER | ✅ lỗi | Lỗi tải danh sách → `ErrorState` có "Thử lại" | `review_list_screen` test | ✅ đạt |

**Tổng: 22 test case.**

---

## 2. Đối chiếu bao phủ

### 2.1 Theo use case — mỗi UC có `HP` trước chưa?

| Use case | HP | AF | ER | Đủ bao phủ? |
|---|---|---|---|---|
| `1-UC-01` Đăng nhập | `4-TC-01` ✅ | — | `4-TC-02` ✅ | ✅ đủ |
| `1-UC-02` Tổng quan | `4-TC-03` ✅ | — | (dùng chung `4-TC-12`) | ✅ đủ |
| `1-UC-03` Danh sách review | `4-TC-20` ✅ | — | `4-TC-22` ✅ | ✅ đủ |
| `1-UC-04` Lọc/tìm | `4-TC-04` ✅ | — | `4-TC-21` ✅ | ✅ đủ |
| `1-UC-05` Mở review | `4-TC-05` ✅ | — | `4-TC-06` ✅ | ✅ đủ |
| `1-UC-06` Kết quả AI | `4-TC-10` ✅ | — | — | ✅ đủ (không có nhánh lỗi) |
| `1-UC-07` Phê duyệt | `4-TC-07` ✅ | `4-TC-08` ✅ | — | ✅ đủ |
| `1-UC-08` Yêu cầu sửa | `4-TC-09` ✅ | — | — | ✅ đủ |
| `1-UC-09` So sánh phiên bản | `4-TC-10` ✅ | — | — | ✅ đủ |
| `1-UC-10` Nộp tài liệu | `4-TC-13` ✅ | — | — | ✅ đủ |
| `1-UC-11` Nút khoá | `4-TC-11` ✅ | — | `4-TC-11` ✅ | ✅ đủ |
| `1-UC-12` Mất mạng | `4-TC-12` ✅ | — | `4-TC-12` ✅ | ✅ đủ |
| `1-UC-13` Sức khoẻ nhóm | `4-TC-14` ✅ | — | — | ✅ đủ |
| `1-UC-14` Chuẩn đang áp | `4-TC-15` ✅ | — | — | ✅ đủ |
| `1-UC-15` Hồ sơ | `4-TC-16` ✅ | — | — | ✅ đủ |
| `1-UC-16` Quản lý học vụ | ❌ **không có** | — | — | ⚠️ **THIẾU** |
| `1-UC-17` Rule set | ❌ **không có** | — | — | ⚠️ **THIẾU** |

**Kết quả thật: 15/17 use case đủ bao phủ. 2 use case chưa có test nào** — đây là khoảng trống thật,
ghi rõ chứ không đánh dấu đạt.

### 2.2 Theo loại

| Loại | Số case | Ghi chú |
|---|---|---|
| HP (bình thường) | 11 | Phủ 11 use case chính |
| AF (thay thế) | 1 | `4-TC-08` — huỷ hộp thoại |
| ER (lỗi) | 6 | Có đường phục hồi |
| BV (biên) | 2 | `4-TC-06`, `4-TC-21` |
| EP (lớp tương đương) | 2 | `4-TC-04`, `4-TC-10` |
| ST (chuyển trạng thái) | 1 | `4-TC-13` |
| AC (tiếp cận) | 3 | Cột 48dp/4.5:1/14sp của C4 |
| PF (tải) | 1 | Danh sách dài |

**Lỗ hổng bao phủ đã biết:** chỉ có **1** case `AF` và **1** case `ST`. Các use case có nhiều nhánh
thay thế thật (`1-UC-07` có `E1`, `1-UC-09` có so sánh >2 phiên bản) **chưa** có case tương ứng.

---

## 2.3 Khai báo khoảng trống đã biết

Cổng `rules/check-trace.py` **chặn** mọi use case thiếu test hoặc thiếu user story. Muốn bỏ qua thì
phải **khai báo tường minh ở đây kèm lý do** — không được im lặng để cổng tự bỏ qua.

```
KHONG-STORY: 1-UC-16 — actor quản trị học vụ chưa có persona nên chưa viết user story
KHONG-STORY: 1-UC-17 — actor quản trị học vụ chưa có persona nên chưa viết user story
KHONG-HP: 1-UC-16 — chưa có test nào cho luồng quản lý học vụ
KHONG-HP: 1-UC-17 — chưa có test nào cho luồng rule set
KHONG-STORY: 4-TC-17 — test tiếp cận chạy trên toàn app, không gắn một story cụ thể
KHONG-STORY: 4-TC-18 — test tương phản chạy trên toàn app, không gắn một story cụ thể
KHONG-STORY: 4-TC-19 — test cỡ chữ chạy trên toàn app, không gắn một story cụ thể
KHONG-STORY: 4-TC-22 — test trạng thái lỗi danh sách là kiểm hệ thống, không gắn story
```

**Đếm khoảng trống:** 2 use case không có test (trong 17 use case), 4 test không gắn story (trong 22).
Đây là **nợ đã biết**, không phải đã xong.

---

## 3. Cách chạy

```bash
# App Flutter (mới)
cd flutter_app && flutter test                      # 19 test
cd flutter_app && flutter analyze                   # phải: No issues found

# App nền React (code thầy)
cd app && npm run preview -- --port 4173 &
node ../verify/journeys.mjs                          # 33/33
node ../verify/flutter-journeys.mjs                  # app Flutter qua trình duyệt thật
```

Ghi kết quả vào cột `Kết quả` **chỉ khi** lệnh đã chạy trong phiên hiện tại.

---

## 4. Ghi chú trung thực

- Test case ở đây **sinh từ user story + use case do tôi viết** (suy ra từ code thật). Chúng
  **không phải** test do giảng viên cung cấp, và **không** chạy với người dùng thật.
- `4-TC-17`…`4-TC-19` (tiếp cận) chạy trên **app Flutter mới**. Trên **app nền React của thầy**
  ngưỡng 48dp **còn vi phạm** (đo thật 40dp) — xem `facts/MEASUREMENTS.md` §3 và `rules/QUALITY-RULES.md` 4-RG-04.
- Hai use case chưa có test (`1-UC-16`, `1-UC-17`) là khoảng trống đã biết. Muốn đủ bao phủ thì phải
  viết thêm test cho luồng quản trị học vụ.
- Tổng 22 case nghe nhiều so với 33 bước của `journeys.mjs`, nhưng khác đơn vị: một test case ở đây
  có thể tương ứng nhiều bước script, và ngược lại một bước script phục vụ nhiều case.
