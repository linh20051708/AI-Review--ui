import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/main.dart';
import 'package:mobi_review/101_domain_entities/101_DOMAIN_review_entities.dart';
import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';

/// Không được có nút "chết" — bấm vào không làm gì.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 4): nút `Tìm kiếm` trên thanh tiêu đề có mặt ở
/// MỌI màn nhưng `onPressed: () {}` — bấm không mở gì. Cùng loại lỗi với
/// "toast báo thành công mà dữ liệu không đổi": giao diện hứa một hành động
/// rồi không làm gì. Cổng hình thức không bắt được, phải kiểm bằng hành vi.
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

  testWidgets('TC_US03_BV_03 — nút Tìm kiếm phải MỞ được ô tìm kiếm', (
    tester,
  ) async {
    await boot(tester);

    // Trước khi bấm: chưa có ô nhập nào ở thanh tiêu đề.
    final searchIcon = find.byTooltip('Tìm kiếm');
    expect(searchIcon, findsOneWidget, reason: 'nút Tìm kiếm phải có trên tiêu đề');

    await tester.tap(searchIcon);
    await tester.pumpAndSettle();

    // Sau khi bấm: phải có một ô nhập để gõ từ khoá. Nếu nút chết thì
    // không có `TextField` nào xuất hiện và phép kiểm này ĐỎ.
    expect(
      find.byType(TextField),
      findsWidgets,
      reason: 'bấm Tìm kiếm mà không có ô nhập nào = nút chết',
    );
  });

  testWidgets('TC_US04_BV_02 — thẻ tệp đính kèm phải MỞ được xem trước', (
    tester,
  ) async {
    await boot(tester);

    final target = ReviewRepository.instance
        .requests()
        .firstWhere((r) => r.status == DocStatus.waiting);

    // Mở màn chi tiết tài liệu (đường đi thật: tab Review -> thẻ đầu).
    await tester.tap(find.text('Review'));
    await tester.pumpAndSettle();
    await tester.tap(find.text(target.documentTitle).first);
    await tester.pumpAndSettle();

    // Thẻ tệp: nó tự khai `Semantics(button: true, label: 'Mở tài liệu ...')`
    // nên bấm vào BẮT BUỘC phải có gì đó xảy ra.
    // Thẻ tệp chứa icon `picture_as_pdf_outlined` trong một `InkWell`. Tìm theo
    // icon đó (duy nhất trên chi tiết này), rồi cuộn tới trước khi bấm. Không
    // dùng `find.text(fileName)` vì tên file còn xuất hiện ở "Lịch sử phiên bản".
    final file = find.byIcon(Icons.picture_as_pdf_outlined);
    await tester.scrollUntilVisible(file, 200);
    await tester.pumpAndSettle();
    expect(file, findsWidgets, reason: 'màn chi tiết phải có thẻ tệp đính kèm');

    // Đếm lúc CHƯA bấm: thẻ tệp tự có chữ "Xem trước 12 trang", nên chỉ kiểm
    // "có chữ Xem trước" là vô nghĩa — nó luôn đúng. Phải chứng minh có THÊM
    // một bề mặt mới mở ra (sheet/hộp thoại) sau khi bấm.
    final sheetsBefore = find.byType(BottomSheet).evaluate().length +
        find.byType(AlertDialog).evaluate().length;
    final previewTextBefore =
        find.textContaining('trang').evaluate().length;

    await tester.tap(file.first);
    await tester.pumpAndSettle();

    final sheetsAfter = find.byType(BottomSheet).evaluate().length +
        find.byType(AlertDialog).evaluate().length;
    final previewTextAfter = find.textContaining('trang').evaluate().length;

    expect(
      sheetsAfter > sheetsBefore || previewTextAfter > previewTextBefore,
      isTrue,
      reason: 'bấm thẻ tệp mà không mở thêm gì = nút chết, và semantics đang nói dối',
    );
  });
}
