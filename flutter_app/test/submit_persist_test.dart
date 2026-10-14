import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/101_domain_entities/101_DOMAIN_review_entities.dart';
import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';
import 'package:mobi_review/011_presentation/submit/us09/011_SUBMIT_US09_submit_screen.dart';

/// Bấm "Nộp tài liệu" trên màn US09 phải làm ĐỔI dữ liệu thật, không chỉ đổi chữ.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 8): màn nộp tài liệu gọi
/// `repo.write(id: widget.projectId, ..., payload: _fileName)` nhưng
///   - route `/submit` truyền `projectId = 'smart-campus-management'` — mã KHÔNG
///     tồn tại trong dữ liệu (id thật là `review-001`…`review-008`);
///   - `payload` là TÊN TỆP (`sequence-diagram-v2.pdf`) — không ánh xạ được sang
///     `DocStatus` nào.
/// `_apply()` (đã viết cẩn thận từ đợt 3) lặng lẽ bỏ qua cả hai trường hợp,
/// nên màn hiện "Vừa xong" còn dữ liệu KHÔNG đổi một milimet. Đây là lỗi cùng
/// họ §3d: "giao diện báo một việc không xảy ra".
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);
  setUp(() => ReviewRepository.instance.resetForTest());

  Future<void> boot(WidgetTester tester, {String? projectId}) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    // Môn thẳng màn cần test bằng scaffold tối giản — điều kiện trước (đã
    // đăng nhập) không liên quan đến cái lỗi đang chứng minh.
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: SubmitDocumentScreen(
          projectId: projectId ?? 'review-009',
        ),
      ),
    ));
    await tester.pumpAndSettle();
  }

  testWidgets(
    'TC_US09_HP_04 — bấm "Nộp tài liệu" phải đổi trạng thái một tài liệu THẬT',
    (tester) async {
      await boot(tester);

      // Trạng thái TỔNG trước khi nộp — dùng để phát hiện "có gì đổi không".
      final before = ReviewRepository.instance
          .requests()
          .map((r) => '${r.id}:${r.status.name}')
          .join(',');
      final submittedBefore = ReviewRepository.instance
          .requests()
          .where((r) => r.status == DocStatus.submitted)
          .length;
      expect(submittedBefore, 0, reason: 'đầu bài chưa có tài liệu nào Đã nộp');

      final submitButton = find.text('Nộp tài liệu');
      await tester.tap(submitButton.last);
      await tester.pumpAndSettle();

      final after = ReviewRepository.instance
          .requests()
          .map((r) => '${r.id}:${r.status.name}')
          .join(',');
      final submittedAfter = ReviewRepository.instance
          .requests()
          .where((r) => r.status == DocStatus.submitted)
          .length;

      // Màn báo "Vừa xong" thì dữ liệu PHẢI đổi. Nếu chuỗi bằng y lúc đầu thì
      // nút đã nói dối (gõ nhầm id hoặc payload không ánh xạ được).
      expect(
        after,
        isNot(equals(before)),
        reason: 'bấm Nộp xong, không tài liệu nào đổi trạng thái — '
            'id hoặc payload không khớp dữ liệu thật',
      );
      expect(
        submittedAfter,
        greaterThan(submittedBefore),
        reason: 'phải có ít nhất một tài liệu chuyển sang "Đã nộp"',
      );
    },
  );

  testWidgets(
    'TC_US09_AP_05 — mất mạng thì xếp hàng, có mạng trở lại thì ghi thật',
    (tester) async {
      // Mất mạng TRƯỚC khi bấm Nộp -> việc phải vào hàng, chưa ghi.
      ReviewRepository.instance.setNet(NetState.offline);
      await boot(tester);

      // LƯU Ý: `_apply` THAY THẾ phần tử trong list (`list[at] = ...copyWith`),
      // nên phải HỎI LẠI qua `byId` mỗi lần — giữ biến cũ sẽ đọc object cũ.
      expect(ReviewRepository.instance.byId('review-009')!.status,
          DocStatus.needsRevision,
          reason: 'trước khi nộp, tài liệu phải đang "Cần chỉnh sửa"');

      await tester.tap(find.text('Nộp tài liệu').last);
      await tester.pumpAndSettle();

      // Mất mạng: màn phải nói ĐANG CHỜ, và trạng thái chưa đổi.
      expect(ReviewRepository.instance.pendingCount, 1,
          reason: 'mất mạng thì việc phải xếp hàng');
      expect(ReviewRepository.instance.byId('review-009')!.status,
          DocStatus.needsRevision,
          reason: 'chưa có mạng thì chưa được ghi');

      // Có mạng trở lại -> `_flushQueue` áp việc đã xếp.
      ReviewRepository.instance.setNet(NetState.online);
      await tester.pumpAndSettle();

      expect(ReviewRepository.instance.byId('review-009')!.status,
          DocStatus.submitted,
          reason: 'có mạng trở lại thì việc đã xếp phải được ghi thật');
    },
  );
}
