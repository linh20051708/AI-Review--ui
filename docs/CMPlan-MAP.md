# CMPlan-MAP — Bảng ánh xạ & Truy vết dọc

**Kèm theo:** `docs/CMPlan.md` · **Ngày:** 14/10/2026

Bảng này nối liền mạch: `Persona → Scenario → Use Case → User Story → Figma ID → Code → Test Case`.
Tra ở đây, **đừng suy số** từ mã này sang mã kia.

---

## 1. Chuỗi truy vết dọc — 14 User Story

| Persona | Scenario | Use Case | User Story | Figma ID (CMPlan) | Wireframe thật (`figma-svg/output/03-final/`) | Code thật trong `flutter_app/lib/` | Test Cases |
|---|---|---|---|---|---|---|---|
| `P01` giảng viên | `SC01` | `1-UC-01` | `1-US-01` | `011_AUTH_US01_login_screen` | `s01-dang-nhap.svg` | `011_presentation/auth/us01/011_AUTH_US01_login_screen.dart` | `TC_US01_*` |
| `P01` giảng viên | `SC02` | `1-UC-02` | `1-US-02` | `011_DASH_US02_dashboard_screen` | `s02-tong-quan.svg` | `011_presentation/dashboard/us02/011_DASH_US02_dashboard_screen.dart` | `TC_US02_*` |
| `P01` giảng viên | `SC03` | `1-UC-03` | `1-US-03` | `011_REVIEW_US03_request_list` | `s03-yeu-cau-review.svg` | `011_presentation/review/us03/011_REVIEW_US03_request_list_screen.dart` | `TC_US03_*` |
| `P01` giảng viên | `SC04` | `1-UC-04` | `1-US-04` | `011_REVIEW_US04_workspace_screen` | `s04-khong-gian-review.svg` | `011_presentation/review/us04/011_REVIEW_US04_workspace_screen.dart` | `TC_US04_*` |
| `P01` giảng viên | `SC05` | `1-UC-05` | `1-US-05` | `011_REVIEW_US05_ai_result_screen` | `s05-ket-qua-ai.svg` | `011_presentation/review/us05/011_REVIEW_US05_ai_result_screen.dart` | `TC_US05_*` |
| `P01` giảng viên | `SC06` | `1-UC-06` | `1-US-06` | `011_REVIEW_US06_class_screen` | `s06-lop-hoc.svg` | — *(chưa code)* | `TC_US06_*` |
| `P01` giảng viên | `SC07` | `1-UC-07` | `1-US-07` | `011_REVIEW_US07_project_screen` | `s07-project.svg` | — *(chưa code)* | `TC_US07_*` |
| `P01` giảng viên | `SC08` | `1-UC-08` | `1-US-08` | `011_REVIEW_US08_document_screen` | `s08-tai-lieu.svg` | — *(chưa code)* | `TC_US08_*` |
| `P02` sinh viên | `SC09` | `1-UC-09` | `1-US-09` | `011_SUBMIT_US09_semester_screen` | `s09-hoc-ky.svg` | — *(chưa code)* | `TC_US09_*` |
| `P02` sinh viên | `SC10` | `1-UC-10` | `1-US-10` | `011_SUBMIT_US10_ruleset_screen` | `s10-rule-set.svg` | — *(chưa code)* | `TC_US10_*` |
| `P01`+`P02` | `SC11` | `1-UC-11` | `1-US-11` | `011_CORE_US11_offline_banner` | `s11-sinh-vien.svg` | `011_presentation/shared/011_CORE_US11_offline_banner.dart` | `TC_US11_*` |
| `P01` giảng viên | `SC12` | `1-UC-12` | `1-US-12` | `011_DASH_US12_group_health` | `s12-nhom.svg` | — *(chưa code)* | `TC_US12_*` |
| `P01` giảng viên | `SC13` | `1-UC-13` | `1-US-13` | `011_REVIEW_US13_notify_screen` | `s13-thong-bao.svg` | — *(chưa code)* | `TC_US13_*` |
| `P01`+`P02` | `SC14` | `1-UC-14` | `1-US-14` | `011_PROFILE_US14_profile_screen` | `s14-tai-khoan.svg` | `011_presentation/profile/us14/011_PROFILE_US14_profile_screen.dart` | `TC_US14_*` |

### 1.1 Ghi chú trung thực về bảng trên

Cột **Wireframe thật** trỏ tới file SVG có thật trong `figma-svg/output/03-final/`. Cột này được
`rules/check-trace-map.py` đối chiếu với đĩa.

Cột **Code thật** chỉ ghi đường dẫn khi file **tồn tại**. Ô `— *(chưa code)*` là **khai báo trung thực**:
user story và wireframe có thật, nhưng bản demo Flutter **chưa dựng màn đó**. Cụ thể:

| Có code (6) | Chưa code (8) |
|---|---|
| US01 đăng nhập · US02 tổng quan · US03 danh sách review · US04 không gian review · US05 kết quả AI · US14 hồ sơ | US06 lớp học · US07 project · US08 tài liệu · US09 học kỳ · US10 rule set · US11 *(banner dùng chung, có file)* · US12 nhóm · US13 thông báo |

> US11 có file `011_CORE_US11_offline_banner.dart` nhưng là **component dùng chung**, không phải màn riêng.
> 8 US chưa code **không** phải "đã xong" — `docs/CMPlan.md` §6 ghi ở N4.

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
├── main.dart                                   # điểm vào, không thuộc tầng nào
│
├── 001_core/                                   # [001] Cấp 1 — nguyên tử, dùng chung
│   └── theme/
│       ├── 001_CORE_color_tokens.dart          # 16 token màu, contrast 4.5:1/3:1
│       ├── 001_CORE_typography.dart            # thang chữ, body >= 14sp
│       ├── 001_CORE_spacing.dart               # kMinTouchTarget = 48.0
│       └── 001_CORE_app_theme.dart             # ThemeData gộp từ 3 file trên
│
├── 011_presentation/                           # [011] Cấp 2 — màn hình theo US
│   ├── auth/       us01/   → 011_AUTH_US01_login_screen.dart
│   ├── dashboard/  us02/   → 011_DASH_US02_dashboard_screen.dart
│   │                us12/  → 011_DASH_US12_group_health_card.dart
│   ├── review/     us03/   → 011_REVIEW_US03_request_list_screen.dart
│   │                us04/  → 011_REVIEW_US04_workspace_screen.dart
│   │                us05/  → 011_REVIEW_US05_ai_result_screen.dart
│   │                us06/  → 011_REVIEW_US06_decision_bar.dart
│   │                us07/  → 011_REVIEW_US07_revision_dialog.dart
│   │                us08/  → 011_REVIEW_US08_version_compare.dart
│   │                us13/  → 011_REVIEW_US13_rule_context.dart
│   ├── submit/     us09/   → 011_SUBMIT_US09_submit_screen.dart
│   │                us10/  → 011_SUBMIT_US10_submit_locked.dart
│   ├── profile/    us14/   → 011_PROFILE_US14_profile_screen.dart
│   ├── shared/     us11/   → 011_CORE_US11_offline_banner.dart
│   └── app_shell.dart                          # khung điều hướng 4 tab
│
├── 101_domain_entities/                        # [101] Cấp 1 — thực thể thuần
│   └── 101_DOMAIN_review_entities.dart         # ReviewRequest, AiFinding, Tone (KHÔNG có Color)
│
├── 111_domain_usecases/                        # [111] Cấp 2 — luật nghiệp vụ
│   ├── 111_DOMAIN_us03_filter_requests_uc.dart # lọc/tìm yêu cầu
│   └── 111_DOMAIN_us04_load_workspace_uc.dart  # gộp dữ liệu cho màn workspace
│
├── 201_data_sources/                           # [201] Cấp 1 — nguồn thô
│   └── 201_DOMAIN_mock_datasource.dart         # dữ liệu mẫu, chưa biến đổi
│
└── 202_data_repositories/                      # [202] Cấp 2 — chuẩn hoá + phục hồi
    ├── 202_DOMAIN_review_repository.dart       # bọc 201, cache, trạng thái offline
    └── 202_DOMAIN_sync_manager.dart            # hàng đợi khi mất mạng, tự gửi lại
```

**File .dart không thuộc tầng nào:** chỉ `main.dart` (điểm vào). Cổng kiểm cho phép miễn trừ đúng file này.

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
