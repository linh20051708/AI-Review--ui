# CMPlan-MAP — Bảng ánh xạ & Truy vết dọc

**Kèm theo:** `docs/CMPlan.md` · **Ngày:** 14/10/2026

Bảng này nối liền mạch: `Persona → Scenario → Use Case → User Story → Figma ID → Code → Test Case`.
Tra ở đây, **đừng suy số** từ mã này sang mã kia.

---

## 1. Chuỗi truy vết dọc — 14 User Story

| Persona | Scenario | Use Case | User Story | Figma ID (CMPlan) | Wireframe thật (`figma-svg/output/03-final/`) | Code thật trong `flutter_app/lib/` | Test Cases |
|---|---|---|---|---|---|---|---|
| `P01` giảng viên | `SC01` | `1-UC-01` | `1-US-01` | `011_AUTH_US01_login_screen` | `s01-dang-nhap.svg` | `flutter_app/lib/features/login/login_screen.dart` | `TC_US01_*` |
| `P01` giảng viên | `SC02` | `1-UC-02` | `1-US-02` | `011_DASH_US02_dashboard_screen` | `s02-tong-quan.svg` | `flutter_app/lib/features/dashboard/dashboard_screen.dart` | `TC_US02_*` |
| `P01` giảng viên | `SC03` | `1-UC-03` | `1-US-03` | `011_REVIEW_US03_request_list` | `s03-yeu-cau-review.svg` | `flutter_app/lib/features/request_list/request_list_screen.dart` | `TC_US03_*` |
| `P01` giảng viên | `SC04` | `1-UC-04` | `1-US-04` | `011_REVIEW_US04_workspace_screen` | `s04-khong-gian-review.svg` | `flutter_app/lib/features/review_workspace/page/workspace_page.dart` | `TC_US04_*` |
| `P01` giảng viên | `SC05` | `1-UC-05` | `1-US-05` | `011_REVIEW_US05_ai_result_screen` | `s05-ket-qua-ai.svg` | `flutter_app/lib/features/ai_result/ai_result_screen.dart` | `TC_US05_*` |
| `P01` giảng viên | `SC06` | `1-UC-06` | `1-US-06` | `011_REVIEW_US06_approval_screen` | `s06-lop-hoc.svg` | `flutter_app/lib/features/approval/approval_screen.dart` | `TC_US06_*` |
| `P01` giảng viên | `SC07` | `1-UC-07` | `1-US-07` | `011_REVIEW_US07_revision_screen` | `s07-project.svg` | `flutter_app/lib/features/revision_request/revision_screen.dart` | `TC_US07_*` |
| `P01` giảng viên | `SC08` | `1-UC-08` | `1-US-08` | `011_REVIEW_US08_compare_screen` | `s08-tai-lieu.svg` | `flutter_app/lib/features/version_compare/compare_screen.dart` | `TC_US08_*` |
| `P02` sinh viên | `SC09` | `1-UC-09` | `1-US-09` | `011_SUBMIT_US09_submit_screen` | `s09-hoc-ky.svg` | `flutter_app/lib/features/document_submit/submit_screen.dart` | `TC_US09_*` |
| `P02` sinh viên | `SC10` | `1-UC-10` | `1-US-10` | `011_SUBMIT_US10_submit_gate_screen` | `s10-rule-set.svg` | `flutter_app/lib/features/submit_gate/submit_gate_screen.dart` | `TC_US10_*` |
| `P01`+`P02` | `SC11` | `1-UC-11` | `1-US-11` | `011_CORE_US11_offline_banner` | `s11-sinh-vien.svg` | `flutter_app/lib/shared/widgets/offline_banner.dart` | `TC_US11_*` |
| `P01` giảng viên | `SC12` | `1-UC-12` | `1-US-12` | `011_DASH_US12_group_health_screen` | `s12-nhom.svg` | `flutter_app/lib/features/group_health/group_health_screen.dart` | `TC_US12_*` |
| `P01` giảng viên | `SC13` | `1-UC-13` | `1-US-13` | `011_REVIEW_US13_rule_set_screen` | `s13-thong-bao.svg` | `flutter_app/lib/features/rule_sets/rule_set_screen.dart` | `TC_US13_*` |
| `P01`+`P02` | `SC14` | `1-UC-14` | `1-US-14` | `011_PROFILE_US14_profile_screen` | `s14-tai-khoan.svg` | `flutter_app/lib/features/profile/profile_screen.dart` | `TC_US14_*` |

### 1.1 Ghi chú trung thực về bảng trên

Cột **Wireframe thật** trỏ tới file SVG có thật trong `figma-svg/output/03-final/`. Cột này được
`rules/check-trace-map.py` đối chiếu với đĩa.

Cột **Code thật** chỉ ghi đường dẫn khi file **tồn tại**. Ô `— *(chưa code)*` là **khai báo trung thực**:
user story và wireframe có thật, nhưng bản demo Flutter **chưa dựng màn đó**. Cụ thể:

| Có code (13 màn + 1 banner dùng chung) | Chưa code (0) |
|---|---|
| US01 đăng nhập · US02 tổng quan · US03 danh sách review · US04 không gian review · US05 kết quả AI · US06 phê duyệt · US07 yêu cầu chỉnh sửa · US08 so sánh phiên bản · US09 nộp tài liệu · US10 vì sao bị khoá · US11 offline banner *(dùng chung)* · US12 sức khoẻ nhóm · US13 chuẩn đang áp · US14 hồ sơ | **không còn** — đủ 14/14 User Story |

> **Cập nhật 14/10 (đợt 2):** 7 màn còn thiếu (US06, US07, US08, US09, US10, US12, US13) đã được
> dựng, đưa độ phủ tầng `011` từ **6/14 lên 14/14** User Story. Trước đợt này bảng ghi
> `— *(chưa code)*` cho 8 dòng — đó là khai báo trung thực lúc bấy giờ, không phải lỗi.
> `rules/check-trace-map.py` đã **bắt đúng 7 vi phạm "MÀN MỒ CÔI"** khi 7 file mới xuất hiện
> mà bảng chưa cập nhật — cổng chạy đúng như thiết kế.

> US11 có file `offline_banner.dart` nhưng là **component dùng chung**, không phải màn riêng.
> 8 US chưa code **không** phải "đã xong" — `docs/CMPlan.md` §6 ghi ở N4.

> **Cập nhật 14/10 (đợt tách tệp):** màn US04 được tách theo kiến trúc
> `page -> state -> widget` (https://docs.flutter.dev/resources/architectural-overview) nên đường
> dẫn trong bảng §1 đổi từ `review_workspace/workspace_screen.dart` sang
> `review_workspace/page/workspace_page.dart`. **Tên lớp công khai giữ nguyên
> `ReviewWorkspaceScreen`** — đổi tên lớp là đổi giao diện nên phải sửa mọi nơi gọi trong cùng
> một thay đổi; ở đây tách tệp thuần, hành vi không đổi.

**Vì sao không dựng 8 màn giả:** gate yêu cầu đường dẫn phải có thật; cách duy nhất để nó xanh là
dựng màn thật hoặc khai `—`. Điền đường dẫn không tồn tại cho xanh là **bịa**, đúng thứ cổng này sinh ra để chặn.

**Đối chiếu mã tài liệu Lab 2:** scenario `SC01`…`SC14` ở đây là **cách đánh số CMPlan**, khác
`1-E-01`…`1-E-06` (bằng chứng) của Lab 2. Bảng dịch ở §5.

> **Ghi chú:** `1-UC-15`, `1-UC-16`, `1-UC-17` **không** có mặt trong bảng này vì chưa có User Story
> (actor quản trị học vụ `1-SH-03` chưa có persona). Đây là lỗ hổng truy vết **đã biết**, ghi ở
> `docs/CMPlan.md` §6 N6 — không che.

---

## 2. Cây code thật sau khi đổi cấu trúc

```
flutter_app/lib/
├── main.dart                        # điếm vào, không thuộc tầng nào
│
├── shared/                          # tầng [001]/[011] — dùng chung mọi màn
│   ├── theme/                       # [001]
│   │   ├── color_tokens.dart        # 16 token màu, contrast 4.5:1/3:1
│   │   ├── typography.dart          # thang chữ, body >= 14sp
│   │   ├── spacing.dart             # kMinTouchTarget = 48.0
│   │   └── app_theme.dart           # ThemeData gộp từ 3 file trên
│   └── widgets/                     # [011] widget dùng lại, + app_shell
│       ├── app_shell.dart           # khung điều hướng 4 tab
│       ├── app_card.dart  status_chip.dart  tone_colors.dart
│       └── dialog_actions.dart      # nút AlertDialog đủ 48dp · offline_banner.dart [011 · CORE · US11]
│
├── features/                        # tầng [011] — MỘT THƯ MỤC / MỘT MÀN
│   ├── login/login_screen.dart                # [011 · AUTH · US01]
│   ├── dashboard/dashboard_screen.dart       # [011 · DASH · US02]
│   ├── request_list/request_list_screen.dart  # [011 · REVIEW · US03]
│   │                                    review_card.dart
│   ├── review_workspace/                      # [011 · REVIEW · US04]
│   │   ├── page/workspace_page.dart           # điều phối màn, giữ tên lớp công khai
│   │   ├── state/workspace_state.dart         # InheritedWidget cho trạng thái quyết định
│   │   └── widget/                            # thẻ tài liệu, tiến trình, tệp, phiên bản, AI, thanh quyết định
│   ├── ai_result/ai_result_screen.dart       # [011 · REVIEW · US05]
│   ├── approval/approval_screen.dart         # [011 · REVIEW · US06]
│   ├── revision_request/revision_screen.dart # [011 · REVIEW · US07]
│   ├── version_compare/compare_screen.dart   # [011 · REVIEW · US08]
│   ├── document_submit/submit_screen.dart   # [011 · SUBMIT · US09]
│   ├── submit_gate/submit_gate_screen.dart  # [011 · SUBMIT · US10]
│   ├── group_health/group_health_screen.dart # [011 · DASH · US12]
│   ├── rule_sets/rule_set_screen.dart        # [011 · REVIEW · US13]
│   └── profile/profile_screen.dart           # [011 · PROFILE · US14]
│
├── domain/                          # tầng thuần, KHÔNG biết Flutter có Color
│   ├── entities/review_entities.dart   # [101] ReviewRequest, AiFinding, Tone
│   └── usecases/filter_requests_uc.dart # [111] lọc/tìm yêu cầu
│
├── data/
│   ├── sources/mock_datasource.dart     # [201] dữ liệu mẫu, chưa biến đổi
│   └── repositories/review_repository.dart # [202] chuẩn hoá + phục hồi offline
```

**File .dart không thuộc tầng nào:****File .dart không thuộc tầng nào:** chỉ `main.dart` (điểm vào). Cổng kiểm cho phép miễn trừ đúng file này.

---

## 3. Luật import — chiều cho phép

| Từ tầng | Được import | Cấm import |
|---|---|---|
| `001` core | `001` | `011`, `101`, `111`, `201`, `202` |
| `101` entities | `101` | `011`, `001`, `201`, `202` |
| `111` usecases | `101`, `111` | `011`, `001`, `201`, `202` |
| `201` datasources | `101`, `201` | `011`, `001`, `111`, `202` |
| `202` repositories | `101`, `111`, `201`, `202` | `011`, `001` |
| `011` presentation | **tất cả** (trên cùng) | — |

Diễn giải: `011` là tầng trên cùng, được phép biết mọi thứ. Các tầng dưới **không được** biết
`011`. Giao tiếp đi qua interface rõ ràng.

---

## 4. Bảng ánh xạ mã Lab 2 ↔ CMPlan

| Lab 2 (PRM323) | CMPlan (PRM393) | Ghi chú |
|---|---|---|
| `1-PS-01` | `P01` | persona giảng viên |
| `1-PS-02` | `P02` | persona sinh viên |
| `1-E-01`…`1-E-06` | — | CMPlan không có tầng evidence |
| `1-UC-04` | `UC04` | số khớp trong trường hợp này |
| `1-US-04` | `US04` | |
| `2-FL-01` | `011_REVIEW_US04_flow` | |
| `3-SC-04` | `011_REVIEW_US04_workspace_screen` | |
| `4-TC-05` | `TC_US04_HP_01` | **số KHÔNG khớp** — tra bảng, đừng suy |
| `4-RG-01` | `001_CORE_rule_c1` | |

**Cảnh báo:** đừng suy mã CMPlan từ số của mã Lab 2. `4-TC-05` là test thứ 5 theo thứ tự tài liệu;
`TC_US04_HP_01` là test happy path đầu tiên của US04. Hai hệ đánh số độc lập.
