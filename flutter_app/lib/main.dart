import 'package:flutter/material.dart';

import './011_presentation/review/us05/011_REVIEW_US05_ai_result_screen.dart';
import './011_presentation/011_CORE_app_shell.dart';
import './011_presentation/auth/us01/011_AUTH_US01_login_screen.dart';
import './011_presentation/review/us04/011_REVIEW_US04_workspace_screen.dart';
import './001_core/theme/001_CORE_app_theme.dart';

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
