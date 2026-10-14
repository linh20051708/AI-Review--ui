import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/features/approval/approval_screen.dart';
import 'package:mobi_review/data/repositories/review_repository.dart';

/// Kiểm hộp thoại xác nhận của US06 **bằng chính khung test của Flutter**.
///
/// VÌ SAO CÓ FILE NÀY:
/// Khi lái app qua trình duyệt (Chromium + cây semantics), bấm nút xác nhận
/// trong `AlertDialog` **không thấy** trạng thái đổi. Không thể kết luận ngay
/// là lỗi app, vì "bấm" trong chế độ semantics là sự kiện tổng hợp, khác cú
/// bấm chuột thật. Test này gọi thẳng `pumpWidget` + `tester.tap`, tức là
/// đường đi chuẩn của Flutter, nên trả lời dứt khoát: logic app đúng hay sai.
///
/// Đây cũng là regression test cho `1-UC-07` / US06: huỷ thì không đổi gì,
/// xác nhận thì đổi trạng thái và hiện thông báo.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);

  Future<void> boot(WidgetTester tester, String reviewId) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    // Cần `Scaffold` để có `Material` tổ tiên — `InkWell` trong thanh quyết
    // định đòi `Material`, nếu thiếu thì test báo lỗi khung, không phải lỗi app.
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: ApprovalDecisionScreen(reviewId: reviewId)),
      ),
    );
    await tester.pumpAndSettle();
  }

  /// Lấy một mã tài liệu còn ở trạng thái CHƯA phải cuối, để bấm được.
  String pendingId() {
    final all = ReviewRepository.instance.requests();
    return all
        .firstWhere(
          (r) => r.status.name != 'approved' && r.status.name != 'notAccepted',
          orElse: () => all.first,
        )
        .id;
  }

  testWidgets('TC_US06_HP_01 — bấm Phê duyệt mở hộp thoại xác nhận', (
    tester,
  ) async {
    final id = pendingId();
    await boot(tester, id);

    expect(find.text('Phê duyệt'), findsWidgets);

    await tester.tap(find.text('Phê duyệt').first);
    await tester.pumpAndSettle();

    // Hộp thoại phải mở (bước 2 của luồng chính, bắt buộc theo 1-UC-07).
    expect(find.text('Phê duyệt tài liệu này?'), findsOneWidget);
    expect(find.text('Huỷ'), findsOneWidget);
  });

  testWidgets('TC_US06_AP_01 — huỷ trong hộp thoại thì KHÔNG đổi trạng thái', (
    tester,
  ) async {
    final id = pendingId();
    await boot(tester, id);

    await tester.tap(find.text('Phê duyệt').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Huỷ'));
    await tester.pumpAndSettle();

    // Nhánh A1: huỷ thì không có thông báo, trạng thái giữ nguyên.
    expect(find.textContaining('Trạng thái đã cập nhật'), findsNothing);
    expect(find.textContaining('xếp hàng'), findsNothing);
    expect(find.text('Phê duyệt'), findsWidgets);
  });

  testWidgets(
    'TC_US06_HP_02 — xác nhận thì đổi trạng thái + hiện thông báo',
    (tester) async {
      final id = pendingId();
      await boot(tester, id);

      await tester.tap(find.text('Phê duyệt').first);
      await tester.pumpAndSettle();

      // Bấm nút XÁC NHẬN trong hộp thoại (không phải nút trên màn).
      final dialogConfirm = find.descendant(
        of: find.byType(AlertDialog),
        matching: find.text('Phê duyệt'),
      );
      expect(dialogConfirm, findsOneWidget);
      await tester.tap(dialogConfirm);
      await tester.pumpAndSettle();

      // Đây chính là chỗ trình duyệt không quan sát được — khẳng định ở đây.
      expect(find.textContaining('Trạng thái đã cập nhật'), findsOneWidget);
      // Thanh quyết định bị khoá: không đổi trạng thái thêm được nữa.
      expect(find.textContaining('trạng thái cuối'), findsOneWidget);
      expect(find.text('Phê duyệt'), findsNothing);
    },
  );
}
