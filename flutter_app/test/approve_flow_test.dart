import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/main.dart';
import 'package:mobi_review/domain/entities/review_entities.dart';
import 'package:mobi_review/data/repositories/review_repository.dart';

/// Đi TRỌN đường người dùng: danh sách → chi tiết → phê duyệt → quay lại danh sách.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 3): `ReviewRepository.write()` từng chỉ
/// `debugPrint` rồi trả `true`, nên thông báo "Trạng thái đã cập nhật." là **nói
/// dối** — trạng thái không hề đổi. `test/repository_write_test.dart` khoá tầng
/// repository; file này khoá **tầng giao diện**: bấm nút trên màn thật rồi quay
/// lại danh sách phải thấy trạng thái mới.
///
/// Không kiểm bằng trình duyệt được: cây semantics của Flutter-web dựng lại sau
/// khi hộp thoại đóng, nên Playwright đọc không ra (xem `facts/MEASUREMENTS.md`
/// mục 3c). Widget test là dụng cụ đúng cho việc này.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);

  setUp(() => ReviewRepository.instance.resetForTest());

  Future<void> boot(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const MobiReviewApp());
    await tester.pumpAndSettle();

    // App mở ở màn Đăng nhập: phải qua SSO trước, rồi chờ độ trễ mô phỏng 350ms.
    await tester.tap(find.text('Đăng nhập bằng SSO trường'));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pumpAndSettle();

    // Vào tab Review trong shell.
    await tester.tap(find.text('Review'));
    await tester.pumpAndSettle();
  }

  testWidgets(
    'TC_US06_HP_04 — phê duyệt ở màn chi tiết thì danh sách đổi theo',
    (tester) async {
      await boot(tester);

      // Trước: tài liệu đầu tiên đang chờ review.
      final target = ReviewRepository.instance
          .requests()
          .firstWhere((r) => r.status == DocStatus.waiting);
      expect(find.text(target.documentTitle), findsWidgets);

      // Mở chi tiết → Phê duyệt → xác nhận trong hộp thoại.
      await tester.tap(find.text(target.documentTitle).first);
      await tester.pumpAndSettle();

      // Nút trên màn chi tiết mở hộp thoại.
      await tester.tap(find.text('Phê duyệt').first);
      await tester.pumpAndSettle();

      // Hộp thoại dùng chung nhãn "Phê duyệt" với nút màn, nên phải chỉ đích
      // danh nút TRONG `AlertDialog` — nếu không sẽ bấm nhầm nút màn lần nữa.
      final confirm = find.descendant(
        of: find.byType(AlertDialog),
        matching: find.text('Phê duyệt'),
      );
      expect(confirm, findsOneWidget, reason: 'hộp thoại phải có đúng 1 nút xác nhận');
      await tester.tap(confirm);
      await tester.pumpAndSettle();

      // Tầng dữ liệu phải đổi thật.
      expect(
        ReviewRepository.instance.byId(target.id)!.status,
        DocStatus.approved,
        reason: 'bấm Phê duyệt mà dữ liệu không đổi = app báo sai',
      );

      // Quay lại danh sách: chip trạng thái của tài liệu đó phải là "Đã phê duyệt".
      await tester.pageBack();
      await tester.pumpAndSettle();

      final approvedLabel = DocStatus.approved.label;
      expect(
        find.text(approvedLabel),
        findsWidgets,
        reason: 'danh sách phải phản ánh trạng thái vừa duyệt, không giữ nhãn cũ',
      );
    },
  );

  testWidgets('TC_US06_AP_04 — huỷ ở hộp thoại thì dữ liệu không đổi', (
    tester,
  ) async {
    await boot(tester);

    final target = ReviewRepository.instance
        .requests()
        .firstWhere((r) => r.status == DocStatus.waiting);

    await tester.tap(find.text(target.documentTitle).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Phê duyệt').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Huỷ'));
    await tester.pumpAndSettle();

    expect(
      ReviewRepository.instance.byId(target.id)!.status,
      DocStatus.waiting,
      reason: 'huỷ thì không được ghi gì',
    );
  });

  testWidgets(
    'TC_US02_HP_03 — Tổng quan ĐANG MỞ phải tự cập nhật khi dữ liệu đổi',
    (tester) async {
      // `boot` để màn ở tab Review; TC này cần đứng Ở Tổng quan.
      await boot(tester);
      await tester.tap(find.text('Tổng quan'));
      await tester.pumpAndSettle();

      // Đang đứng ở Tổng quan, KHÔNG rời màn. `AppShell` dùng `switch (_index)`
      // nên đổi tab là dựng lại màn từ đầu — muốn chứng minh có nghe repository
      // thì phải để màn yên tại chỗ mà dữ liệu đổi.
      final approvedBefore = ReviewRepository.instance
          .requests()
          .where((r) => r.status == DocStatus.approved)
          .length;
      // Thẻ "Đã phê duyệt" phải có mặt để phép đếm bên dưới có nghĩa.
      expect(find.text('Đã phê duyệt'), findsWidgets,
          reason: 'phải đang ở Tổng quan và thấy thẻ "Đã phê duyệt"');
      expect(find.text('$approvedBefore'), findsWidgets,
          reason: 'số liệu ban đầu phải hiện đúng');

      final target = ReviewRepository.instance
          .requests()
          .firstWhere((r) => r.status == DocStatus.waiting);
      ReviewRepository.instance
          .write(id: target.id, label: 'Phê duyệt', payload: DocStatus.approved.name);
      await tester.pumpAndSettle();

      // Nếu Tổng quan KHÔNG đăng ký nghe `ReviewRepository` thì chỗ này còn
      // hiện số cũ — đó chính là lỗi đã sửa (không màn nào nghe `notifyListeners`).
      expect(find.text('${approvedBefore + 1}'), findsWidgets,
          reason: 'Tổng quan phải nghe repository, không đứng im số cũ');
    },
  );
}
