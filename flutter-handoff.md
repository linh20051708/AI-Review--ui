# Handoff Flutter — từ Figma sang code

**Rubric G — Handoff cho lập trình viên Flutter (10 điểm)**

> **Ghi chú trung thực (cập nhật 14/10/2026):** đề bài Lab 2 **không bắt buộc viết code Flutter** —
> file này vẫn là bản handoff để một lập trình viên Flutter dựng lại giao diện.
> **Bổ sung sau:** người làm bài yêu cầu "phải có app Flutter chạy được", nên repo có thêm
> **`flutter_app/`** — app Flutter **viết mới**, port 6 màn chính từ `app/` (React) sang, dùng đúng
> token trong file này. Đây **không phải** code của giảng viên và **không phải** bản port của
> `srs-review-ai`. App không có backend; dữ liệu chép từ `app/src/data/mockData.ts`.
> Trạng thái đo được (14/10/2026): `flutter analyze` sạch · `flutter test` **36/36** xanh · `flutter build web` ra artifact.
> Ảnh chạy thật ở `ai-output/flutter-app/` — 6 ảnh, tên gắn mã TC.

```bash
cd flutter_app
flutter pub get                 # BAT BUOC voi ban clone moi
flutter analyze --no-pub
flutter test
flutter build web --release
```
>
> **Bản clone mới phải chạy `flutter pub get` TRƯỚC `flutter analyze`.** Nếu không, `--no-pub`
> không giải được package và analyzer báo hàng nghìn lỗi giả kiểu `Undefined class 'ThemeData'`.
> Đây là hiện tượng thiếu dependency, **không phải** lỗi code — đã đo: clone sạch trước `pub get`
> ra 1493 lỗi, sau `pub get` ra `No issues found!`. Token nguồn vẫn lấy từ code nền React thật
> (`app/src/index.css`), không phải tự đặt.

---

## 1. Bản đồ tổng quan

| Figma | Flutter | Ghi chú |
|---|---|---|
| Frame 412×892 | `Scaffold` trong `MediaQuery` | Dùng `SafeArea` |
| Color Variables | `ThemeData.colorScheme` | Xem §2 |
| Text styles | `TextTheme` | Xem §3 |
| Spacing variables | `EdgeInsets` hằng số | Xem §4 |
| Component | `StatelessWidget` | Xem §6 |
| Component variant | `enum` + `switch` | Xem §6 |
| Prototype link | `Navigator.pushNamed` | Xem §7 |

---

## 2. Token màu → Dart

```dart
// lib/theme/app_colors.dart
import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Thương hiệu
  static const brand      = Color(0xFF146B55);
  static const brandSoft  = Color(0xFFEAF4ED);
  static const brandTint  = Color(0xFFF2F7F3);

  // Chữ
  static const ink        = Color(0xFF24332D);
  static const muted      = Color(0xFF66736D);

  // Viền & nền
  static const line       = Color(0xFFE1E7E3);
  static const canvas     = Color(0xFFFAFBFA);
  static const subtle     = Color(0xFFF7F9F7);

  // Trạng thái
  static const olive      = Color(0xFF637344);
  static const oliveSoft  = Color(0xFFF1F4E9);
  static const amber      = Color(0xFF756534);
  static const amberSoft  = Color(0xFFF5F2E7);
  static const rust       = Color(0xFFA65335);
  static const rustSoft   = Color(0xFFFBF0EA);
  static const danger     = Color(0xFFA34343);
  static const dangerSoft = Color(0xFFFAEEEE);
}
```

`ThemeData`:

```dart
ThemeData(
  useMaterial3: true,
  scaffoldBackgroundColor: AppColors.canvas,
  colorScheme: ColorScheme.fromSeed(
    seedColor: AppColors.brand,
    brightness: Brightness.light,
    surface: Colors.white,
  ),
  fontFamily: 'Inter',
)
```

---

## 3. Thang chữ → Dart

```dart
// lib/theme/app_text.dart
class AppText {
  AppText._();

  static const pageTitle   = TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.ink);
  static const sectionTitle= TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.ink);
  static const blockTitle  = TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.ink);
  static const body        = TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.ink);
  static const bodySmall   = TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.ink);
  static const label       = TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.ink);
  static const micro       = TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.muted);
}
```

Cần khai báo font Inter trong `pubspec.yaml`:

```yaml
flutter:
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Medium.ttf   weight: 500
        - asset: assets/fonts/Inter-SemiBold.ttf weight: 600
        - asset: assets/fonts/Inter-Bold.ttf     weight: 700
```

---

## 4. Khoảng cách → Dart

```dart
// lib/theme/app_space.dart
class AppSpace {
  AppSpace._();

  static const xs   =  4.0;
  static const s    =  8.0;
  static const m    = 12.0;
  static const l    = 16.0;
  static const xl   = 24.0;
  static const xxl  = 32.0;
  static const huge = 48.0;

  static const pagePad = 20.0;   // padding ngang màn hình
  static const tapMin  = 48.0;   // vùng bấm tối thiểu (WCAG 2.5.8 / Material 3)
  static const headerH = 56.0;
  static const navH    = 64.0;
}

class AppRadius {
  AppRadius._();

  static const chip   =  6.0;
  static const button =  8.0;
  static const card   = 12.0;
  static const dialog = 16.0;
}
```

---

## 5. Đặc tả từng màn hình

Mỗi màn hình gồm **6 phần**: khung, app bar, cấu trúc, widget, trạng thái, điều hướng.

### S02 — Tổng quan

| Phần | Nội dung |
|---|---|
| **Khung** | 412×892 (và 360×800), `SafeArea`, nền `canvas` |
| **App bar** | Cao 56px, nền `white`, viền dưới `line`, tiêu đề `pageTitle` |
| **Cấu trúc** | `CustomScrollView` → nhãn nhỏ → tiêu đề → thẻ số liệu (lưới 2×2) → khối việc cần làm → danh sách review |
| **Widget** | `_StatGrid`, `_AttentionList`, `_ReviewCard` |
| **Trạng thái** | Thường · Đang tải (skeleton) · Mất mạng (banner) |
| **Điều hướng** | Thẻ số liệu → tab tương ứng; thẻ review → `/reviews/:id` |

```dart
class _StatGrid extends StatelessWidget {
  final List<({String label, String value, IconData icon})> items;
  const _StatGrid({required this.items});

  @override
  Widget build(BuildContext context) => GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: AppSpace.l,
        crossAxisSpacing: AppSpace.l,
        childAspectRatio: 1.6,
        children: items.map((s) => _StatCard(label: s.label, value: s.value, icon: s.icon)).toList(),
      );
}
```

### S03 — Yêu cầu review

| Phần | Nội dung |
|---|---|
| **Khung** | 412×892, padding ngang 20px |
| **App bar** | Tiêu đề "Yêu cầu review" + icon lọc bên phải |
| **Cấu trúc** | Ô tìm kiếm (52px) → hàng chip lọc → hàng sắp xếp → `ListView` thẻ |
| **Widget** | `SearchInput`, `FilterChips`, `_ReviewCard` |
| **Trạng thái** | Thường · Đang tải (`SkeletonList`) · Rỗng (`EmptyState`) · Lỗi (`ErrorState`) |
| **Điều hướng** | Thẻ → `/reviews/:id`; Back → `/dashboard` |

```dart
class _ReviewCard extends StatelessWidget {
  final String klass, doc, version, statusLabel;
  final Color statusFg, statusBg;
  const _ReviewCard({required this.klass, required this.doc, required this.version,
                     required this.statusLabel, required this.statusFg, required this.statusBg});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: AppSpace.m),
        padding: const EdgeInsets.all(AppSpace.l),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.card),
          border: Border.all(color: AppColors.line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(klass, style: AppText.micro),
            const SizedBox(height: AppSpace.s),
            Text(doc, style: AppText.blockTitle),
            const SizedBox(height: AppSpace.m),
            Row(children: [
              Text(version, style: AppText.micro),
              const Spacer(),
              _StatusChip(label: statusLabel, fg: statusFg, bg: statusBg),
            ]),
          ],
        ),
      );
}
```

### S04 — Không gian review

| Phần | Nội dung |
|---|---|
| **Khung** | 412×892, padding ngang 20px |
| **App bar** | Nút Back + tiêu đề tài liệu (rút gọn) |
| **Cấu trúc** | Thẻ tài liệu → khối 3 track → tệp đính kèm → phát hiện AI → thanh 2 nút |
| **Widget** | `_DocCard`, `StatusTracks`, `_AttachmentTile`, `AIFindingCard`, `_DecisionBar` |
| **Trạng thái** | Thường · Không khả dụng · Hộp thoại xác nhận |
| **Điều hướng** | "Xem phát hiện AI" → `/reviews/:id/ai-result`; Back → `/reviews` |

Thanh quyết định dính đáy:

```dart
class _DecisionBar extends StatelessWidget {
  const _DecisionBar();

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(AppSpace.l),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.line)),
        ),
        child: Row(children: [
          Expanded(child: OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(AppSpace.tapMin)),
            child: const Text('Cần chỉnh sửa'),
          )),
          const SizedBox(width: AppSpace.m),
          Expanded(child: FilledButton(
            onPressed: () {},
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(AppSpace.tapMin),
              backgroundColor: AppColors.brand,
            ),
            child: const Text('Phê duyệt'),
          )),
        ]),
      );
}
```

### S05 — Kết quả AI Review

| Phần | Nội dung |
|---|---|
| **Khung** | 412×892 |
| **App bar** | Back + "Kết quả AI Review" |
| **Cấu trúc** | Hàng 3 ô đếm → `ListView` phát hiện |
| **Widget** | `_CountRow`, `AIFindingCard` |
| **Trạng thái** | Đang phân tích (tiến độ) · Có kết quả |
| **Điều hướng** | "Quay lại không gian review" → `/reviews/:id` |

### S06 — Lớp học

| Phần | Nội dung |
|---|---|
| **Khung** | 412×892 |
| **App bar** | "Lớp học" |
| **Cấu trúc** | `ListView` thẻ lớp, mỗi thẻ có thanh màu trái theo sức khoẻ |
| **Widget** | `_ClassCard` (dùng `Container` + `borderRadius` trái) |
| **Trạng thái** | Thường · Đang tải · Rỗng |
| **Điều hướng** | Thẻ → `/classes/:id` |

### S07 — Project

| Phần | Nội dung |
|---|---|
| **Khung** | 412×892 |
| **App bar** | "Project" |
| **Cấu trúc** | Thẻ: tên + ngữ cảnh + nhãn sức khoẻ + thanh tiến độ + % + deadline |
| **Widget** | `_ProjectCard` với `LinearProgressIndicator` dùng `brand` |
| **Trạng thái** | Thường · Cần chú ý (có lỗi AI) · Quá hạn |
| **Điều hướng** | Thẻ → `/projects/:id` |

### S08 — Tài liệu của project

| Phần | Nội dung |
|---|---|
| **App bar** | Back + tên project |
| **Cấu trúc** | Thẻ tiến độ → `ListView` tài liệu kèm nhãn trạng thái |
| **Trạng thái** | Thường · Rỗng (chưa có tài liệu) |
| **Điều hướng** | Tài liệu → `/reviews/:id` |

---

## 6. Component → widget

| # | Component Figma | Widget Flutter | Biến thể |
|---|---|---|---|
| 1 | Button | `FilledButton` / `OutlinedButton` / `TextButton` | `ButtonVariant { primary, secondary, disabled }` |
| 2 | Text field | `TextFormField` | `FieldState { normal, focus, error, disabled }` |
| 3 | Card | `Container` + `BoxDecoration` | `CardKind { review, klass, project }` |
| 4 | Navigation | `NavigationBar` | 5 destination cố định |
| 5 | App bar | `AppBar` | `AppBarKind { simple, withAction }` |
| 6 | Dialog | `showDialog` + `AlertDialog` | `DialogKind { confirm, warning }` |
| 7 | Loading | `SkeletonList` / `LinearProgressIndicator` | `LoadingKind { skeleton, progress }` |
| 8 | Empty | `EmptyState` | Luôn có 1 hành động |
| 9 | Error | `ErrorState` | Luôn có 2 đường phục hồi |

Ví dụ Button có biến thể:

```dart
enum ButtonVariant { primary, secondary, disabled }

class AppButton extends StatelessWidget {
  final String label;
  final ButtonVariant variant;
  final VoidCallback? onTap;
  const AppButton({super.key, required this.label, this.variant = ButtonVariant.primary, this.onTap});

  @override
  Widget build(BuildContext context) {
    const style = ButtonStyle(
      minimumSize: WidgetStatePropertyAll(Size.fromHeight(AppSpace.tapMin)),
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(AppRadius.button))),
      ),
    );

    return switch (variant) {
      ButtonVariant.primary => FilledButton(
          onPressed: onTap, style: style.merge(const ButtonStyle(
            backgroundColor: WidgetStatePropertyAll(AppColors.brand),
          )), child: Text(label)),
      ButtonVariant.secondary => OutlinedButton(
          onPressed: onTap, style: style, child: Text(label)),
      ButtonVariant.disabled => FilledButton(
          onPressed: null, style: style, child: Text(label)),
    };
  }
}
```

---

## 7. Điều hướng → route

```dart
// lib/router.dart
final routes = <String, WidgetBuilder>{
  '/login':             (_) => const LoginPage(),
  '/dashboard':         (_) => const DashboardPage(),
  '/reviews':           (_) => const ReviewRequestsPage(),
  '/reviews/detail':    (_) => const ReviewWorkspacePage(),
  '/reviews/ai-result': (_) => const AIResultPage(),
  '/classes':           (_) => const ClassesPage(),
  '/projects':          (_) => const ProjectsPage(),
  '/projects/documents':(_) => const ProjectDocumentsPage(),
  '/semesters':         (_) => const SemestersPage(),
  '/rule-sets':         (_) => const RuleSetsPage(),
  '/students':          (_) => const StudentsPage(),
  '/groups':            (_) => const GroupsPage(),
  '/notifications':     (_) => const NotificationsPage(),
  '/profile':           (_) => const ProfilePage(),
};
```

Vì màn hình chi tiết cần tham số, dùng `onGenerateRoute` thay vì map tĩnh:

```dart
Route<dynamic>? onGenerateRoute(RouteSettings s) {
  final uri = Uri.parse(s.name ?? '/');
  final seg = uri.pathSegments;

  if (seg.length == 2 && seg[0] == 'reviews') {
    return MaterialPageRoute(builder: (_) => ReviewWorkspacePage(reviewId: seg[1]));
  }
  if (seg.length == 2 && seg[0] == 'classes') {
    return MaterialPageRoute(builder: (_) => ClassDetailPage(classId: seg[1]));
  }
  return MaterialPageRoute(builder: (_) => const DashboardPage());
}
```

Bottom nav dùng `NavigationBar` với `selectedIndex` theo vị trí route.

---

## 8. Bảng đối chiếu token → Dart

| Token Figma | Hằng Dart | Giá trị |
|---|---|---|
| `color/brand` | `AppColors.brand` | `0xFF146B55` |
| `color/brand-soft` | `AppColors.brandSoft` | `0xFFEAF4ED` |
| `color/ink` | `AppColors.ink` | `0xFF24332D` |
| `color/muted` | `AppColors.muted` | `0xFF66736D` |
| `color/line` | `AppColors.line` | `0xFFE1E7E3` |
| `color/canvas` | `AppColors.canvas` | `0xFFFAFBFA` |
| `radius/card` | `AppRadius.card` | `12.0` |
| `spacing/l` | `AppSpace.l` | `16.0` |
| `font/family` | `fontFamily: 'Inter'` | — |

## 9. Bảng đối chiếu component → widget

| Component Figma | Widget | File gợi ý |
|---|---|---|
| Button | `AppButton` | `lib/widgets/app_button.dart` |
| Text field | `AppTextField` | `lib/widgets/app_text_field.dart` |
| Card | `AppCard` | `lib/widgets/app_card.dart` |
| Navigation | `AppBottomNav` | `lib/widgets/app_bottom_nav.dart` |
| App bar | `AppTopBar` | `lib/widgets/app_top_bar.dart` |
| Dialog | `AppConfirmDialog` | `lib/widgets/app_confirm_dialog.dart` |
| Loading | `SkeletonList` | `lib/widgets/skeleton_list.dart` |
| Empty | `EmptyState` | `lib/widgets/empty_state.dart` |
| Error | `ErrorState` | `lib/widgets/error_state.dart` |

---

## 10. Lưu ý khi chuyển

1. **Không hardcode màu.** Dùng `AppColors`, không dùng `Color(0xFF...)` trong widget.
2. **Vùng bấm tối thiểu 48dp.** Dùng `AppSpace.tapMin` cho mọi nút.
3. **Bottom nav 64px** — `NavigationBar` mặc định 80px, cần `height: AppSpace.navH`.
4. **Nhãn trạng thái luôn có chữ**, không chỉ màu.
5. **Mọi danh sách có 4 trạng thái** — dùng `switch` trên `LoadState`.
6. **Font Inter phải nhúng asset**, không dựa vào font hệ thống.
7. **Test ở 360×800 và 412×892** — nội dung ở 360 hẹp hơn nên bớt mục, không chỉ thu nhỏ.
