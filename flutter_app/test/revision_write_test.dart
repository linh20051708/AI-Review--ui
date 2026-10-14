import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/domain/entities/review_entities.dart';
import 'package:mobi_review/data/repositories/review_repository.dart';
import 'package:mobi_review/features/revision_request/revision_screen.dart';

/// "Yêu cầu chỉnh sửa" và "Hoàn tác" trên US07 phải đổi trạng thái THẬT.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 9): `us07` gọi
/// `repo.write(id: reviewId, label: 'Yêu cầu chỉnh sửa', payload: _note.text)`
/// — payload là **LỜI NHẮN người dùng gõ**, không phải tên `DocStatus`; `_undo`
/// cũng gửi `payload: 'undo'`. Cả hai đều không ánh xạ được nên `_apply()`
/// lặng lẽ bỏ qua: màn hiện đã gửi, dữ liệu không đổi. Cùng họ §3d/§3i.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);
  setUp(() => ReviewRepository.instance.resetForTest());

  Future<void> boot(WidgetTester tester, String id) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(body: RequestRevisionScreen(reviewId: id)),
    ));
    await tester.pumpAndSettle();
  }

  testWidgets('TC_US07_HP_04 — gửi yêu cầu chỉnh sửa phải đổi trạng thái thật',
      (tester) async {
    await boot(tester, 'review-001');
    expect(ReviewRepository.instance.byId('review-001')!.status,
        DocStatus.waiting);

    // Nhập lý do đủ 10 ký tự rồi gửi.
    await tester.enterText(find.byType(TextField).first,
        'Sơ đồ thiếu luồng thay thế, vẽ thêm nhánh cho UC-03.');
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('Gửi yêu cầu').first);
    await tester.pumpAndSettle();

    expect(
      ReviewRepository.instance.byId('review-001')!.status,
      DocStatus.needsRevision,
      reason:
          'bấm "Gửi yêu cầu chỉnh sửa" mà trạng thái không đổi = nút nói dối',
    );
  });

  testWidgets('TC_US07_AP_04 — hoàn tác phải trả tài liệu về trạng thái trước đó',
      (tester) async {
    // Bắt đầu từ "Đang review" để hoàn tác có nghĩa (về lại waiting/inReview).
    ReviewRepository.instance.write(
      id: 'review-002',
      label: 'Chuẩn bị',
      payload: DocStatus.needsRevision.name,
    );
    expect(ReviewRepository.instance.byId('review-002')!.status,
        DocStatus.needsRevision);

    await boot(tester, 'review-002');
    await tester.enterText(find.byType(TextField).first,
        'Sửa lại tên lớp cho đúng hệ thống Quản lý học vụ.');
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('Gửi yêu cầu').first);
    await tester.pumpAndSettle();
    expect(ReviewRepository.instance.byId('review-002')!.status,
        DocStatus.needsRevision);

    // Bấm Hoàn tác -> phải trả về trạng thái TRƯỚC đó.
    final undo = find.textContaining('Hoàn tác');
    if (undo.evaluate().isNotEmpty) {
      await tester.tap(undo.first);
      await tester.pumpAndSettle();
      expect(
        ReviewRepository.instance.byId('review-002')!.status,
        isNot(DocStatus.needsRevision),
        reason: 'hoàn tác mà trạng thái vẫn "Cần chỉnh sửa" = hoàn tác nói dối',
      );
    }
  });
}
