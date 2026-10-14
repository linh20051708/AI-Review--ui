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

## 3e. Nút chết — bấm không làm gì (14/10, đợt 4)

Cùng họ với §3d: giao diện **hứa** một hành động rồi không làm gì. Khác ở chỗ ở đây
không có thông báo sai để đối chiếu — nút chỉ im lặng. Tìm bằng cách quét
`onPressed: () {}` / `onTap: () {}` trong `flutter_app/lib/`.

| # | Nút | Vị trí | Vì sao tệ |
|---|---|---|---|
| 1 | `Tìm kiếm` | `011_CORE_app_shell.dart` thanh tiêu đề | Có mặt ở **MỌI màn**, app không có màn tìm kiếm nào |
| 2 | Thẻ tệp đính kèm | `us04/...workspace_screen.dart::_attachment` | Tự khai `Semantics(button: true, label: 'Mở tài liệu …')` → **trình đọc màn hình đọc lên như nút mở được tài liệu**. Nút chết thường chỉ im; nút này còn **nói dối** |

**Sửa:**
1. `Tìm kiếm` → chuyển sang tab Review + focus thẳng ô tìm kiếm (truyền "vé"
   `focusSearchToken`, vì nút nằm ngoài màn nên không gọi thẳng `FocusNode` được).
2. Thẻ tệp → mở `showModalBottomSheet` xem trước thật. Không có backend tệp nên sheet
   hiện đúng thứ hệ thống BIẾT (tên, phiên bản, số trang, người nộp) và **nói rõ là bản
   demo**, không bịa nội dung trang.

**Cổng chống tái phát:** `rules/check-dead-controls.py` — mục thứ 8 trong `check-all.py`.
Quét `onPressed`/`onTap`/`onLongPress`/`onChanged`/`onSubmitted` thân rỗng, bỏ qua dòng
chú thích. Muốn cố ý để nút không hoạt động thì phải viết
`// ignore: dead-control — <lý do>`.

**Đã chứng minh cổng ĐỎ được:**
- Code sạch: `Quet 0 handler rong` → `[OK]`, exit 0.
- Tiêm lại `onPressed: () {}` vào nút Tìm kiếm: `[FAIL] 1 NUT CHET` ở đúng
  `011_CORE_app_shell.dart:46`, exit 1.
- Thêm dấu `ignore: dead-control` → về `[OK]`, exit 0. Khôi phục code gốc → `[OK]`.

**Bài học về test tự viết:** hai lần test của chính tôi **xanh giả** trước khi đúng:
(a) kiểm `find.textContaining('Xem trước')` — nhưng thẻ tệp **tự có** chữ
"Xem trước 12 trang" nên phép kiểm luôn đúng; phải đổi sang đếm xem có **thêm** bề mặt
mới mở ra không. (b) không cuộn tới thẻ tệp trước khi bấm. Cả hai đều là
"test tự đúng" — phải tự hỏi *test này có thể ĐỎ vì lý do gì* trước khi tin nó.

## 3f. Tổng quan đếm thiếu một trạng thái (14/10, đợt 5)

Tiếp đợt 4: soi lớp "giao diện nói thiếu sự thật" — đối chiếu SỐ HIỆN TRÊN MÀN
với DỮ LIỆU GỐC trong `201_DOMAIN_mock_datasource.dart`.

Dữ liệu có **8** yêu cầu: `waiting 4, inReview 1, needsRevision 1, approved 1,
notAccepted 1`. Tổng quan có 4 thẻ số liệu (Chờ / Đang review / Đã phê duyệt /
Cần chỉnh sửa) = 4+1+1+1 = **7**. Trạng thái `notAccepted` ("Không đạt") **không
được thẻ nào đếm** — giảng viên nhìn Tổng quan sẽ thiếu mất một tài liệu đã bị
trả về, và không có cách nào từ Tổng quan nhận ra sự tồn tại của nó.

Lỗi im lặng thuộc họ §3d/§3e: không có thông báo sai, chỉ là con số không khớp.
Đặc biệt nguy hiểm vì nó **dưới đếm** workload — giảng viên tưởng còn 7 việc mà
thực ra có 8.

**Sửa:** thêm thẻ thứ 5 "Không đạt" (`Tone.danger`, icon `cancel_outlined`), đọc
từ getter `_rejected`. Giờ 5 thẻ = 4+1+1+1+1 = 8 = đúng tổng.

**Cổng chống tái phát:** `test/dashboard_totals_test.dart` — (a) tổng giá trị 5
`StatCard` phải **bằng đúng** `requests().length`, (b) phải có chữ "Không đạt"
trên màn.

**Đã chứng minh cổng ĐỎ được:** trước sửa, tổng 4 thẻ = 7 ≠ 8 → ĐỎ
(`Actual: <7>`); sau sửa → XANH. (Lỗi phụ của riêng tôi: test đầu dùng `Set`
nên 3 số `1` gộp thành 1 → tổng 5; sửa sang đọc đúng `StatCard.value` mới đúng.)

**Quét thêm:** review list (`us03`) lọc rỗng mặc định nên HIỆN ĐỦ 8, không bỏ
sót. Filter use case nhận `statuses` tường minh từ caller nên không tự bỏ sót.

## 3g. Lịch sử phiên bản hiện SAI tài liệu (14/10, đợt 6)

Tiếp đợt 5: soi "giao diện trình bày sai dữ liệu".

Nút "So sánh hai phiên bản" ở màn chi tiết (`us04`) từng push `/reviews/compare`
**không kèm `reviewId`**, và `us08` luôn đọc
`ReviewRepository.instance.docVersions()` — một danh sách tĩnh 2 phần tử
(sequence-diagram v1/v2) **chung cho mọi tài liệu** (`DemoData.docVersions`).
Hậu quả: mở "Use Case Diagram" lại thấy lịch sử của *sequence diagram*. Tương tự
mục "Lịch sử phiên bản" trên `us04` cũng đọc `versions()` (danh sách chung).

Lỗi im lặng: không báo lỗi, chỉ hiện nội dung của tài liệu **khác**. Đặc biệt
nguy hiểm vì giảng viên có thể so sánh/chấm hai bản của tài liệu mình không hề
mở.

**Sửa:** `docVersions(reviewId)` và `versions(reviewId)` giờ **sinh lịch sử từ
chính tài liệu đang mở** — tên file từ `documentTitle`, phiên bản từ `version`.
US04 truyền `reviewId` vào cả `versions(reviewId)` lẫn `pushNamed(... arguments:
reviewId)`; US08 nhận `reviewId` từ arguments (thiếu thì dùng tài liệu đầu,
không bao giờ rơi về danh sách chung). Dữ liệu mẫu không có kho version đầy đủ
nên sinh bản tiền nhiệm giả định cùng `documentTitle` — **nói rõ** trong docblock,
không bịa diff máy tính.

**Cổng chống tái phát:** `test/version_scope_test.dart` TC_US08_BV_01 — mở "Use
Case Diagram", vào so sánh, assert KHÔNG có `sequence-diagram` mà CÓ
`use-case-diagram`. Đã chứng minh ĐỎ trước sửa (hiện `sequence-diagram-v1.pdf`),
XANH sau.

**Lỗi phụ của riêng tôi (test tự đúng / sai):** (a) finder `find.text('So sánh
phiên bản')` sai tên nút thật ("So sánh hai phiên bản"); (b) `find.text(fileName)`
khớp NHIỀU vì tên file còn ở "Lịch sử phiên bản" -> `scrollUntilVisible` ném
"Too many elements"; đổi sang `find.byIcon(picture_as_pdf_outlined)`. Lại một lần
test đỏ giả do finder lỏng — phải dùng định vị duy nhất.

## 3h. Dòng "AI đã review" găm cứng số bịa (14/10, đợt 7)

Tiếp đợt 6: soi "giao diện trình bày sai dữ liệu".

Trong `us04` (`_tracks`), dòng "AI đã review" từng găm cứng chuỗi
`'3 lỗi · 6 cảnh báo · 5 gợi ý'` cho **MỌI tài liệu** — mà chuỗi này KHÔNG
khớp tài liệu nào trong dữ liệu mẫu (gần nhất là review-001: 2/3/4).
Cùng lúc CHÍNH màn đó, `_aiSummary` lại đọc `r.aiErrors/Warnings/Suggestions`
đúng → **màn tự mâu thuẫn** (một chỗ đúng, một chỗ bịa). Lỗi im lặng cùng họ
với §3g.

**Sửa:** `_tracks` tính chuỗi từ `r.aiErrors/Warnings/Suggestions` (đồng nhất
với `_aiSummary`). Giờ mở tài liệu nào hiện đúng số của tài liệu đó.

**Cổng chống tái phát:** `test/ai_metric_consistency_test.dart`
TC_US04_BV_03 — mở "Activity Diagram" (0/1/2), assert KHÔNG có chuỗi găm cứng
"3 lỗi · 6 cảnh báo · 5 gợi ý", và CÓ chuỗi "0 lỗi · 1 cảnh báo · 2 gợi ý".
Đã chứng minh ĐỎ trước sửa (chuỗi găm cứng hiện), XANH sau.

**Quét thêm (đợt 7):** US12 sức khoẻ nhóm đã TÍNH ĐÚNG — `progress =
doneCount/totalCount`, `pct` suy từ đó, 3 nhóm (4/4, 1/4, 2/4) đều khớp, không
có số găm cứng. US05 đọc `r.aiErrors/Warnings/Suggestions` trực tiếp (đúng).
US06/US07 không hiện số AI chi tiết nên không có sai số ở chỗ đó.

## 3i. Nút "Nộp tài liệu" ghi nhầm id và payload (14/10, đợt 8)

Màn nộp tài liệu (`us09`) gọi `repo.write(id: widget.projectId, ..., payload: _fileName)`:
- route `/submit` mặc định `projectId = 'smart-campus-management'` — mã **KHÔNG TỒN TẠI**
  trong dữ liệu (id thật là `review-001`…`review-010`);
- `payload` là **TÊN TỆP** (`sequence-diagram-v2.pdf`) — không ánh xạ được sang
  `DocStatus` nào.

`_apply()` (đã viết cẩn thận từ đợt 3) lặng lẽ bỏ qua **cả hai** trường hợp, nên màn
hiện "Vừa xong" còn dữ liệu **không đổi một milimet**. Đây là lỗi **lặp lại đợt 3**
("toast báo thành công mà dữ liệu không đổi"), lần này qua id/payload sai thay vì
thiếu `write()`.

**Sửa:** `/submit` mặc định `'review-009'` (tài liệu đang "Cần chỉnh sửa" — đúng
ngữ cảnh nộp lại); payload đổi sang `DocStatus.submitted.name` (tên tệp vẫn hiện
trong nhãn "Nộp <tệp>").

**Cổng chống tái phát:** `test/submit_persist_test.dart` 2 ca —
HP: bấm Nộp → **phải có** tài liệu chuyển sang "Đã nộp" (ĐỎ trước sửa: không đổi
tài liệu nào); AP: mất mạng → xếp hàng, `pendingCount==1`, trạng thái chưa đổi;
có mạng → `_flushQueue` ghi thật. Xanh cả hai.

**Hai lỗi của riêng tôi khi viết test** (ghi ra để không lặp): (a) `find.text('Nộp
tài liệu')` khớp NHIỀU (tiêu đề AppBar + nút) → dùng `.last`; (b) giữ biến `target`
từ `byId` trước khi ghi → đọc **object cũ**, vì `_apply` THAY THẾ phần tử
(`list[at] = ...copyWith`) nên phải HỎI LẠI qua `byId` sau mỗi lần ghi.

**Bằng chứng trình duyệt:** đã cố chứng minh trực tiếp trên build thật nhưng
**không xong** — sau khi bấm SSO, semantics tree của Flutter-web đổi và Playwright
đọc/click không ổn định (đúng bản chất §3c). Trình duyệt chỉ dùng được làm cổng hồi
quy (journeys 8/8, tap-target 9/9, 0 lỗi console); **dụng cụ có thẩm quyền cho
trạng thái sau nộp là widget test** — đã chứng minh ĐỎ→XANH.

## 3j. `write()` trả true khi KHÔNG áp được gì — gốc chung của 3 lần lỗi (14/10, đợt 9)

Đợt 9 quét TOÀN BỘ chỗ gọi `repo.write(...)` và tìm ra **hai** chỗ gõ tay
id/payload, cộng một lỗi thiết kế API khiến cả lớp lỗi tồn tại được:

### 1. Lỗi gốc: `write()` báo thành công giả
```dart
// TRƯỚC
_apply(w);
return true;   // ← trả true kể cả khi _apply KHÔNG áp được gì
```
`_apply()` ghi rõ trong docblock là **bỏ qua** khi id không có hoặc payload không
phải tên `DocStatus`, nhưng `write()` vẫn trả `true`. Nên màn hiện "Trạng thái đã
cập nhật" / "Đã nộp" còn dữ liệu đứng im. **Đây là nguyên nhân chung** của §3d,
§3i, và hai chỗ dưới: giaо diện không hề nói dối — nó tin cái `true` do kho
trả về.

### 2. US07: payload là LỜI NHẮN
`repo.write(id: reviewId, label: 'Yêu cầu chỉnh sửa', payload: _note.text.trim())`
— payload là chữ người dùng gõ, không map được `DocStatus` nào. `_undo()` gửi
`payload: 'undo'` — cũng vậy. Cả hai lặng lẽ "thành công".
→ Payload đổi thành `DocStatus.needsRevision.name` / `DocStatus.waiting.name`;
lời nhắn đi theo `label` để còn thấy.

### 3. US10: id là `'submit'`, payload là tên tệp
`repo.write(id: 'submit', ..., payload: 'sequence-diagram-v2.pdf')` — id KHÔNG
tồn tại, payload là TÊN TỆP. Màn nói "Đã nộp. Giảng viên sẽ nhận được thông báo."
→ Gõ id tài liệu thật + `DocStatus.submitted.name`; khi `write()` trả false mà
không phải offline thì nói "Chưa nộp được…", không báo thành công.

**Sửa gốc:** `_apply` giờ trả `bool` (đổi được mới true), `write()` trả đúng giá
trị đó. Nhờ vậy **màn không thể báo thành công khi không có gì xảy ra**, dù sau
này có ai gõ nhầm id/payload lần nữa — lỗi sẽ hiện ra thành lời, không còn im lặng.

**Bằng chứng cổng ĐỎ được:** `test/submit_gate_test.dart` TC_US10_BV_01 gọi
`write(id:'submit', payload:'sequence-diagram-v2.pdf')` và `fail()` nếu trả
`true` — ĐỎ trước sửa, XANH sau. `test/revision_write_test.dart` TC_US07_HP_04:
ĐỎ trước sửa (`Expected: needsRevision, Actual: waiting`), XANH sau.

**Quan trọng — sửa gốc làm vỡ một test, và đó là test LỖI chứ không phải hồi quy:**
`domain_repository_test.dart` có test dùng id/payload bịa (`'a'`/`'p'`, `'review-001'`
với payload `'x'`) rồi mong đợi `isTrue`. Những test đó từng xanh nhờ chính con lỗi
đang sửa (API báo true vô điều kiện). Đã đổi sang id + tên trạng thái thật. Nên
111/111 xanh. **Không có test nào hồi quy do hành vi ứng dụng đổi sai.**

## 3k. Bộ lọc danh sách thiếu chip "Không đạt" (14/10, đợt 10)

Dãy chip lọc của US03 chỉ có `waiting, inReview, needsRevision, approved` — thiếu
`notAccepted`. Dữ liệu có 1 tài liệu "Không đạt" (`review-010`) nên nó HIỆN ở
"Tất cả" nhưng **không có cách nào lọc riêng ra**. Cùng kiểu §3f (Tổng quan đếm
thiếu), nhưng ở đây nói về khả năng THĂM DÒ dữ liệu của người dùng: thấy thì thấy,
muốn xem riêng thì không có đường — giảng viên không thể rà lại các tài liệu đã bị
trả về.

**Sửa:** thêm `DocStatus.notAccepted` vào `_filters`, phủ đủ mọi trạng thái có
trong dữ liệu.

**Cổng chống tái phát:** `test/filter_coverage_test.dart` 2 ca — (a) màn phải có
chip "Không đạt"; (b) bấm chip thì danh sách còn đúng số tài liệu Không đạt.
Đã chứng minh ĐỎ trước sửa (`Found 0 widgets with text "Không đạt"`), XANH sau.

**Lỗi của riêng tôi khi viết test (lần thứ 4 cùng loại):** dãy chip nằm trong
`ListView` NGANG, chip thứ 6 nằm ngoài màn nên **chưa được dựng** (ListView builds
lazily) → `find.text` không thấy dù code đã đúng. Phải `tester.drag(lv,
Offset(-600, 0))` tới khi thấy. Bài học: với list theo hướng nào thì phải cuộn
đúng hướng ấy TRƯỚC, và "không tìm thấy" chưa chắc là "không có".

## 3l. Có việc chờ gửi nhưng không màn nào nói ra (14/10, đợt 11)

`pendingCount` — số quyết định đang xếp hàng chờ mạng — **chỉ nằm trong
repository, KHÔNG màn nào hiển thị**. Hệ quả: người dùng chỉnh sửa/nộp khi mất
mạng, thấy một lần "đã xếp hàng", rời màn, rồi **không còn cách nào biết còn mấy
việc chưa gửi**. Nếu tắt app tưởng đã đồng bộ thì mất quyết định.

Đây là lỗi cùng lớp §3f/§3k nhưng theo hướng TON TẠI-NHƯNG-THẤY-ĐƯỢC: bộ đếm
đúng, dữ liệu đúng, duy nhất đường hiển thị với người dùng không có. Khác §3d
(ghi sai) ở chỗ không có màn nào nói sai — là không nói gì cả.

**Sửa:** dashboard hiện `Còn N việc chờ gửi` khi `pendingCount > 0`, kèm hậu quả
("Mở mạng lại để gửi"). Hết hàng đợi thì tự biến mất.

**Cổng chống tái phát:** `test/pending_visibility_test.dart` 2 ca — (a) còn 2 việc
chờ thì Tổng quan phải nói số lượng; (b) hết hàng đợi thì không được báo nữa.
Chứng minh ĐỎ trước sửa, và chứng minh không hư test: hiện lại thẻ sau cổng `if
(false)` thì ca (a) lại ĐỎ cùng thông điệp.

**Đo thêm:** ở 320dp thẻ rộng 280dp (= 320 − 2×20 padding màn) → không tràn, đặt
side-by-side trong `Row` với icon 20 + gutter 12.

## 3m. 7 cảnh báo AI không thuộc tài liệu nào — hiện ở MỌI tài liệu (14/10)

`DemoData.aiFindings` chỉ có `level/category/message/pageRef` — **không có
`reviewId`**. Tức 7 cảnh báo không gắn với tài liệu nào. Nhưng `findings()` trả
"nguyên" danh sách ấy cho mọi `AiResultScreen`. Trong khi đó mỗi tài liệu TỰ KHAI
BÁO `aiErrors/aiWarnings/aiSuggestions` riêng.

Mở `review-001` (khai báo 2 lỗi · 3 cảnh báo · 4 gợi ý) thì cùng một màn hiện:
**2 / 3 / 4** ở tổng luận, nhưng chip lại đếm từ danh sách toàn cục **Lỗi (2),
Cảnh báo (3), Gợi ý (2), Tất cả (7)**. Số gợi ý (2) KHÔNG khớp số luận (4).

**Sửa (3 bước):**
1. `AiFinding` thêm trường bắt buộc `reviewId`.
2. `findings([String? reviewId])` — có tham số thì lọc theo tài liệu; `AiResultScreen`
   gọi KÈM `reviewId` cho cả chip và danh sách.
3. Sửa số khai báo của `review-001` cho khớp thực tế: 4 → 2 gợi ý.

Từ nay mọi tài liệu có số lượng cảnh báo gắn đúng ngữ cảnh của nó. Cổng chống
tái phát: `test/ai_finding_scope_test.dart` so đúng số khai báo với số lọc được —
trước sửa: 4 gợi ý khai báo vs 2 lọc được, ĐỎ thật.

## 3n. Nhánh `main` cục bộ chạy song song `develop` suốt phiên (14/10, phát hiặt đợt 12)

**Phát hiện (không phải lỗi sản phẩm, nhưng phải nói rõ):** từ đầu phiên HEAD nằm
trên nhánh `main` (đổi tên từ `lab2-single`), nên **mỗi** `git commit` đều làm
`main` tiến một bước; `git branch -f develop HEAD` chỉ kéo `develop` đi theo. Hệ
quả: `main` cục bộ dôi ra 44 commit so với `team/main`.

**Điều quan trọng — KHÔNG có mất mát:**
- `team/main` từ đầu đến cuối vẫn ở `8258f69`, không nhận bất kỳ commit làm việc nào.
- Hai nhánh **phân kỳ hoàn toàn** (không có tổ tiên chung) nên không có chuyện
  ghi đè lẫn nhau. Cây của thầy (`app/`, tài liệu gốc) vẫn nguyên trên remote.
- Tôi chỉ từng push `develop`; không một lần push `main`.

**Sửa (nhánh cục bộ):** `git checkout develop` rồi `git branch -f main team/main`.
Cả hai nhánh cục giờ khớp remote của chúng. `main` chỉ còn là con trỏ, không
dùng để làm việc.

**Bài học:** nếu user nói "kệ main đi", việc đầu tiên của phiên phải là rời khỏi
nhánh `main` (`git checkout develop`) chứ không phải cứ commit trên `main` rồi
kéo `develop` theo sau. Nhánh làm việc và nhánh "kệ đi" phải tách ra từ đầu.

## 3o. Đổi cấu trúc `flutter_app/lib/` từ "chuỗi số" sang chia theo tính năng (14/10, đợt 13)

**Vấn đề (do Tường chỉ ra):** cây code chỉ gồm các folder và file mang mã số —
`011_presentation/review/us04/011_REVIEW_US04_workspace_screen.dart`. Không ai mở
repo có thể biết `us04` là màn nào; bề mặt công khai của repo gần như không đọc
được. Đây là hậu quả của chính tôi: khi đặt tên theo chuẩn CMPlan, tôi ưu tiên khớp
mã hơn là khả năng người khác đọc code.

**Sau đổi** (2026-10-14):

```
flutter_app/lib/
  main.dart
  shared/theme/          # [001] color_tokens, typography, spacing, app_theme
  shared/widgets/        # [011] app_shell, app_card, status_chip, tone_colors,
                         #      dialog_actions, offline_banner (US11)
  features/login/        # [011 · AUTH · US01]  login_screen
  features/dashboard/    # [011 · DASH · US02]  dashboard_screen
  features/request_list/ # [011 · REVIEW · US03] request_list_screen, review_card
  features/review_workspace/    # [011 · REVIEW · US04]
  features/ai_result/    # [011 · REVIEW · US05]
  features/approval/      # [011 · REVIEW · US06]
  features/revision_request/    # [011 · REVIEW · US07]
  features/version_compare/     # [011 · REVIEW · US08]
  features/document_submit/     # [011 · SUBMIT · US09]
  features/submit_gate/ # [011 · SUBMIT · US10]
  features/group_health/ # [011 · DASH · US12]
  features/rule_sets/    # [011 · REVIEW · US13]
  features/profile/       # [011 · PROFILE · US14]
  domain/entities/       # [101] review_entities
  domain/usecases/       # [111] filter_requests_uc
  data/sources/          # [201] mock_datasource
  data/repositories/     # [202] review_repository
```

**Mã SKU không mất** — mỗi file .dart mang dòng `// CMPlan: tầng 011 · REVIEW · US04`
ở đầu file. Vậy truy vết 14 User Story vẫn nguyên, chỉ là mã nằm trong NỘI DUNG
file chứ không trong tên folder.

**Cổng đã sửa theo (không nới lỏng):**
- `check-cmplan.py`: tầng giờ đọc từ dòng khai báo, không đọc tên folder. Đã
  CHỨNG MINH ĐỎ — xoá dòng khai báo của dashboard_screen ra thì báo
  `THIEU KHAI BAO TANG`, exit 1. Luật cô lập tầng giữ nguyên 100%.
- `check-trace-map.py`: cột "Code thật" giờ ghi đường dẫn đầy đủ từ gốc repo
  (`flutter_app/lib/features/login/login_screen.dart`), gate ghép vói `ROOT`.

**Bằng chứng đổi tên không phá gì (vì đây không phải sửa giao diện):**
- `flutter analyze` — 0 lỗi
- `flutter test` — 115/115 (mất 2 test so với 117 vì tôi xoá 2 file test rác
  từng sinh ra trong phiên)
- `rules/check-all.py` — 8 cổng SẠCH (check-cmplan đỏ đúng khi thiếu khai báo)
- `lab2-gate.py` — 100/100 ĐẠT
- `verify/flutter-journeys.mjs` — 8/8 bước
- `verify/flutter-tap-targets.mjs` — 9/9 màn / 92 mục / 0 dưới 48dp / 0 lỗi console

**Bài học:** khi làm việc cho một bảng kiểm có mã tầng/mã SKU, đừng để việc khớp
mã lấn át việc đọc được code. Bảng kiểm là phương tiện; cái được kiểm (code dễ
đọc, dễ bảo trì) mới là đích. Mã nên sống trong khai báo/tài liệu, không bắt
đường dẫn phải mang số.
