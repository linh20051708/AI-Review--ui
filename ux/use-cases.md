# Use case — Hệ thống quản lý học vụ & Review tài liệu

**Tầng thông tin:** 1 (nghiệp vụ) · **Mã:** `1-UC-xx` · **Gate:** A · **Trạng thái:** ASSUMED (chờ lớp xác nhận)

Tài liệu này bám **đúng 23 route** trong `app/src/app/router.tsx`. Mỗi use case trỏ về màn hình thật
(`ux/user-flow.md` §2) và persona thật (`ux/persona.md`). Không có use case nào được bịa thêm.

**Quan hệ sinh ra:** `UC` (đây) → `US` (`ux/user-stories.md`) → `TC` (`docs/test-cases.md`).
Một use case không có user story nào trỏ tới là **use case mồ côi** — `rules/check-ids.py` sẽ báo.

---

## 1. Tác nhân (actor)

| Mã | Actor | Persona | Quyền chính |
|---|---|---|---|
| `1-SH-01` | Giảng viên / Supervisor | `1-PS-01` | Review, phê duyệt, yêu cầu chỉnh sửa |
| `1-SH-02` | Sinh viên / Trưởng nhóm | `1-PS-02` | Nộp tài liệu, xem phản hồi |
| `1-SH-03` | Quản trị học vụ | — (chưa có persona) | Cấu hình học kỳ, rule set, lớp |

**Ghi chú trung thực:** `1-SH-03` chưa có persona đầy đủ. Mọi use case của actor này ghi nhãn
`Assumed` và **chưa có test case** — đây là khoảng trống, không phải đã xong.

---

## 2. Danh sách use case

| Mã | Use case | Actor | Màn hình | Luồng | Nguồn (code) |
|---|---|---|---|---|---|
| `1-UC-01` | Đăng nhập bằng SSO trường | Cả hai | S01 | FL-01 | `pages/auth/LoginPage.tsx` |
| `1-UC-02` | Xem việc cần làm hôm nay | `1-SH-01` | S02 | FL-01 | `pages/dashboard/DashboardPage.tsx` |
| `1-UC-03` | Xem danh sách yêu cầu review | `1-SH-01` | S03 | FL-01 | `pages/reviews/ReviewRequestsPage.tsx` |
| `1-UC-04` | Lọc / tìm yêu cầu review | `1-SH-01` | S03 | FL-01 | `lib/smartFilter.ts` (9 facet) |
| `1-UC-05` | Mở không gian review một tài liệu | `1-SH-01` | S04 | FL-01 | `pages/reviews/ReviewWorkspacePage.tsx` |
| `1-UC-06` | Xem kết quả AI Review | `1-SH-01`, `1-SH-02` | S05 | FL-01 | `pages/reviews/AIReviewResultPage.tsx` |
| `1-UC-07` | Phê duyệt tài liệu | `1-SH-01` | S04 | FL-01 | `_DecisionBar` trong S04 |
| `1-UC-08` | Yêu cầu chỉnh sửa | `1-SH-01` | S04 | FL-01 | `_DecisionBar` trong S04 |
| `1-UC-09` | So sánh phiên bản tài liệu | `1-SH-01`, `1-SH-02` | S06, S07 | FL-02 | `pages/reviews/VersionReviewHistoryPage.tsx` |
| `1-UC-10` | Nộp tài liệu cho nhóm | `1-SH-02` | S13 | FL-01 | `pages/projects/ProjectDocumentsPage.tsx` |
| `1-UC-11` | Xem vì sao nút nộp bị khoá | `1-SH-02` | S13 | FL-03 | `dependsOn` trong store |
| `1-UC-12` | Phục hồi khi mất mạng | Cả hai | S02, S03 | FL-03 | `OfflineBanner` + 2 đường phục hồi |
| `1-UC-13` | Theo dõi sức khoẻ nhóm | `1-SH-01` | S11 | FL-01 | `GroupHealth` trên thẻ project |
| `1-UC-14` | Xem chuẩn đang áp tại chỗ ra quyết định | `1-SH-01` | S04 | FL-01 | rule set + deadline resolve |
| `1-UC-15` | Xem hồ sơ cá nhân | Cả hai | S23 | — | `pages/profile/ProfilePage.tsx` |
| `1-UC-16` | Quản lý học kỳ / lớp / môn | `1-SH-03` | S09, S10, S17, S19, S20 | — | `managementStore.ts` |
| `1-UC-17` | Quản lý rule set | `1-SH-03` | S18 | — | `pages/rule-sets/RuleSetListPage.tsx` |

**Tổng: 17 use case.** Trong đó **15 có cả user story lẫn test case**; **2 chưa có**
(`1-UC-16`, `1-UC-17` — đều thuộc actor `1-SH-03` quản trị học vụ, chưa có persona).
Kiểm lại 14/10 bằng script trên chính bảng này; khoảng trống ghi ở `docs/test-cases.md` §4.
*(Con số "12 có test case / 5 chưa" ghi trước đây là **sai** — đã sửa.)*

---

## 3. Đặc tả use case trọng yếu

Chỉ đặc tả đầy đủ 4 use cốt lõi của luồng nghiệp vụ chính. Các use case khác ở mức bảng §2.

### `1-UC-05` — Mở không gian review một tài liệu

| Mục | Nội dung |
|---|---|
| **Actor** | `1-SH-01` (Giảng viên) |
| **Mục tiêu** | Thấy đủ thông tin để ra quyết định duyệt/sửa trong **một màn**, không phải mở thêm |
| **Tiền điều kiện** | Đã đăng nhập; có ít nhất 1 yêu cầu review ở trạng thái `waiting` hoặc `inReview` |
| **Hậu điều kiện thành công** | Màn S04 hiện: tài liệu, **3 track** trạng thái, kết quả AI tóm tắt, 2 nút quyết định |
| **Hậu điều kiện thất bại** | Không có gì thay đổi; hiện `ErrorState` + 2 đường phục hồi |
| **Luồng chính** | 1. Từ S03 bấm thẻ tài liệu → 2. Mở S04 → 3. Đọc 3 track → 4. Xem tóm tắt AI → 5. Chọn 1 trong 2 nút |
| **Luồng thay thế A1** | Tài liệu có ≥2 phiên bản → bấm "So sánh phiên bản" → sang `1-UC-09` |
| **Luồng lỗi E1** | Tải lỗi → `ErrorState` có "Thử lại" + "Xem bản lưu" |
| **Quy tắc nghiệp vụ** | 2 nút quyết định phải **ngay trên màn**, không nằm trong menu (PN-03) |
| **Màn hình** | `SC-04` · **Flow** `FL-01` · **Test** `4-TC-05`, `4-TC-06` |

### `1-UC-07` / `1-UC-08` — Phê duyệt / Yêu cầu chỉnh sửa

| Mục | Nội dung |
|---|---|
| **Actor** | `1-SH-01` |
| **Mục tiêu** | Đổi trạng thái tài liệu với **≤3 lần bấm** và có xác nhận |
| **Tiền điều kiện** | Đang ở S04, tài liệu chưa ở trạng thái cuối |
| **Hậu điều kiện thành công** | Trạng thái đổi (`approved` hoặc `needsRevision`) + toast xác nhận |
| **Hậu điều kiện thất bại** | Không đổi trạng thái; hộp thoại đóng, không có toast |
| **Luồng chính** | 1. Bấm nút → 2. `ConfirmModal` hiện câu hỏi → 3. Bấm xác nhận → 4. Đổi trạng thái + toast |
| **Luồng thay thế A1** | Bấm "Huỷ" trong hộp thoại → đóng, **không** phát sinh toast |
| **Luồng lỗi E1** | Lưu thất bại → giữ nguyên trạng thái + báo lỗi có "Thử lại" |
| **Quy tắc nghiệp vụ** | Phải có bước xác nhận — không đổi trạng thái ngay khi bấm (tránh bấm nhầm) |
| **Màn hình** | `SC-04` · **Flow** `FL-01` · **Test** `4-TC-07`, `4-TC-08`, `4-TC-09` |

### `1-UC-11` — Xem vì sao nút nộp bị khoá

| Mục | Nội dung |
|---|---|
| **Actor** | `1-SH-02` (Sinh viên) |
| **Mục tiêu** | Hiểu **lý do** không nộp được, không phải đoán |
| **Tiền điều kiện** | Tài liệu phụ thuộc (`dependsOn`) chưa được duyệt |
| **Hậu điều kiện thành công** | Nút bị khoá **kèm chữ lý do** hiện ngay cạnh/chồng lên nút |
| **Hậu điều kiện thất bại** | Nút khoá **không** có lý do → coi là lỗi UX (dead end) |
| **Luồng chính** | 1. Vào S13 → 2. Thấy nút nộp mờ → 3. Đọc lý do → 4. Biết cần chờ gì |
| **Quy tắc nghiệp vụ** | Không được có nút khoá im lặng (PN-08) |
| **Màn hình** | `SC-13` · **Flow** `FL-03` · **Test** `4-TC-11` |

### `1-UC-12` — Phục hồi khi mất mạng

| Mục | Nội dung |
|---|---|
| **Actor** | Cả hai |
| **Mục tiêu** | Không bị kẹt khi mạng lỗi; luôn có đường ra |
| **Tiền điều kiện** | Đang ở S02 hoặc S03, mất mạng |
| **Hậu điều kiện thành công** | Hiện `OfflineBanner` + **≥2** đường phục hồi ("Thử lại", "Xem bản lưu") |
| **Hậu điều kiện thất bại** | Chỉ có 1 đường hoặc không có → vi phạm C6 |
| **Luồng chính** | 1. Mất mạng → 2. Banner hiện → 3. Chọn 1 trong ≥2 đường → 4. Thoát được |
| **Quy tắc nghiệp vụ** | Mọi trạng thái lỗi có ≥2 đường phục hồi (PN-11) |
| **Màn hình** | `SC-02`, `SC-03` · **Flow** `FL-03` · **Test** `4-TC-12` |

---

## 4. Ghi chú trung thực

- Use case ở đây **suy ra từ code thật** (`router.tsx` 23 route + các page component), không phải
  từ phỏng vấn người dùng. Nhãn bằng chứng cho toàn bộ tài liệu: `Assumed` cho mục tiêu, `Observed`
  cho màn hình/luồng (đã đo trong `facts/MEASUREMENTS.md`).
- `1-SH-03` (quản trị học vụ) chưa có persona và chưa có test case — khoảng trống đã biết.
- Không có use case nào mô tả chức năng không tồn tại trong code. Nếu giảng viên muốn thêm use case
  ngoài 23 route, phải thêm màn hình trước.
