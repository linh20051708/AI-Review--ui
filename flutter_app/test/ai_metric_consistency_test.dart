import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/data/repositories/review_repository.dart';
import 'package:mobi_review/main.dart';

/// Số liệu AI phải ĐÚNG với tài liệu đang mở, không được "găm cứng" một chuỗi.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 7): trong `us04` (`_tracks`), dòng "AI đã
/// review" từng găm cứng chuỗi `'3 lỗi · 6 cảnh báo · 5 gợi ý'` cho MỌI tài
/// liệu — mà chuỗi này KHÔNG khớp tài liệu nào trong dữ liệu mẫu (gần nhất là
/// review-001: 2 lỗi · 3 cảnh báo · 4 gợi ý). Cùng lúc `_aiSummary` trong
/// CHÍNH màn đó lại đọc `r.aiErrors/Warnings/Suggestions` đúng → màn tự mâu
/// thuẫn. Lỗi "giao diện trình bày sai dữ liệu": không báo lỗi, chỉ hiện số
/// bịa. Cùng họ với §3g (lịch sử phiên bản hiện sai tài liệu).
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

  testWidgets(
    'TC_US04_BV_03 — dòng "AI đã review" phải hiện đúng số của tài liệu đang mở',
    (tester) async {
      await boot(tester);

      // Mở một tài liệu có số AI RÕ RỆT KHÁC với chuỗi găm cứng.
      // Activity Diagram (review-003): 0 lỗi · 1 cảnh báo · 2 gợi ý.
      final target = ReviewRepository.instance
          .requests()
          .firstWhere((r) => r.documentTitle == 'Activity Diagram');
      final expectStr =
          '${target.aiErrors} lỗi · ${target.aiWarnings} cảnh báo · ${target.aiSuggestions} gợi ý';

      await tester.tap(find.text('Review'));
      await tester.pumpAndSettle();
      await tester.tap(find.text(target.documentTitle).first);
      await tester.pumpAndSettle();

      // Không được hiện chuỗi găm cứng sai (khớp với KHÔNG tài liệu nào).
      expect(
        find.text('3 lỗi · 6 cảnh báo · 5 gợi ý').evaluate().isNotEmpty,
        isFalse,
        reason: 'đang hiện chuỗi AI găm cứng, sai với tài liệu đang mở',
      );

      // Phải hiện đúng chuỗi tính từ dữ liệu tài liệu đó.
      expect(
        find.text(expectStr).evaluate().isNotEmpty,
        isTrue,
        reason: 'dòng "AI đã review" phải tính từ r.ai* của tài liệu đang mở',
      );
    },
  );
}
