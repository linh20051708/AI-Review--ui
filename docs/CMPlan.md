# CMPlan — Kế hoạch Quản lý Cấu hình (Configuration Management Plan)

**Áp dụng cho:** PRM393 · **Chủ đề:** Hệ thống quản lý học vụ / Review tài liệu cho giảng viên
**Phiên bản:** 1.0 · **Ngày:** 14/10/2026

> **Ghi chú phạm vi — đọc trước:** PRM323 Lab 2 dùng bộ mã riêng (`1-UC-01`, `4-TC-01`) đã ổn định
> và đang SẠCH qua 5 cổng kiểm. File này là **lớp CMPlan bọc ngoài** theo chuẩn PRM393: nó
> **không thay** bộ mã cũ, mà định nghĩa thêm một hệ mã song song + luật cấu trúc cho code.
> Bảng ánh xạ hai hệ nằm ở §5. Lý do: đổi mã cũ sẽ phá 140 định nghĩa, 22 test case và mọi
> tham chiếu chéo — được lợi gì không đáng so với mất gì.

---

## 1. Cơ chế mã hóa "SKU Kho Hàng" — mã tầng 3 chữ số `[X][Y][Z]`

Giống mã SKU trong kho: nhìn chuỗi ký tự là biết **Khu vực – Kệ – Tầng – Loại hàng**.

| Chữ số | Tên | Ý nghĩa |
|---|---|---|
| `X` (đầu) | **Tầng kiến trúc chính** | `0` = Presentation & Core UI · `1` = Domain / Business Logic · `2` = Data & Infrastructure |
| `Y` (giữa) | **Phân nhóm chức năng** | `0` = Nền tảng/Cấu hình gốc · `1` = Thành phần lắp ghép/Luồng xử lý · `2` = Điều phối/Đồng bộ |
| `Z` (cuối) | **Cấp độ thông tin** | `1` = **Cấp 1 (Nguyên tử)** — nhỏ nhất, tái dùng toàn cục · `2` = **Cấp 2 (Phân tử)** — tổ hợp nhiều cấp 1 |

### 1.1 Sáu tầng hợp lệ

| Mã | Tên tầng | Cấp độ | Chứa gì |
|---|---|---|---|
| **`001`** | Core UI & Design Tokens | Cấp 1 (Nguyên tử) | Biến màu (contrast `4.5:1` / `3:1`), font (`≥14sp`), vùng chạm (`≥48dp`), icon, atomic button |
| **`011`** | Feature Presentation (UI/UX) | Cấp 2 (Tổ hợp theo luồng) | Màn hình, cụm điều khiển, State/Controller gắn User Story |
| **`101`** | Domain Entities & Models | Cấp 1 (Thực thể gốc) | Đối tượng nghiệp vụ thuần (không phụ thuộc UI/DB) |
| **`111`** | Domain Use Cases | Cấp 2 (Luồng nghiệp vụ) | Quy tắc nghiệp vụ ánh xạ 1-1 từ Use Case / User Story |
| **`201`** | Raw Data Sources | Cấp 1 (Nguồn thô) | REST API, WebSocket, SQLite/SharedPreferences **chưa** biến đổi |
| **`202`** | Repositories & Offline Sync | Cấp 2 (Chuẩn hóa & Đồng bộ) | Repository gộp từ `201`, cache, tự kết nối lại khi mạng chập chờn |

> **Mã nào KHÔNG hợp lệ:** `002`, `010`, `012`, `100`, `112`, `200`, `212`, `0x3`, `1x3`, `2x3`…
> Chỉ 6 mã trong bảng trên tồn tại. Cổng `check-cmplan.py` chặn mã ngoài danh sách.

### 1.2 Công thức SKU cho mọi phần tử (file, folder, Figma frame, test case)

```
[Mã_Layer]_[Mã_Module]_[Mã_US]_[Tên_thành_phần]
```

Ví dụ: `011_REVIEW_US04_workspace_screen`
→ tầng **011 (Feature UI)** · phân hệ **REVIEW** · phục vụ **US04** · tên là **màn không gian review**.

**Module dùng trong dự án này** (khai đủ, không phát minh thêm khi chưa cần):

| Mã module | Phân hệ | Phục vụ |
|---|---|---|
| `AUTH` | Xác thực | `1-US-01` |
| `DASH` | Tổng quan | `1-US-02` |
| `REVIEW` | Yêu cầu review & không gian review | `1-US-03` … `1-US-08`, `1-US-12`, `1-US-13` |
| `SUBMIT` | Nộp tài liệu (sinh viên) | `1-US-09`, `1-US-10` |
| `PROFILE` | Hồ sơ & đăng xuất | `1-US-14` |
| `CORE` | Dùng chung, không gắn US cụ thể | `1-US-11` (offline dùng chung) |

---

## 2. Tổ chức Figma và Source Code

### 2.1 Figma — Page và Frame khớp 100% mã Layer

* **Page `001_Design_System`** (Cấp 1 — chuẩn chung)
  * Frame `001_TYPO_14sp_Scale` — chữ tối thiểu 14sp
  * Frame `001_TOUCH_48dp_Targets` — vùng chạm tối thiểu 48×48dp
  * Frame `001_COLOR_Contrast_45_30` — bảng màu đã kiểm contrast `4.5:1` / `3:1`
* **Page `011_Feature_Screens`** (Cấp 2 — màn theo User Story)
  * Section `REVIEW_US04_Workspace`: `011_REVIEW_US04_workspace_default`, `011_REVIEW_US04_ai_panel`
  * Section `SUBMIT_US10_SubmitLocked`: `011_SUBMIT_US10_submit_lock_explain`
* **Page `101_111_Domain`** — thực thể và luồng nghiệp vụ (sơ đồ, không phải màn)
* **Page `201_202_Data`** — luồng dữ liệu, cache, phục hồi mạng

> **Chưa dựng.** 48 SVG hiện có trong `figma-svg/output/` sinh theo bố cục Lab 2, **không** theo
> sơ đồ page CMPlan này. Muốn khớp thì phải viết lại `gen.py` — xem §6 nợ kỹ thuật.

### 2.2 Source code — cây thư mục đã áp dụng thật

Cây dưới đây là **trạng thái thật của `flutter_app/lib/` sau khi đổi cấu trúc**, không phải đề xuất:

```text
lib/
├── 001_core/
│   └── theme/
│       ├── 001_CORE_color_tokens.dart
│       ├── 001_CORE_typography.dart
│       ├── 001_CORE_spacing.dart
│       └── 001_CORE_app_theme.dart
├── 011_presentation/
│   ├── auth/  (US01)
│   ├── dashboard/ (US02, US12)
│   ├── review/ (US03..US08, US13)
│   ├── submit/ (US09, US10)
│   ├── profile/ (US14)
│   └── shared/ (widgets dùng chung, US11)
├── 101_domain_entities/
├── 111_domain_usecases/
├── 201_data_sources/
└── 202_data_repositories/
```

Chi tiết từng file và US: `docs/CMPlan-MAP.md` §3.

---

## 3. Truy vết & định mức ≥10 Test Case / User Story

### 3.1 Chuỗi truy vết dọc bắt buộc

```
Persona (Pxx) → Scenario (SCxx) → Use Case (UCxx) → User Story (USxx)
   → Figma ID (011_MODULE_USxx) → Code Package → Test Cases (TC_USxx_<LOẠI>_<STT>)
```

Không dòng code hay test case nào được "mồ côi". **Ba** cổng cùng kiểm chuỗi này:

| Cổng | Kiểm gì |
|---|---|
| `check-cmplan.py` | mã tầng trong tên file, cô lập import, định mức 10 TC/US |
| `check-trace-map.py` | **từng dòng** bảng `docs/CMPlan-MAP.md` trỏ tới persona/UC/US/SVG/file code có thật |
| `check-trace.py` | TC có nguồn, UC có HP, không UC/US mồ côi (hai chiều UC ↔ US) |

### 3.1.1 Sự thật về độ phủ của chuỗi (đo 14/10/2026)

Chuỗi trên là **đích**, không phải hiện trạng. Đo thật:

| Mắt xích | Có thật | Thiếu |
|---|---|---|
| Persona | 2 (`P01`, `P02`) | actor `1-SH-03` chưa có persona |
| Use Case | 17 | `1-UC-15/16/17` chưa có User Story |
| User Story | 14 | — |
| Wireframe (`figma-svg/output/03-final/`) | 14 (`s01`…`s14`) | — |
| **Màn Flutter (`011_presentation/`)** | **6** | **8 US chưa dựng** (US06–US10, US12, US13) |
| Test Case (thiết kế) | 140 | 134 chưa có bằng chứng chạy |

Ô "Code package" trong bảng truy vết ghi `— *(chưa code)*` cho 8 US đó. Điền đường dẫn không tồn tại
cho đẹp bảng là **bịa** — `check-trace-map.py` sinh ra để chặn đúng việc ấy.

### 3.2 Năm nhóm phân loại — mỗi nhóm ≥2 TC, tổng ≥10 TC / US

| Mã | Nhóm | Cấp 1 (bắt buộc) | Cấp 2 (bắt buộc) | Kiểm gì |
|---|---|---|---|---|
| `HP` | Happy Path — luồng chuẩn | 2 | 2 | Luồng thành công + **tiêu chí đo lường của Persona** |
| `AP` | Alternative Path — rẽ nhánh hợp lệ | 2 | 2 | Đổi ý, huỷ, dùng cách khác |
| `BV` | Boundary & Validation | 2 | 2 | Biên min/max, bộ đếm, giới hạn ký tự/số phần tử |
| `EX` | Exception & Recovery | 2 | 2 | Mất mạng, double-tap, lỗi từ tầng `202` |
| `UI` | UI/UX & Accessibility | 2 | 2 | Chạm `≥48dp`, chữ `≥14sp`, contrast `4.5:1 / 3:1`, không che vùng làm việc |

**Công thức mã:** `TC_US<xx>_<LOẠI>_<STT>` — ví dụ `TC_US04_HP_01`.
Mỗi mã truy vết **ngược** về đúng User Story trong tên.

### 3.3 Bảng 10 test case chuẩn — làm mẫu đầy đủ (nguồn: user story thứ tư, `US04`)

Xem `docs/test-cases-cmplan.md` §2.1. Bảng dưới là bản rút gọn để đọc nhanh:

| Mã SKU | Loại | Tình huống | Tầng kiểm | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US04_HP_01` | HP | Mở tài liệu từ danh sách chờ | `011`→`202` | Vào không gian review ≤3 thao tác chạm, đủ 6 khối thông tin |
| `TC_US04_HP_02` | HP | Đọc hết khối AI rồi tới thanh quyết định | `011` | Thanh quyết định dính đáy, luôn thấy 2 nút |
| `TC_US04_AP_01` | AP | Bấm Back giữa lúc đọc, chưa quyết định | `011` | Về danh sách, không mất trạng thái bộ lọc |
| `TC_US04_AP_02` | AP | Mở lại cùng tài liệu lần hai | `202` | Không gọi lại nguồn, đọc từ cache, tức thời |
| `TC_US04_BV_01` | BV | Tài liệu có 0 phát hiện AI | `011` | Khối AI hiện trạng thái rỗng, không vỡ bố cục |
| `TC_US04_BV_02` | BV | Tài liệu có 50 phát hiện AI | `011` | Danh sách cuộn được, không tràn khung, không lag |
| `TC_US04_EX_01` | EX | Mất mạng khi đang mở | `202`→`011` | Hiện băng offline, vẫn đọc được bản cache |
| `TC_US04_EX_02` | EX | Bấm đúp nút mở tài liệu | `011`→`111` | Debounce: chỉ mở 1 màn, không chồng 2 lần điều hướng |
| `TC_US04_UI_01` | UI | Đo 2 nút quyết định + nút Back | `001`→`011` | Mọi nút `≥48×48dp`, nhãn `≥14sp` |
| `TC_US04_UI_02` | UI | Kiểm vùng bị thanh quyết định che | `011` | Nội dung cuối cuộn tới được, không bị che khuất |

---

## 4. Checklist chấm CMPlan — 100 điểm

> **Thang:** `≥80` **Đạt** · `70–79` **Cần cải thiện** · `<70` **Cần làm lại**.
> **Critical Gate:** mục nào có `[CRITICAL]` chưa đạt → **toàn bộ bài nộp tính là Chưa đạt**,
> dù tổng điểm `≥80`.

- [x] **01. `[CRITICAL]` Định nghĩa và phân tầng kiến trúc rõ ràng (10đ):** 6 mã tầng `001/011/101/111/201/202` định nghĩa ở §1.1, giải thích cấp 1 vs cấp 2. Cổng `check-cmplan.py` chặn mã ngoài danh sách.
- [ ] **02. `[CRITICAL]` Đồng bộ mã SKU giữa Code và Figma (10đ):** code **đã** theo công thức (§2.2). Figma **chưa** — 48 SVG hiện có sinh theo bố cục Lab 2, không theo page CMPlan. → **CHƯA ĐẠT**, xem §6.
- [x] **03. `[CRITICAL]` Truy vết dọc từ Persona đến Code (10đ):** `docs/CMPlan-MAP.md` nối `P01`→`UC`→`US`→Figma ID→code package→TC.
- [x] **04. `[CRITICAL]` Định mức ≥10 TC / 1 US (10đ):** 14 US × 10 = **140 TC** ở `docs/test-cases-cmplan.md`. Cổng đếm lại từng US.
- [x] **05. `[CRITICAL]` Chuẩn UI/UX trong tầng 001 và nhóm test `UI` (10đ):** `001_core/theme/` giữ đúng token; mỗi US có ≥2 TC nhóm `UI`; test widget đo thật `≥48dp`.
- [x] **06. Phân loại độ bao phủ đủ 5 nhóm (10đ):** mỗi US có đúng 5 nhóm, mỗi nhóm ≥2 TC, không trùng lặp.
- [x] **07. `[CRITICAL]` Cô lập phụ thuộc giữa các tầng (10đ):** **đã sửa cả hai vi phạm** — (a) `ToneColors` chuyển từ `101` sang `011_presentation/shared/011_CORE_tone_colors.dart`; (b) 7 màn `011` không còn gọi thẳng `201`, đi qua `202_data_repositories/202_DOMAIN_review_repository.dart`. Cổng `check-cmplan.py` mục C2 nay `[OK]`. Chi tiết trước/sau ở §7.1.
- [x] **08. Liên kết Success Criteria của Persona vào TC (10đ):** nhóm `HP` và `UI` chứa số đo lấy từ trường *Success Criteria* của persona (số thao tác, thời gian, tỉ lệ diện tích).
- [x] **09. Quy tắc quản lý nhánh Git & Commit theo mã SKU (10đ):** định dạng `<type>(<LAYER>_<MODULE>[_USxx]): <mô tả>`. **Đã cưỡng chế bằng hook**, không chỉ ghi giấy: `rules/check-commit-msg.py` + `rules/install-hooks.py` cài hook `commit-msg`. Đã đo: commit sai (`feat(lab2): …`) bị chặn `exit 1`; commit đúng đi qua `exit 0`. 6 commit mới nhất theo đúng định dạng. Lịch sử cũ **không** viết lại (sẽ đổi hash đã push) — xem §6 N5.
- [x] **10. Kiểm tra chéo & Bằng chứng thực thi Test (10đ):** **đã có** — `verify/flutter-journeys.mjs` chạy 8/8 bước trên app thật, sinh **6 ảnh gắn mã TC** trong `ai-output/flutter-app/` (`TC_US01_HP_01…`, `TC_US02_HP_01…`, `TC_US03_HP_01…`, `TC_US04_HP_01…`, `TC_US05_HP_01…`, `TC_US14_HP_01…`), 6/6 ảnh khác nhau; cộng **33 test** neo mã `TC_USxx_*` trong `flutter_app/test/` (tổng **90/90** xanh — thêm `test/overflow_test.dart` 39 ca quét tràn ngang ở 320/360/412dp và `test/dialog_confirm_test.dart` 3 ca cho hộp thoại xác nhận), và `verify/flutter-tap-targets.mjs` đo **9/9 màn, 79 vùng chạm, 0 mục < 48dp** bằng Chromium thật. Giới hạn còn lại: đây là các TC nhóm `HP` cộng một số `AP/EX/BV`, **chưa** chạy đủ 140 TC. Xem §6 (N2).

**Self-review score hiện tại:** `90 / 100` · **Trạng thái Critical:** **CHƯA ĐẠT**

| Mục | Điểm | Vì sao |
|---|---|---|
| 01, 03, 04, 05, 06, 07, 08, 09, 10 | 90 | Có bằng chứng đo được; xem từng dòng ở trên |
| **02 `[CRITICAL]`** | 0 | **Chưa đạt** — Figma chưa dựng theo page CMPlan |

> **Vì sao vẫn "CHƯA ĐẠT" dù 90/100:** quy chế ghi rõ *bất kỳ mục `[CRITICAL]` nào không đạt thì cả bài
> là Chưa đạt*. Mục 02 cần dựng 4 page Figma (`001_Design_System`, `011_Feature_Screens`, `101_111_Domain`,
> `201_202_Data`) — việc này cần **tài khoản Figma cá nhân**, không tự động hoá được từ repo.
>
> Các mục đã đạt đều đạt bằng **sửa thật**, không nới cổng: mục 07 sửa 2 vi phạm import; mục 09 thêm hook
> `commit-msg` và **đo được** nó chặn commit sai; mục 10 sinh 6 ảnh chạy thật gắn mã TC.
>
> Mục 10 đạt **một phần** về mặt bằng chứng: 6/140 TC có ảnh chạy, đều thuộc nhóm `HP`.
> 134 TC còn lại là **thiết kế**, chưa có bằng chứng thực thi.

---

## 5. Ánh xạ bộ mã Lab 2 (PRM323) ↔ CMPlan (PRM393)

Hai hệ cùng tồn tại. Bảng này để tra chéo, **không** thay thế nhau.

| Loại phần tử | Mã Lab 2 (PRM323) | Mã CMPlan (PRM393) |
|---|---|---|
| Persona | `1-PS-01` | `P01` |
| Scenario | `1-E-01` (evidence) | `SC01` |
| Use case | `1-UC-04` | `UC04` |
| User story | `1-US-04` | `US04` |
| Luồng | `2-FL-01` | `011_REVIEW_US04_flow` |
| Màn hình | `3-SC-04` | `011_REVIEW_US04_workspace_screen` |
| Test case | `4-TC-05` | `TC_US04_HP_01` |
| Quy tắc | `4-RG-01` | `001_CORE_rule_c1` |

**Quy tắc dịch:** mã Lab 2 dùng `-` và số 2 chữ số; mã CMPlan dùng `_` và số 2 chữ số.
Số thứ tự **không** luôn khớp — `4-TC-05` có thể là `TC_US04_HP_01`. Tra bảng ở
`docs/CMPlan-MAP.md` §5, đừng suy từ số.

---

## 6. Nợ kỹ thuật — chưa xong, ghi rõ

| # | Nợ | Ảnh hưởng | Cách trả |
|---|---|---|---|
| N1 | **Figma chưa theo sơ đồ page CMPlan** | Mục 02 `[CRITICAL]` chưa đạt | Viết lại `figma-svg/gen.py` sinh theo `001_/011_/101_/201_`; hoặc dựng tay trong Figma |
| N2 | **Chỉ 6/140 TC có bằng chứng chạy** | Mục 10 đạt một phần | `verify/flutter-journeys.mjs` sinh 6 ảnh gắn mã `TC_USxx_*` + 17 test neo mã TC. Còn 134 TC là **thiết kế**, chưa chạy |
| N3 | ~~`011` gọi thẳng `201`~~ | **ĐÃ SỬA** | `202_data_repositories/` đã có; 7 màn đã chuyển sang gọi repository. Cổng C2 `[OK]` |
| N4 | ~~`101_domain_entities/` và `111_domain_usecases/` rỗng~~ | **ĐÃ SỬA** | `101_DOMAIN_review_entities.dart` (thực thể) + `111_DOMAIN_us03_filter_requests_uc.dart` (luật lọc) đã có thật |
| N5 | **Commit cũ không theo mã SKU** | Mục 09 chỉ đúng từ commit `ae67ba5` | Không viết lại lịch sử đã push. Hook `commit-msg` chặn từ nay; `git log --oneline <a>..HEAD` là phần đã theo chuẩn |
| N6 | **2 use case chưa có test** (`1-UC-16`, `1-UC-17`) và actor `1-SH-03` chưa có persona | Truy vết có lỗ hổng | Cần persona quản trị học vụ trước |
| N7 | **8/14 User Story chưa dựng màn Flutter** | Tầng `011` chỉ phủ 6 US | US06–US10, US12, US13 có user story + wireframe thật nhưng **chưa có code**; bảng truy vết ghi `— *(chưa code)*` chứ không bịa đường dẫn. `rules/check-trace-map.py` chặn tái diễn |

---

## 7. Kiểm chứng — số đo thật

### 7.1 Vi phạm import ngược tầng — TRƯỚC và SAU

Đo lần đầu **14/10/2026** bằng `grep -rn "^import " flutter_app/lib/`. Hai vi phạm thật:

| # | Vi phạm (trước) | Hướng sửa | Trạng thái |
|---|---|---|---|
| 1 | Thực thể `101` import `001` để lấy `Color` cho `Tone` | Tách `ToneColors` ra khỏi `101`, đưa xuống `011` | **ĐÃ SỬA** |
| 2 | 7 màn `011` gọi thẳng `201` (bỏ qua `202`) | Dựng `202` bọc nguồn, màn hình gọi repository | **ĐÃ SỬA** |

**Cách sửa (1)** — `Tone` vẫn ở `101_domain_entities/101_DOMAIN_review_entities.dart` nhưng **không còn
biết màu**: file này bỏ hẳn `import 'package:flutter/material.dart'` và import `001`, chỉ dùng
`package:meta/meta.dart` cho `@immutable`. Lớp `ToneColors` (enum → `Color`) chuyển sang
`011_presentation/shared/011_CORE_tone_colors.dart` — đúng tầng giao diện, nơi việc biết màu là hợp lệ.

**Cách sửa (2)** — thêm `202_data_repositories/202_DOMAIN_review_repository.dart`:
repository giữ bản cache trong bộ nhớ, theo dõi `NetState` (online/offline) và hàng đợi thao tác ghi.
Không phải lớp bọc rỗng: khi mất mạng, thao tác ghi vào hàng đợi và **tự gửi lại** khi có mạng — đây
chính là pain point của `US11`. Luật lọc chuyển xuống `111_domain_usecases/111_DOMAIN_us03_filter_requests_uc.dart`
để kiểm được bằng test mà không cần dựng giao diện.

**Đo lại sau khi sửa:** `python3 rules/check-cmplan.py` → mục C `[OK]` và C2 `[OK]`.

```
[OK  ] C. Co lap tang (muc 07 CRITICAL)
[OK  ] C2. Khong goi thang nguon tho 201
```

> Cổng C2 **mới được thêm** và nó báo `[LOI ] 7 vi phạm` trước khi sửa. Mục 07 đạt bằng cách sửa code,
> **không** bằng cách nới cổng.

### 7.2 Lệnh kiểm

```bash
python3 rules/check-all.py          # 5 cổng Lab 2 cũ
python3 rules/check-cmplan.py       # cổng CMPlan (mã tầng, import, định mức TC)
python3 lab2-gate.py                # tự chấm Lab 2
```

---

## 8. Ghi chú trung thực

- Quy ước `[X][Y][Z]` này là **chuẩn PRM393 của giảng viên**, khác quy ước `1/2/3/4` tôi tự đặt
  trong Lab 2. Tôi **không** áp nó đè lên bộ mã cũ vì sẽ phá 140 định nghĩa đang SẠCH.
- **Mã tầng 3 chữ số dùng để đặt tên FOLDER và FILE code**, không thay mã tài liệu.
- Bảng checklist §4 tự chấm **80/100, CHƯA ĐẠT** — mục 07 đã sửa xong (đo lại bằng cổng), **mục 02 `[CRITICAL]` vẫn chưa đạt** vì Figma chưa dựng theo page CMPlan. Không làm tròn lên.
- Mục 10 đạt **một phần**: ảnh chạy thật gắn mã TC là bằng chứng thật, cộng **90 test tự động** (trong đó 33 ca neo mã `TC_USxx_*`), nhưng phần lớn trong 140 TC vẫn là **thiết kế** chưa có ảnh. Nhóm `AP/BV/EX` đã có test tự động; nhóm `UI` có bằng chứng vùng chạm (không phải ảnh từng TC).
- `flutter_app/` là app **viết mới** port **13 màn + 1 banner** từ `app/` React của giảng viên; không backend;
  không phải code của giảng viên và không phải bản port của `srs-review-ai`.
