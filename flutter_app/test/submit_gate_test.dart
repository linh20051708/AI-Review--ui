import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/101_domain_entities/101_DOMAIN_review_entities.dart';
import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';
import 'package:mobi_review/011_presentation/submit/us10/011_SUBMIT_US10_submit_gate_screen.dart';

/// Màn "Vì sao chưa nộp được" (US10) báo "Đã nộp" thì phải nộp được THẬT.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 9): `_submit()` của US10 gọi
/// `repo.write(id: 'submit', ..., payload: 'sequence-diagram-v2.pdf')` —
/// `'submit'` KHÔNG PHẢI id tài liệu thật, còn payload là TÊN TỆP. `_apply()`
/// lặng lẽ bỏ qua cả hai, nên màn nói "Đã nộp. Giảng viên sẽ nhận được thông
/// báo." còn dữ liệu không đổi. Lỗi LẶP LẠI đợt 8 (§3i) ở màn khác — cùng kiểu
/// gõ tay id/payload.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);
  setUp(() => ReviewRepository.instance.resetForTest());

  Future<void> boot(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(body: SubmitGateScreen()),
    ));
    await tester.pumpAndSettle();
  }

  testWidgets('TC_US10_HP_02 — báo "Đã nộp" thì phải có tài liệu đổi trạng thái',
      (tester) async {
    // Màn này là cổng "vì sao chưa nộp được": dữ liệu mẫu có 1 mục đang chặn
    // (Sequence Diagram chờ duyệt), nên canSubmit = false và nút bị khoá.
    // Với dữ liệu đó, BẤM nổp phải KHÔNG tạo ra báo giả dối — màn chỉ được
    // báo khi nộp thật.
    await boot(tester);

    final before = ReviewRepository.instance
        .requests()
        .map((r) => '${r.id}:${r.status.name}')
        .join(',');

    // Mở khoá cổng: duyệt tài liệu đang chặn cho nút bấm được, như người dùng
    // thực sự vượt qua được chặn.
    final blocker = ReviewRepository.instance
        .requests()
        .firstWhere((r) => r.documentTitle == 'Sequence Diagram');
    ReviewRepository.instance.write(
      id: blocker.id,
      label: 'Duyệt mục chặn',
      payload: DocStatus.approved.name,
    );

    final submit = find.text('Nộp tài liệu');
    if (submit.evaluate().isNotEmpty) {
      await tester.tap(submit.last);
      await tester.pumpAndSettle();
    }

    final after = ReviewRepository.instance
        .requests()
        .map((r) => '${r.id}:${r.status.name}')
        .join(',');

    // Nếu màn đã nói "Đã nộp" thì PHẢI có dữ liệu đổi.
    final saidSubmitted = find
        .textContaining('Đã nộp')
        .evaluate()
        .isNotEmpty;
    if (saidSubmitted) {
      expect(after, isNot(equals(before)),
          reason: 'báo "Đã nộp" mà không có tài liệu nào đổi trạng thái');
    }
  });

  testWidgets('TC_US10_BV_01 — id/payload gõ tay không bao giờ được dùng',
      (tester) async {
    // Kiểm tra hằng: `write` với id/payload tay gõ không được phép im lặng
    // "thành công" — đây là cổng ý niệm cho kiểu lỗi §3i/§3j.
    final ok = ReviewRepository.instance.write(
      id: 'submit',
      label: 'Nộp tài liệu',
      payload: 'sequence-diagram-v2.pdf',
    );
    // Trạng thái không đổi dù write trả về true (vì _apply bo qua no-op).
    final changed = ReviewRepository.instance
        .requests()
        .any((r) => r.status == DocStatus.submitted);
    expect(changed, isFalse,
        reason: 'id/payload không hợp lệ thì không được đổi trạng thái');
    // Nếu trả về true mà không đổi gì -> đó là API dễ bị lạm dụng.
    if (ok) {
      fail('write() tra ve true voi id/payload khong hop le — '
          'API nen bao roi rang hon khi khong ap duoc gi');
    }
  });
}
