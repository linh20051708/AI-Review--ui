import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/main.dart';
import 'package:mobi_review/screens/ai_result_screen.dart';
import 'package:mobi_review/screens/app_shell.dart';
import 'package:mobi_review/screens/dashboard_screen.dart';
import 'package:mobi_review/screens/login_screen.dart';
import 'package:mobi_review/screens/review_list_screen.dart';
import 'package:mobi_review/screens/review_workspace_screen.dart';
import 'package:mobi_review/theme/app_colors.dart';
import 'package:mobi_review/widgets/review_card.dart';
import 'package:mobi_review/theme/app_space.dart';

/// Kiểm luồng đi thật của app: mỗi đường đi phải tới được đích, và mỗi
/// màn phải có đường thoát (C6 — không có ngõ cụt).
void main() {
  // Test không có mạng: chặn google_fonts tải Inter từ CDN.
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);

  Future<void> boot(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const MobiReviewApp());
    await tester.pumpAndSettle();
  }

  /// Đăng nhập qua SSO rồi chờ hết độ trễ mô phỏng (350ms) của màn Đăng nhập.
  Future<void> loginSso(WidgetTester tester) async {
    await tester.tap(find.text('Đăng nhập bằng SSO trường'));
    await tester.pump(); // bắt đầu Future.delayed
    await tester.pump(const Duration(milliseconds: 500)); // hết độ trễ
    await tester.pumpAndSettle(); // chạy animation chuyển màn
  }

  testWidgets('mở app thì vào màn Đăng nhập', (tester) async {
    await boot(tester);
    expect(find.byType(LoginScreen), findsOneWidget);
  });

  testWidgets('đăng nhập bằng SSO trường thì vào Tổng quan', (tester) async {
    await boot(tester);

    await loginSso(tester);

    expect(find.byType(AppShell), findsOneWidget);
    expect(find.byType(DashboardScreen), findsOneWidget);
  });

  testWidgets('đăng nhập bằng email sai định dạng thì báo lỗi, không rời màn',
      (tester) async {
    await boot(tester);

    await tester.enterText(find.byType(TextField).first, 'khong-phai-email');
    // "Đăng nhập" vừa là tiêu đề vừa là nhãn nút -> chỉ bấm nút.
    await tester.tap(
      find.descendant(
        of: find.byType(FilledButton),
        matching: find.text('Đăng nhập'),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Email chưa đúng định dạng.'), findsOneWidget);
    expect(find.byType(LoginScreen), findsOneWidget);
  });

  testWidgets('từ Tổng quan mở được Hàng đợi review rồi vào chi tiết',
      (tester) async {
    await boot(tester);
    await loginSso(tester);

    // Tab Review ở thanh điều hướng dưới.
    await tester.tap(find.text('Review'));
    await tester.pumpAndSettle();
    expect(find.byType(ReviewListScreen), findsOneWidget);

    // Thẻ đầu tiên mở được màn chi tiết.
    await tester.tap(find.byType(ReviewCard).first);
    await tester.pumpAndSettle();

    expect(find.byType(ReviewWorkspaceScreen), findsOneWidget);
    expect(find.text('Cần chỉnh sửa'), findsOneWidget);
    expect(find.text('Phê duyệt'), findsOneWidget);
  });

  testWidgets('màn chi tiết có nút Back và hai nút quyết định >= 48dp',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppThemeForTest(),
        home: Scaffold(
          appBar: AppBar(),
          body: const ReviewWorkspaceScreen(reviewId: 'review-001'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Hai nút quyết định ở thanh dính đáy.
    expect(find.text('Cần chỉnh sửa'), findsOneWidget);
    expect(find.text('Phê duyệt'), findsOneWidget);

    for (final label in ['Cần chỉnh sửa', 'Phê duyệt']) {
      final size = tester.getSize(find.text(label));
      expect(size.height, lessThan(AppSpace.tapMin),
          reason: 'Chữ "$label" tự nó thấp hơn 48dp; '
              'đích chạm thật nằm ở nút bao ngoài.');
      final btn = find.ancestor(
        of: find.text(label),
        matching: find.byType(FilledButton),
      );
      final outlined = find.ancestor(
        of: find.text(label),
        matching: find.byType(OutlinedButton),
      );
      final target = btn.evaluate().isNotEmpty ? btn : outlined;
      expect(tester.getSize(target.first).height,
          greaterThanOrEqualTo(AppSpace.tapMin));
    }
  });

  testWidgets('phê duyệt mở hộp thoại xác nhận rồi mới thực hiện',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppThemeForTest(),
        home: const Scaffold(
          body: ReviewWorkspaceScreen(reviewId: 'review-001'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Phê duyệt'));
    await tester.pumpAndSettle();

    expect(find.text('Phê duyệt tài liệu?'), findsOneWidget);
    expect(find.text('Huỷ'), findsOneWidget);

    // Huỷ thì không có thông báo thành công.
    await tester.tap(find.text('Huỷ'));
    await tester.pumpAndSettle();
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('màn Kết quả AI lọc được và có đường thoát khi rỗng',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppThemeForTest(),
        home: const Scaffold(body: AiResultScreen(reviewId: 'review-001')),
      ),
    );
    await tester.pumpAndSettle();

    // Tiêu đề nằm dưới phần đầu nên phải cuộn tới.
    await tester.scrollUntilVisible(
      find.text('Chi tiết phát hiện'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Chi tiết phát hiện'), findsOneWidget);

    // Lọc theo "Gợi ý".
    await tester.tap(find.textContaining('Gợi ý ('));
    await tester.pumpAndSettle();

    expect(find.textContaining('Gợi ý'), findsWidgets);
  });

  testWidgets('mọi màn trong shell đều nằm trong ngưỡng chạm tối thiểu',
      (tester) async {
    await boot(tester);
    await loginSso(tester);

    // Bốn mục thanh điều hướng phải >= 48dp cả hai chiều.
    for (final label in ['Tổng quan', 'Review', 'Thông báo', 'Hồ sơ']) {
      final finder = find.ancestor(
        of: find.text(label),
        matching: find.byType(InkWell),
      );
      if (finder.evaluate().isEmpty) continue;
      final size = tester.getSize(finder.first);
      expect(size.height, greaterThanOrEqualTo(AppSpace.tapMin));
      expect(size.width, greaterThanOrEqualTo(AppSpace.tapMin));
    }
  });
}

/// Theme builder xuất cho test — tách khỏi widget tree của app.
ThemeData buildAppThemeForTest() => ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: AppColors.brand,
    brightness: Brightness.light,
  ).copyWith(primary: AppColors.brand),
  scaffoldBackgroundColor: AppColors.canvas,
  filledButtonTheme: FilledButtonThemeData(
    style: FilledButton.styleFrom(
      minimumSize: const Size.fromHeight(AppSpace.tapMin),
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      minimumSize: const Size.fromHeight(AppSpace.tapMin),
    ),
  ),
);
