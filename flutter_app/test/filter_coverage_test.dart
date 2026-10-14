import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/domain/entities/review_entities.dart';
import 'package:mobi_review/data/repositories/review_repository.dart';
import 'package:mobi_review/features/request_list/request_list_screen.dart';

/// Bộ lọc ở danh sách yêu cầu review phải phủ ĐỦ trạng thái có trong dữ liệu.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 10): danh sách (US03) có dãy chip lọc
/// `waiting, inReview, needsRevision, approved` — thiếu `notAccepted`. Dữ liệu
/// có 1 tài liệu "Không đạt" (review-010) nên **không cách nào lọc ra được nó**
/// dù nó hiện ở "Tất cả". Cùng kiểu lỗi §3f (Tổng quan đếm thiếu): hiện thì thấy,
/// muốn xem riêng thì không có đường. Khác chỗ: đây nói về khả năng THĂM DÒ dữ
/// liệu của người dùng, không chỉ về con số.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);
  setUp(() => ReviewRepository.instance.resetForTest());

  Future<void> boot(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(body: ReviewListScreen()),
    ));
    await tester.pumpAndSettle();
  }

  testWidgets(
    'TC_US03_BV_04 — lọc được "Không đạt" — dãy chip phủ đủ mọi trạng thái',
    (tester) async {
      await boot(tester);

      // Mọi trạng thái xuất hiện trong dữ liệu phải có chip tương ứng (hoặc ít
      // nhất đạt được bằng cách lọc).
      final present = ReviewRepository.instance
          .requests()
          .map((r) => r.status)
          .toSet();

      expect(present.contains(DocStatus.notAccepted), isTrue,
          reason: 'dữ liệu mẫu phải có tài liệu "Không đạt"');

      // Chip lọc hiển thị nhãn bằng `Text`. DÃY chip nằm trong `ListView`
      // NGANG nên chip xa màn CHƯA ĐƯỢC DỰNG (ListView lazily builds) — phải
      // cuộn ngang tới trước khi tìm. (Lỗi tôi đã mắc: find lúc chưa cuộn.)
      final chipHeritage = find.text('Không đạt');
      var found = chipHeritage.evaluate().isNotEmpty;
      for (var i = 0; i < 8 && !found; i++) {
        final lv = find.byType(ListView).first;
        await tester.drag(lv, const Offset(-600, 0));
        await tester.pumpAndSettle();
        found = chipHeritage.evaluate().isNotEmpty;
      }
      expect(found, isTrue,
          reason: 'thiếu chip lọc cho trạng thái "Không đạt" — không lọc được');
    },
  );

  testWidgets('TC_US03_BV_05 — lọc "Không đạt" thì chỉ còn tài liệu Không đạt',
      (tester) async {
    await boot(tester);

    // Nhãn chip là `Text` con của InkWell; cuộn dãy ngang tới khi thấy.
    final chip = find.text('Không đạt');
    for (var i = 0; i < 8 && chip.evaluate().isEmpty; i++) {
      await tester.drag(find.byType(ListView).first, const Offset(-600, 0));
      await tester.pumpAndSettle();
    }
    expect(chip, findsWidgets, reason: 'phải có chip "Không đạt"');
    await tester.tap(chip);
    await tester.pumpAndSettle();

    // Sau khi lọc, số "yêu cầu" phải bằng số tài liệu Không đạt thật.
    final expected = ReviewRepository.instance
        .requests()
        .where((r) => r.status == DocStatus.notAccepted)
        .length;
    expect(find.text('$expected yêu cầu'), findsOneWidget,
        reason: 'lọc "Không đạt" thì danh sách chỉ còn tài liệu Không đạt');
  });
}
