import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/101_domain_entities/101_DOMAIN_review_entities.dart';
import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';
import 'package:mobi_review/011_presentation/review/us05/011_REVIEW_US05_ai_result_screen.dart';

/// 7 cảnh báo AI gắn với KHÔNG tài liệu nào, nhưng lại hiển thị ở MỌI tài liệu.
///
/// VÌ SAO CÓ FILE NÀY (14/10, đợt 12): `DemoData.aiFindings` chỉ chứa
/// `level/category/message/pageRef` — **không có `reviewId`**, tức 7 cảnh báo
/// không thuộc tài liệu nào. Nhưng `findings()` trả về NGUYÊN TẢI DANH SÁCH ấy
/// cho mọi màn `AiResultScreen`. Trong khi đó mỗi tài liệu lại tự khai báo
/// `aiErrors/aiWarnings/aiSuggestions` riêng.
///
/// Hệ quả: mở `AiResultScreen(review-001)` (khai báo 2 lỗi · 3 cảnh báo · 4 gợi
/// ý) thì thấy cùng một màn: tổng số hiển thị "2 / 3 / 4", nhưng chip lại đếm
/// từ danh sách toàn cục "Lỗi" — 2, "Cảnh báo" — 3, "Gợi ý" — 2, và "Tất cả (7)".
/// Số gợi ý (2) KHÔNG khớp số tổng luận (4); "Lỗi (2)" trùng khớp ngẫu nhiên.
/// Giảng viên không còn biết đọc theo đầu số nào.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);
  setUp(() => ReviewRepository.instance.resetForTest());

  Future<void> boot(WidgetTester tester, String reviewId) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        // `AiResultScreen` là màn không tự dựng Scaffold → phải bọc (lỗi harness
        // đã dính nhiều lần: "No Material widget found").
        body: AiResultScreen(reviewId: reviewId),
      ),
    ));
    await tester.pumpAndSettle();
  }

  testWidgets(
    'TC_US05_BV_03 — số liệu tổng và chip lọc phải cùng một nguồn',
    (tester) async {
      final doc = ReviewRepository.instance.byId('review-001');
      expect(doc, isNotNull, reason: 'phải có tài liệu review-001 để đối chiếu');

      // Tổng luận mà tài liệu tự khai báo.
      final declaredErrors = doc!.aiErrors;
      final declaredWarnings = doc.aiWarnings;
      final declaredSuggestions = doc.aiSuggestions;

      // Số cảnh báo mà chip thực sự đếm được từ `findings()`.
      final findings = ReviewRepository.instance.findings();
      final actualErrors = findings.where((f) => f.level == FindingLevel.error).length;
      final actualWarnings =
          findings.where((f) => f.level == FindingLevel.warning).length;
      final actualSuggestions =
          findings.where((f) => f.level == FindingLevel.suggestion).length;

      await boot(tester, 'review-001');

      expect(
        actualErrors == declaredErrors &&
            actualWarnings == declaredWarnings &&
            actualSuggestions == declaredSuggestions,
        isTrue,
        reason:
            'MÀN NÓI SAI: tài liệu $doc khai báo '
            '$declaredErrors lỗi · $declaredWarnings cảnh báo · $declaredSuggestions gợi ý, '
            'nhưng danh sách "Lỗi/Cảnh báo/Gợi ý" chỉ thực sự có '
            '$actualErrors/$actualWarnings/$actualSuggestions — 7 cảnh báo gắn vào CHÍNH tài '
            'liệu này nhưng số gợi ý $actualSuggestions khác số luận $declaredSuggestions. '
            'Nguồn duy nhất phải là tài liệu đang mở.',
      );
    },
  );
}
