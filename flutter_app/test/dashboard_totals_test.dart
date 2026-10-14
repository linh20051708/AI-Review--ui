import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/domain/entities/review_entities.dart';
import 'package:mobi_review/data/repositories/review_repository.dart';
import 'package:mobi_review/main.dart';
import 'package:mobi_review/shared/widgets/status_chip.dart';

/// Số liệu trên Tổng quan phải ĐẾM ĐỦ, không được bỏ sót tài liệu nào.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 5): Tổng quan có 4 thẻ
/// (Chờ / Đang review / Đã phê duyệt / Cần chỉnh sửa) = 4+1+1+1 = 7, nhưng dữ
/// liệu có **8** yêu cầu. Trạng thái `notAccepted` ("Không đạt") **không được
/// thẻ nào đếm** — giảng viên nhìn Tổng quan sẽ thiếu mất một tài liệu, và
/// không có cách nào từ Tổng quan nhận ra tài liệu đó đã bị trả về.
///
/// Đây là lỗi im lặng thuộc họ "giao diện nói thiếu sự thật": không có thông
/// báo sai, chỉ là con số không khớp dữ liệu.
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
    // `AppShell` khởi tại tab 0 = Tổng quan, nên SAU KHI ĐĂNG NHẬP đã ở đúng
    // màn. KHÔNG bấm "Tổng quan" (nhãn này trùng với tiêu đề AppBar -> finder
    // lưỡng nghĩa).
  }

  testWidgets('TC_US02_BV_02 — tổng các thẻ số liệu = tổng số yêu cầu thật', (
    tester,
  ) async {
    await boot(tester);

    final all = ReviewRepository.instance.requests();
    expect(all.length, greaterThan(0), reason: 'phải có dữ liệu để đếm');

    // Gom đúng các con số của StatCard (4 thẻ) — không lấy nhầm số khác.
    final statCards = find.byType(StatCard).evaluate();
    expect(statCards.length, 5, reason: 'Tổng quan phải có đúng 5 thẻ số liệu');
    final shownNumbers = statCards.map((e) {
      final card = e.widget as StatCard;
      return int.parse(card.value);
    }).toList();

    // Tổng các thẻ StatCard phải bằng tổng số yêu cầu thật.
    final totalShown = shownNumbers.fold<int>(0, (a, b) => a + b);
    expect(
      totalShown,
      all.length,
      reason:
          'Tổng 4 thẻ StatCard ($totalShown) != số yêu cầu thật '
          '(${all.length}) => có trạng thái bị bỏ sót',
    );
  });

  testWidgets('TC_US02_BV_03 — có tài liệu "Không đạt" thì Tổng quan phải nói ra', (
    tester,
  ) async {
    final rejected = ReviewRepository.instance
        .requests()
        .where((r) => r.status == DocStatus.notAccepted)
        .toList();
    expect(rejected.length, 1, reason: 'dữ liệu mẫu phải có 1 tài liệu Không đạt');

    await boot(tester);

    // Phải có chỗ để nhìn thấy số tài liệu "Không đạt": hoặc một thẻ riêng,
    // hoặc một dòng tổng. Nếu không có gì thì tài liệu đó vô hình.
    expect(
      find.text('Không đạt').evaluate().isNotEmpty,
      isTrue,
      reason: 'tài liệu "Không đạt" đang vô hình trên Tổng quan',
    );
  });
}
