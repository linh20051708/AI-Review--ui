import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/101_domain_entities/101_DOMAIN_review_entities.dart';
import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';
import 'package:mobi_review/main.dart';

/// Khi có việc xếp hàng chờ gửi, giao diện phải NÓI RA số lượng chờ.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 11): `pendingCount` (số quyết định/nộp đang
/// chờ mạng) có trong repository nhưng **không màn nào hiển thị**. Hệ quả: người
/// dùng nộp/nộp lại khi mất mạng thấy một lần "đã xếp hàng", rời màn, và sau đó
/// KHÔNG còn cách nào biết còn mấy việc chưa gửi. Nếu tắt app tưởng đã đồng bộ
/// thì mất quyết định — lỗi "giao diện nói thiếu sự thật" kiểu §3f/§3k: dữ liệu
/// tồn tại nhưng không có đường để người dùng THẤY.
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
    'TC_US11_BV_03 — khi còn việc chờ gửi, Tổng quan phải nói rõ số lượng',
    (tester) async {
      await boot(tester);

      // Dựng đúng tình huống: 2 quyết định xếp hàng khi mất mạng.
      ReviewRepository.instance.setNet(NetState.offline);
      ReviewRepository.instance
          .write(id: 'review-001', label: 'a', payload: DocStatus.approved.name);
      ReviewRepository.instance
          .write(id: 'review-002', label: 'b', payload: DocStatus.approved.name);
      expect(ReviewRepository.instance.pendingCount, 2);
      await tester.pumpAndSettle();

      // Phải thấy con số 2 kèm chữ cho biết đó là việc chờ gửi.
      expect(
        find.textContaining('chờ gửi').evaluate().isNotEmpty ||
            find.textContaining('chờ mạng').evaluate().isNotEmpty,
        isTrue,
        reason:
            'còn ${ReviewRepository.instance.pendingCount} việc chờ mạng nhưng không màn nào nói ra',
      );
    },
  );

  testWidgets('TC_US11_BV_04 — hết việc chờ thì phải không còn cảnh báo', (
    tester,
  ) async {
    ReviewRepository.instance.setNet(NetState.offline);
    ReviewRepository.instance
        .write(id: 'review-001', label: 'a', payload: DocStatus.approved.name);
    ReviewRepository.instance.setNet(NetState.online);
    ReviewRepository.instance.setNet(NetState.offline);

    await boot(tester);
    expect(ReviewRepository.instance.pendingCount, 0,
        reason: 'đã đồng bộ xong thì hàng đợi rỗng');
    expect(
      find.textContaining('chờ gửi').evaluate().isNotEmpty,
      isFalse,
      reason: 'không còn việc chờ thì không được báo nữa',
    );
  });
}
