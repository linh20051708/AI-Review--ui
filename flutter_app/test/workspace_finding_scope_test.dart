import 'dart:io' as io;
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/data/repositories/review_repository.dart';
import 'package:mobi_review/features/review_workspace/workspace_screen.dart';

/// MÀN WORKSPACE cũng phải chỉ hiển thị phát hiện của TÀI LIỆU ĐANG MỞ.
///
/// VÌ SAO CÓ FILE NÀY (đợt 14): đợt 12 tôi sửa §3m cho `ai_result_screen.dart`
/// nhưng QUÊN MẮT hai chỗ khác cũng gọi `findings()` không tham số:
///
///   `features/review_workspace/workspace_screen.dart:104`
///   `features/review_workspace/workspace_screen.dart:117`
///
/// Hệ quả: mở workspace của `review-001` (chỉ có 7 cảnh báo) thì danh sách "Phát
/// hiện của AI" lại lôi CẢ 7 cảnh báo toàn cục — trong đó có cảnh báo không
/// thuộc tài liệu này, và nút "Xem tất cả N phát hiện" đếm 7 dù tài liệu không
/// có bấy nhiêu. Lỗi §3m chỉ mới được sửa MỘT MÀN.
///
/// Đây là bài học lặp: sửa một triệu chứng ở một chỗ, không quét toàn bộ chỗ
/// cùng dùng. Cổng ở đây chặn bằng CẢ HAI cách: (a) không còn dòng `findings()`
/// nào thiếu tham số trong lib/; (b) màn workspace thật sự lọc theo tài liệu.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);
  setUp(() => ReviewRepository.instance.resetForTest());

  testWidgets(
    'TC_US04_BV_04 — màn workspace chỉ đếm phát hiện của tài liệu đang mở',
    (tester) async {
      final doc = ReviewRepository.instance.byId('review-001');
      expect(doc, isNotNull);

      // Số phát hiện ĐÚNG = số đếm được trong dữ liệu của chính tài liệu này.
      final scoped =
          ReviewRepository.instance.findings('review-001').length;

      // Toàn bộ 7 cảnh báo toàn cục — nếu màn dùng số này thì nó đang nói sai.
      final global = ReviewRepository.instance.findings().length;
      expect(global, isNot(equals(scoped)),
          reason: 'tiền đề của test: global phải khác scoped, nếu không test vô giá trị');

      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: ReviewWorkspaceScreen(reviewId: 'review-001'),
        ),
      ));
      await tester.pumpAndSettle();

      // Nút "Xem tất cả ..." nằm dưới màn (màn dài 577 dòng). ListView dọc dựng
      // lazily nên PHẢI cuộn tới — bẫy harness (d) đã dính nhiều lần.
      final nut = find.textContaining('phát hiện');
      for (var i = 0; i < 14 && nut.evaluate().isEmpty; i++) {
        await tester.drag(find.byType(ListView).first, const Offset(0, -400));
        await tester.pumpAndSettle();
      }

      // Nút "Xem tất cả N phát hiện" phải lấy N = scoped, không phải global.
      expect(
        find.text('Xem tất cả $scoped phát hiện'),
        findsWidgets,
        reason:
            'nút phải đếm $scoped (của tài liệu này), không phải $global toàn cục',
      );
      expect(
        find.text('Xem tất cả $global phát hiện'),
        findsNothing,
        reason: 'KHÔNG được đếm cả $global phát hiện toàn cục lên tài liệu này',
      );
    },
  );

  test('TC_US04_BV_05 — không còn lời gọi findings() thiếu tham số trong lib/', () {
    // Cổ�ng chống quên mắt: không phụ thuộc vào tôi có nhớ cách gọi đúng hay không.
    // `flutter test` chaỵy từ flutter_app/ nên lib/ là `lib` tương đối.
    final bad = <String>[];
    for (final f in io.Directory('lib').listSync(recursive: true)) {
      if (f is! io.File || !f.path.endsWith('.dart')) continue;
      final text = f.readAsStringSync();
      // Bỏ qua comment (dòng //) — chỉ tính LỜI GỌI thật.
      final calls = text.split('\n').where((l) => !l.trimLeft().startsWith('//'));
      for (final line in calls) {
        if (line.contains('findings()')) {
          bad.add('${f.path}: ${line.trim()}');
        }
      }
    }
    expect(bad, isEmpty,
        reason: 'còn ${bad.length} chỗ quên lọc theo tài liệu: $bad');
  });
}
