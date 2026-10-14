# Bằng chứng đo được — app nền `AI-Review--ui`

Đo ngày 2026-10-13 tại `/Volumes/SSD/Dev/active/PRM392_FlutterMobile/prm323-lab2/app`
(`npm run build` → `vite preview :4173` → Playwright/Chromium headless, viewport 412×892).

## 1. Build & typecheck — ĐẠT

| Bước | Lệnh | Kết quả |
|---|---|---|
| Cài phụ thuộc | `npm install` | RC=0 |
| Typecheck | `npx tsc --noEmit` | **RC=0, 0 lỗi** |
| Build | `npm run build` | **RC=0**, 2006 module |
| Bundle | — | JS `585.54 kB` (gzip 166.13), CSS `34.39 kB` (gzip 7.24) |
| Preview | `vite preview :4173` | HTTP **200** |

Cảnh báo (không chặn): chunk JS > 500 kB sau minify → nên code-split.

## 2. Render 13 route — KHÔNG vỡ layout

Tất cả route trả nội dung thật, `overflowX = 0` (không tràn ngang ở 412px), app shell `.mobile-app` hiện diện,
`title = "AI Review App"`, 17 link điều hướng.

| Route | Dòng text | Nút | minTap |
|---|---|---|---|
| /dashboard | nhiều | 6 | thấp |
| /documents | 75 | 12 | 18 |
| /students | **391** | 1 | 24 |
| /groups | 208 | 5 | 48 |
| /notifications | 19 | 0 | 48 |
| /profile | 33 | 1 | 48 |

## 3. FINDING THẬT — tap target < 44px (WCAG 2.5.8 / Material 3 ≥48dp) — **ĐÃ SỬA 14/10**

> **TRẠNG THÁI: ĐÃ SỬA.** Bảng dưới là **số đo trước khi sửa**, giữ nguyên làm bằng chứng.
> Đo lại sau khi sửa bằng `verify/tap-targets.mjs` (script nằm trong repo, tái lập được):
> **0/920 vùng chạm < 48×48px** (trước: **377/920**, tức **41,0%**).
>
> Sửa gì: sidebar `min-h-12`; popover lọc `h-10`→`h-12`; ô tìm kiếm `min-h-12` (trước bị 46px do
> khung `h-12` có viền ăn vào); `min-h-[44px]`/`[36px]`/`[40px]`/`[32px]` **đè lên** `min-h-12` của
> `<Button>` — đã gỡ cả 5 chỗ. Gốc rễ là các override này âm thầm hạ ngưỡng bảo đảm.
>
> **Lưu ý ngưỡng:** bảng dưới đếm theo ngưỡng **44px** tại thời điểm đo. Ngưỡng chính thức
> áp dụng cho bài nộp là **48×48 dp** (Chuẩn chung C4), nên số phần tử vi phạm thực tế
> **cao hơn** con số trong bảng này. Cột số đo từng phần tử vẫn đúng và tái sử dụng được.

Đo bằng `getBoundingClientRect()` trên mọi `button, a, [role=button], input, select`:

| Route | Số target < 44px | Ví dụ nặng nhất |
|---|---|---|
| `/students` | **118** | link `Lớp: SE1701(SWP391)` **149×26**; `Group 01` **67×24** |
| `/reviews` | 8 | `Xóa bộ lọc` **69×18**; chip `Chờ review` 103×28; `<select>` 148×32 |
| `/dashboard` | 6 | `Xóa bộ lọc` **69×18**; link `Xem tất cả` **62×17** |
| `/projects` | 6 | chip `Fall 2026` 92×28; `Đang hoạt động` 130×28 |
| `/documents` | 5 | input search **321×20**; `Xóa bộ lọc` 69×18 |
| `/groups` | 0 | — |

Nhóm nguyên nhân:
1. **Link hạng 2 trong danh sách** (`Lớp: …`, `Group …`, `Xem tất cả`) dùng `text-[12px]` + `py-1` → cao 17–26px.
2. **Chip lọc nhanh** (`Fall 2026`, `Bộ lọc`, `Đang hoạt động`) cao 28–40px.
3. **Ô nhập tìm kiếm** chỉ có `<input>` cao 20px (khung bao ngoài cao hơn, nhưng vùng bấm của chính input là 20px).

Đây là **bằng chứng thật** để dùng cho mục C (critique) và mục Accessibility của Lab 2 — không bịa.

## 3b. FINDING THẬT — tap target app Flutter < 48dp — **ĐÃ SỬA 14/10 (đợt 2)**

> Đo bằng `verify/flutter-tap-targets.mjs` trên **Chromium thật**, bản build
> `flutter build web --release`, viewport 412×892.
>
> **Kết quả cuối: 8/8 màn ĐẠT — 77 vùng chạm đo được, 0 mục < 48dp, 0 lỗi console.**
>
> **Trước khi sửa: 7 vùng chạm đo được ở đúng 40dp** (dưới ngưỡng C4 48dp):
>
> | Màn | Phần tử | Cao đo được |
> |---|---|---|
> | US01 đăng nhập | `Đăng nhập bằng SSO trường` | 40 |
> | US01 đăng nhập | `Đăng nhập` | 40 |
> | US01 đăng nhập | `Quên mật khẩu?` | 40 |
> | US04 không gian review | `Cần chỉnh sửa` | 40 |
> | US04 không gian review | `Phê duyệt` | 40 |
> | US03 danh sách review | `Mô phỏng lỗi` | 40 |
> | US14 hồ sơ | `Đăng xuất` | 40 |
>
> **Nguyên nhân gốc:** `outlinedButtonTheme`/`filledButtonTheme`/`textButtonTheme`
> trong `001_CORE_app_theme.dart` **đều khai `minimumSize = 48`**, nhưng ở những chỗ
> này chiều cao từ cha truyền xuống là ràng buộc **tight**, nên `minimumSize` bị
> vô hiệu và nút co về **40** (mặc định Material).
>
> **Cách sửa đã kiểm chứng là ăn:** bọc `SizedBox(height: AppSpace.tapMin)` **trực
> tiếp quanh từng nút**. Đã thử và **KHÔNG ăn** ở bốn cách khác — ghi lại để không
> ai đi lại: (1) `minimumSize` từ theme; (2) `SizedBox(height: 48)` bọc ngoài `Row`;
> (3) `SizedBox(height: 96)` (thử quá lên, vẫn 40); (4) `styleFrom(minimumSize:)`
> ngay trên nút.
>
> **Ba cách đo độc lập đều xác nhận 48 sau khi sửa:** node semantics cao đúng 48;
> quét từng 2px quanh nút cho vùng kích hoạt đúng 48; và **đếm pixel** màu brand
> `#146B55` trên ảnh chụp — 96 device px ở `deviceScaleFactor: 2` = **48,0 CSS px**
> (trước sửa: 80 device px = 40,0).
>
> **Ba cái bẫy đo lường đã trả giá** (ghi vào header script luôn):
> 1. Đo node khi trang đang cuộn hoặc node bị cắt ở mép viewport trả về số rác
>    (đã gặp 20,5dp và 3,3dp cho những nút thực chất 48dp). Phải cuộn nút vào giữa
>    màn rồi đo lại, và chỉ nhận mục ổn định qua ≥2/3 lần đo.
> 2. **App KHÔNG lưu session** — `page.goto()` là về màn đăng nhập, nên script
>    reload giữa các màn từng báo oan "4/8 màn không mở được".
> 3. Nút **`Back` ở header màn Tổng quan là ĐĂNG XUẤT** (`pushNamedAndRemoveUntil('/login')`),
>    không phải "quay lại". Điều hướng đúng là **thanh tab đáy** (`Tổng quan`,
>    `Review`, `Thông báo`, `Hồ sơ`) — nhãn tab thật là `Review`, không phải
>    `Yêu cầu review` (đó là tiêu đề màn).

## 4. Contrast WCAG 1.4.3 — ĐẠT toàn bộ cặp màu chữ

Tính theo công thức độ chói tương đối WCAG trên 19 cặp token (script `/tmp/contrast.mjs`):

| Cặp (chữ trên nền) | Tỉ lệ | Normal ≥4.5 | Large ≥3.0 |
|---|---|---|---|
| muted / canvas `#66736d` on `#fafbfa` | **4.78** | ✓ | ✓ |
| olive / olive-soft `#637344` on `#f1f4e9` | 4.64 | ✓ | ✓ |
| muted / subtle | 4.68 | ✓ | ✓ |
| rust / rust-soft | 4.80 | ✓ | ✓ |
| muted / white | 4.96 | ✓ | ✓ |
| amber / amber-soft | 5.11 | ✓ | ✓ |
| danger / danger-soft | 5.38 | ✓ | ✓ |
| brand / brand-soft `#146b55` on `#eaf4ed` | 5.72 | ✓ | ✓ |
| brand / brand-tint | 5.94 | ✓ | ✓ |
| brand / white | 6.43 | ✓ | ✓ |
| ink / canvas `#24332d` on `#fafbfa` | **13.24** | ✓ | ✓ |
| ink / white | 13.24+ | ✓ | ✓ |

**Không có cặp màu chữ nào FAIL.** Thấp nhất là `muted/canvas` = 4.78 (vẫn trên ngưỡng 4.5).
`line/white` = 1.25 là **màu viền** (không phải chữ) — ngoài phạm vi 1.4.3.

→ Kết luận trung thực: **bảng màu của app nền đạt WCAG AA cho văn bản**. Điểm yếu của app nằm ở
**kích thước vùng bấm** (mục 3), không phải màu.

## 5. Bề rộng 360dp — không vỡ layout

Đo 9 route ở viewport **360×800**:

| Route | overflowX |
|---|---|
| dashboard, classes, projects, reviews, students, documents, groups, semesters, profile | **0** (tất cả) |

`/dashboard` có 13 phần tử "vượt khung" (x=381→749 > 360) nhưng đều là **con của một khối thống kê cuộn ngang**
(`Lớp`, `Sinh viên`, `Nhóm` + badge số đếm). Document `scrollWidth == clientWidth` → khối đó tự cuộn trong
khung riêng, **không phải lỗi vỡ layout**. Ghi đúng bản chất, không thổi thành bug.

## 6. Việc CÒN PHẢI làm

- Chạy 3 luồng nghiệp vụ đầu-cuối trên trình duyệt thật (xem `ux/user-flow.md`).
- Dựng file Figma Design 6 page (việc của người nộp).
- Dọn file thừa `app/index (2).html`.

## 3c. Tràn ngang trong `flutter_app` — quét bằng `flutter test` (14/10, đợt 2)

**Vì sao phải đổi cách đo.** `verify/flutter-tap-targets.mjs` lái app trong Chromium thật
nhưng chỉ thấy bố cục ở **đúng một bề rộng** (412dp) và **đúng vị trí cuộn**. Lỗi tràn ngang ở
320dp hoặc ở một mục nằm ngoài vùng nhìn thì cổng đó **mù**. Bổ sung `flutter_app/test/overflow_test.dart`:
dựng lại **13 màn × 3 bề rộng (320/360/412dp) = 39 ca**, mỗi ca khẳng định `takeException() == null`.

**Kết quả đã đo:**

| Lần chạy | Số ca ĐẠT | Ghi chú |
|---|---|---|
| Trước khi sửa | 0 / 15 | `StatCard` bung ở **mọi** màn dùng nó |
| Sau khi sửa `StatCard` + 9 chỗ khác | **39 / 39** | xem bảng dưới |

**9 lỗi THẬT đã bắt và sửa** (đều là `Row`/`Column` không cho con co lại):

| # | File:dòng | Tràn đo được | Bản chất |
|---|---|---|---|
| 1 | `shared/011_CORE_shared_status_chip.dart` `StatCard` | bung **13/13 màn** | `Expanded` trong `Column` gặp cha **cao vô hạn** → `RenderFlex ... incoming height constraints are unbounded` |
| 2 | `shared/011_CORE_shared_status_chip.dart` `StatCard` (lần 2) | 17–48px @320dp | `GridView childAspectRatio:1.6` cho ô **cao chốt nhưng thấp** → nội dung tràn xuống |
| 3 | `review/us06/...approval_screen.dart:105` | **188px** | `Row` nhãn + `StatusChip` thiếu `Expanded`/`Flexible` |
| 4 | `shared/011_CORE_shared_status_chip.dart` `StatusChip` | **113px** | chip dùng chung, `Text` không có `Flexible` |
| 5 | `review/us07/...revision_screen.dart:98` | **127 / 87 / 35px** @320/360/**412dp** | như #3, tràn cả ở **bề rộng điện thoại thật** |
| 6 | `dashboard/us12/...group_health_screen.dart:63` | 53 / 13px @320/360dp | 2 chip lọc trong `Row` thiếu `Expanded` |
| 7 | `review/us03/...review_card.dart:31` | 14px @320dp | `Expanded` + `StatusChip` thiếu `Flexible` |
| 8 | `review/us03/...request_list_screen.dart:178` | 42px @320dp | `Spacer()` không nén được nhãn đếm |
| 9 | `review/us04/...workspace_screen.dart:116`, `auth/us01/...login_screen.dart:234`, `profile/us14/...profile_screen.dart:148` | 6,3 / 37 / 43px @320dp | `Expanded`+`StatusChip`, nhãn "hoặc dùng tài khoản nội bộ", cặp nhãn–giá trị |

**Cách sửa, một luật duy nhất:** mọi `Text` nằm cạnh một widget khác trong `Row` phải nằm trong
`Expanded`/`Flexible` (hoặc có `overflow: TextOverflow.ellipsis`). Không thêm `Expanded`/`Flexible`
vào chỗ mà cha **có thể** cao vô hạn.

**Bài học về DỤNG CỤ ĐO:** cổng trình duyệt và cổng `flutter test` **không thay thế nhau** —
cổng trình duyệt bắt được ngưỡng chạm thật + lỗi console, cổng widget bắt được tràn ở mọi bề rộng
mà trình duyệt không mô phỏng. Giữ **cả hai**.

**Về hộp thoại xác nhận — kết luận đã sửa lại.** Đợt trước tôi kết luận "`await showDialog` không
bao giờ trả về" chỉ vì app chạy trên web không đổi trạng thái quan sát được sau khi hộp thoại đóng.
Kết luận đó **SAI**: `test/dialog_confirm_test.dart` (3 ca) gọi thẳng `tester.tap` trên
`AlertDialog` và **PASS** — thông báo "Trạng thái đã cập nhật" có hiện, nhãn đổi sang trạng thái
cuối, log `[202] da gui: Phê duyệt (review-001)` có chạy. Nguyên nhân là **bất đối xứng của
cây semantics Flutter-web**: sau khi hộp thoại đóng, phần cây semantics được dựng lại và
Playwright không đọc ra nội dung mới. **App đúng, dụng cụ đọc sai** — đúng loại lỗi đã gặp ở mục 3
(`Xem tất cả` 20,5dp giả).

## 3d. Ba lỗi "app báo sai cho người dùng" (14/10, đợt 3)

Tìm bằng cách tự hỏi: *thông báo trên màn có đúng với dữ liệu thật không?* Cả ba đều **im lặng** —
không cổng nào bắt được, vì mọi cổng chỉ kiểm hình thức (mã ID, tầng, số TC), không kiểm ngữ nghĩa.

| # | Chỗ sai | Biểu hiện người dùng thấy | Bằng chứng |
|---|---|---|---|
| 1 | `202_DOMAIN_review_repository.dart` `write()` | Bấm Phê duyệt → hiện "Trạng thái đã cập nhật." nhưng `byId(id).status` **không đổi**. `write()` chỉ `debugPrint` rồi `return true` | `test/repository_write_test.dart` — 3 ca ĐỎ trước khi sửa |
| 2 | `review/us04/...workspace_screen.dart` | Màn chi tiết **không hề gọi `write()`** — hai nút quyết định chỉ hiện toast. Màn là `StatelessWidget` nên cũng không thể đổi chip | `test/approve_flow_test.dart` TC_US06_HP_04 |
| 3 | Không màn nào nghe `ReviewRepository` | `ChangeNotifier` có `notifyListeners()` nhưng **0 người đăng ký** (`grep -rn "addListener\|ListenableBuilder"` = rỗng). Duyệt xong, danh sách và Tổng quan vẫn hiện số cũ | `grep` = 0 kết quả trước khi sửa |

**Sửa:** thêm `ReviewRequest.copyWith`; `write()` áp dụng thật (`_apply`), `_flushQueue()` áp dụng
quyết định xếp hàng; `requests()` **sao chép** thay vì alias list `DemoData`; US04 thành
`StatefulWidget` và gọi `write()`; US03 + US02 đăng ký `addListener`.

**Kiểm chứng cổng ĐỎ được** (bắt buộc — test luôn-xanh là test vô giá trị): tắt
`addListener` ở Tổng quan → `TC_US02_HP_03` **ĐỎ** (`Found 0 widgets with text "2"`), bật lại → XANH.
Lần đầu tôi viết test này SAI: `boot()` để màn ở tab Review nên phép đếm khớp nhầm chỗ và test
xanh cả khi tắt listener — đã sửa để đi tới Tổng quan rồi mới khẳng định.

**Bẫy đã gặp:** `AppShell` dùng `switch (_index)`, nên **đổi tab là dựng lại màn từ đầu**. Muốn
chứng minh một màn có nghe repository thì phải để màn **yên tại chỗ** mà dữ liệu đổi; đi vòng qua
tab khác rồi quay lại thì màn mới đọc dữ liệu mới **kể cả khi không có listener**.
