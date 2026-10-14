import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/features/login/login_screen.dart';
import 'package:mobi_review/features/dashboard/dashboard_screen.dart';
import 'package:mobi_review/features/group_health/group_health_screen.dart';
import 'package:mobi_review/features/profile/profile_screen.dart';
import 'package:mobi_review/features/request_list/request_list_screen.dart';
import 'package:mobi_review/features/review_workspace/workspace_screen.dart';
import 'package:mobi_review/features/ai_result/ai_result_screen.dart';
import 'package:mobi_review/features/approval/approval_screen.dart';
import 'package:mobi_review/features/revision_request/revision_screen.dart';
import 'package:mobi_review/features/version_compare/compare_screen.dart';
import 'package:mobi_review/features/rule_sets/rule_set_screen.dart';
import 'package:mobi_review/features/document_submit/submit_screen.dart';
import 'package:mobi_review/features/submit_gate/submit_gate_screen.dart';

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
