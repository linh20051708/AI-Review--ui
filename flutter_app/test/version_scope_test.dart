import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';
import 'package:mobi_review/main.dart';

/// Lịch sử phiên bản phải THUỘC về tài liệu đang mở, không phải danh sách chung.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 6): nút "So sánh phiên bản" ở màn chi tiết
/// (`us04`) từng push `/reviews/compare` **không kèm `reviewId`**, và `us08`
/// luôn đọc `ReviewRepository.instance.docVersions()` — danh sách tĩnh 2 phần
/// tử (sequence-diagram v1/v2) **chung cho mọi tài liệu**. Mở "Use Case
/// Diagram" lại thấy lịch sử của *sequence diagram*. Lỗi "giao diện trình bày
/// sai dữ liệu": không báo lỗi, chỉ hiện sai nội dung.
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
    await tester.tap(find.text('Đăng nhập bằng SSO trường'));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pumpAndSettle();
  }

  testWidgets('TC_US08_BV_01 — so sánh phiên bản KHÔNG hiện file của tài liệu khác', (
    tester,
  ) async {
    await boot(tester);

    // Mở tài liệu KHÔNG phải sequence diagram (Use Case Diagram, review-001).
    await tester.tap(find.text('Review'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Use Case Diagram').first);
    await tester.pumpAndSettle();

    // Nút "So sánh hai phiên bản" nằm dưới cùng ListView -> cuộn tới trước.
    final cmp = find.text('So sánh hai phiên bản');
    await tester.scrollUntilVisible(cmp, 300);
    await tester.pumpAndSettle();
    await tester.tap(cmp);
    await tester.pumpAndSettle();

    // Phải KHÔNG hiện tên file sequence-diagram (đó là lịch sử của tài liệu
    // khác). Phải hiện use-case-diagram thay thế.
    expect(
      find.textContaining('sequence-diagram').evaluate().isNotEmpty,
      isFalse,
      reason: 'lịch sử phiên bản đang hiện sai tài liệu (danh sách chung)',
    );
    expect(
      find.textContaining('use-case-diagram').evaluate().isNotEmpty,
      isTrue,
      reason: 'lịch sử phiên bản phải gắn với tài liệu đang mở',
    );
  });
}
