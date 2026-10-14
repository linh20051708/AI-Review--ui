import 'package:flutter/material.dart';

import './features/ai_result/ai_result_screen.dart';
import './features/approval/approval_screen.dart';
import './features/revision_request/revision_screen.dart';
import './features/version_compare/compare_screen.dart';
import './features/rule_sets/rule_set_screen.dart';
import './features/document_submit/submit_screen.dart';
import './features/submit_gate/submit_gate_screen.dart';
import './features/group_health/group_health_screen.dart';
import './shared/app_shell.dart';
import './features/login/login_screen.dart';
import './features/review_workspace/workspace_screen.dart';
import './shared/theme/app_theme.dart';

void main() => runApp(const MobiReviewApp());

/// Bản demo handoff Flutter cho PRM323 Lab 2.
///
/// Dữ liệu mẫu chép từ `app/src/data/mockData.ts` của code nền React mà giảng
/// viên cung cấp. Đây là bản dựng lại giao diện, không có backend.
class MobiReviewApp extends StatelessWidget {
  const MobiReviewApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Mobi Review',
    debugShowCheckedModeBanner: false,
    theme: buildAppTheme(),
    initialRoute: '/login',
    onGenerateRoute: _onGenerateRoute,
  );

  Route<dynamic>? _onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/dashboard':
        return _page(const AppShell(initialIndex: 0), settings);

      case '/reviews':
        return _page(const AppShell(initialIndex: 1), settings);

      case '/notifications':
        return _page(const AppShell(initialIndex: 2), settings);

      case '/profile':
        return _page(const AppShell(initialIndex: 3), settings);

      case '/reviews/detail':
        return _page(
          _DetailScaffold(
            title: 'Không gian review',
            child: ReviewWorkspaceScreen(
              reviewId: settings.arguments as String? ?? 'review-001',
            ),
          ),
          settings,
        );

      case '/reviews/ai-result':
        return _page(
          _DetailScaffold(
            title: 'Kết quả AI',
            child: AiResultScreen(
              reviewId: settings.arguments as String? ?? 'review-001',
            ),
          ),
          settings,
        );

      case '/reviews/approve':
        return _page(
          _DetailScaffold(
            title: 'Phê duyệt tài liệu',
            child: ApprovalDecisionScreen(
              reviewId: settings.arguments as String? ?? 'review-001',
            ),
          ),
          settings,
        );

      case '/reviews/revision':
        return _page(
          _DetailScaffold(
            title: 'Yêu cầu chỉnh sửa',
            child: RequestRevisionScreen(
              reviewId: settings.arguments as String? ?? 'review-001',
            ),
          ),
          settings,
        );

      case '/reviews/compare':
        return _page(
          const _DetailScaffold(
            title: 'So sánh phiên bản',
            child: VersionCompareScreen(),
          ),
          settings,
        );

      case '/reviews/rule-set':
        return _page(
          _DetailScaffold(
            title: 'Chuẩn đang áp',
            child: ActiveRuleSetScreen(
              reviewId: settings.arguments as String? ?? 'review-001',
            ),
          ),
          settings,
        );

      case '/submit':
        return _page(
          _DetailScaffold(
            title: 'Nộp tài liệu',
            // Id TÀI LIỆU THẬT (đợt 8 sửa): từng mặc định
            // 'smart-campus-management' — mã không tồn tại trong dữ liệu, nên
            // `repo.write()` lặng lẽ bỏ qua và màn báo "Vừa xong" giả dối.
            // 'review-009' là tài liệu đang "Cần chỉnh sửa" — đúng ngữ cảnh
            // sinh viên nộp lại. Không truyền arguments thì vẫn có id hợp lệ.
            child: SubmitDocumentScreen(
              projectId: settings.arguments as String? ?? 'review-009',
            ),
          ),
          settings,
        );

      case '/submit/why-locked':
        return _page(
          const _DetailScaffold(
            title: 'Vì sao chưa nộp được',
            child: SubmitGateScreen(),
          ),
          settings,
        );

      case '/groups/health':
        return _page(
          const _DetailScaffold(
            title: 'Sức khoẻ nhóm',
            child: GroupHealthScreen(),
          ),
          settings,
        );

      case '/login':
      default:
        return _page(const LoginScreen(), settings);
    }
  }

  MaterialPageRoute<dynamic> _page(Widget child, RouteSettings settings) =>
      MaterialPageRoute<dynamic>(builder: (_) => child, settings: settings);
}

/// Scaffold cho màn chi tiết: có nút Back, không có thanh điều hướng dưới.
class _DetailScaffold extends StatelessWidget {
  const _DetailScaffold({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) =>
      Scaffold(appBar: AppBar(title: Text(title)), body: child);
}
