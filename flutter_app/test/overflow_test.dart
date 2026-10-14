import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/011_presentation/auth/us01/011_AUTH_US01_login_screen.dart';
import 'package:mobi_review/011_presentation/dashboard/us02/011_DASH_US02_dashboard_screen.dart';
import 'package:mobi_review/011_presentation/dashboard/us12/011_DASH_US12_group_health_screen.dart';
import 'package:mobi_review/011_presentation/profile/us14/011_PROFILE_US14_profile_screen.dart';
import 'package:mobi_review/011_presentation/review/us03/011_REVIEW_US03_request_list_screen.dart';
import 'package:mobi_review/011_presentation/review/us04/011_REVIEW_US04_workspace_screen.dart';
import 'package:mobi_review/011_presentation/review/us05/011_REVIEW_US05_ai_result_screen.dart';
import 'package:mobi_review/011_presentation/review/us06/011_REVIEW_US06_approval_screen.dart';
import 'package:mobi_review/011_presentation/review/us07/011_REVIEW_US07_revision_screen.dart';
import 'package:mobi_review/011_presentation/review/us08/011_REVIEW_US08_compare_screen.dart';
import 'package:mobi_review/011_presentation/review/us13/011_REVIEW_US13_rule_set_screen.dart';
import 'package:mobi_review/011_presentation/submit/us09/011_SUBMIT_US09_submit_screen.dart';
import 'package:mobi_review/011_presentation/submit/us10/011_SUBMIT_US10_submit_gate_screen.dart';

/// Quét TRÀN NGANG cho MỌI màn, ở nhiều bề rộng.
///
/// VÌ SAO CẦN: `verify/flutter-tap-targets.mjs` lái app trong trình duyệt thật
/// nhưng chỉ thấy được bố cục ở đúng một bề rộng và đúng vị trí cuộn. Quét này
/// dựng lại từng màn bằng chính khung layout của Flutter ở 320/360/412dp nên
/// bắt được mọi `RenderFlex overflowed` — kể cả lỗi chỉ hiện ở màn hẹp.
///
/// ĐÃ BẮT ĐƯỢC LỖI THẬT (14/10, đợt 2): US06 tràn 188px (Row thiếu `Expanded`);
/// US07 tràn 127/87/**35**px ở 320/360/**412**dp; US12 tràn 53/13px.
/// US07 tràn cả ở **412dp — bề rộng điện thoại thật**, tức người dùng thấy được.
///
/// Ngưỡng: giữ 320dp làm biên dưới (máy Android nhỏ / iPhone SE) để không phải
/// sửa lại khi gặp máy hẹp.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);

  final screens = <String, Widget Function()>{
    'US01 đăng nhập': () => const LoginScreen(),
    'US02 tổng quan': () => const DashboardScreen(),
    'US03 danh sách review': () => const ReviewListScreen(),
    'US04 không gian review': () =>
        const ReviewWorkspaceScreen(reviewId: 'review-001'),
    'US05 kết quả AI': () => const AiResultScreen(reviewId: 'review-001'),
    'US06 phê duyệt': () => const ApprovalDecisionScreen(reviewId: 'review-001'),
    'US07 yêu cầu chỉnh sửa': () =>
        const RequestRevisionScreen(reviewId: 'review-001'),
    'US08 so sánh phiên bản': () => const VersionCompareScreen(),
    'US09 nộp tài liệu': () => const SubmitDocumentScreen(projectId: 'p-001'),
    'US10 vì sao bị khoá': () => const SubmitGateScreen(),
    'US12 sức khoẻ nhóm': () => const GroupHealthScreen(),
    'US13 chuẩn đang áp': () => const ActiveRuleSetScreen(reviewId: 'review-001'),
    'US14 hồ sơ': () => const ProfileScreen(),
  };

  for (final entry in screens.entries) {
    for (final w in [320.0, 360.0, 412.0]) {
      testWidgets('${entry.key} — không tràn ngang ở ${w.toInt()}dp', (
        tester,
      ) async {
        tester.view.physicalSize = Size(w * 3, 2280);
        tester.view.devicePixelRatio = 3.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(
          MaterialApp(home: Scaffold(body: entry.value())),
        );
        await tester.pumpAndSettle();

        // `takeException` trả về lỗi ĐẦU TIÊN khung test bắt được; tràn ngang
        // (`RenderFlex overflowed`) đi qua đây. Không lỗi nghĩa là sạch.
        expect(tester.takeException(), isNull);
      });
    }
  }
}
