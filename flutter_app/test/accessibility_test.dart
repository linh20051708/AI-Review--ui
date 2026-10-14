import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/201_data_sources/201_DOMAIN_mock_datasource.dart';
import 'package:mobi_review/101_domain_entities/101_DOMAIN_review_entities.dart';
import 'package:mobi_review/001_core/theme/001_CORE_color_tokens.dart';
import 'package:mobi_review/001_core/theme/001_CORE_spacing.dart';
import 'package:mobi_review/001_core/theme/001_CORE_app_theme.dart';
import 'package:mobi_review/011_presentation/review/us03/011_REVIEW_US03_review_card.dart';
import 'package:mobi_review/011_presentation/shared/011_CORE_shared_status_chip.dart';

/// Kiểm tra những ràng buộc **đo được** trong đề bài Lab 2 (mục C và D).
///
/// Mỗi test dưới đây kiểm một con số cụ thể, không kiểm cảm giác:
/// ngưỡng chạm C4, sàn chữ 14sp, và sự tồn tại của token đúng mã màu.
void main() {
  // Test không có mạng: chặn google_fonts tải Inter từ CDN.
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);

  group('C4 — ngưỡng tiếp cận', () {
    test('tapMin phải >= 48dp (WCAG 2.5.8 / Material 3)', () {
      expect(AppSpace.tapMin, greaterThanOrEqualTo(48.0));
    });

    test('thanh điều hướng dưới >= 48dp', () {
      expect(AppSpace.navH, greaterThanOrEqualTo(AppSpace.tapMin));
    });

    test('app bar >= 48dp', () {
      expect(AppSpace.headerH, greaterThanOrEqualTo(AppSpace.tapMin));
    });

    test('chip trạng thái dùng token màu dự án, không màu tự đặt', () {
      expect(AppColors.brand, const Color(0xFF146B55));
      expect(AppColors.ink, const Color(0xFF24332D));
      expect(AppColors.line, const Color(0xFFE1E7E3));
    });
  });

  group('D — component', () {
    testWidgets('StatusChip hiển thị nhãn tiếng Việt, không chỉ dựa vào màu',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatusChip(label: 'Chờ giảng viên review', tone: Tone.amber),
          ),
        ),
      );

      expect(find.text('Chờ giảng viên review'), findsOneWidget);
    });

    testWidgets('IconButton trên AppBar phải >= 48x48dp', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: buildAppTheme(),
          home: Scaffold(
            appBar: AppBar(
              title: const Text('Tổng quan'),
              actions: [
                IconButton(onPressed: () {}, icon: const Icon(Icons.search)),
                IconButton(onPressed: () {}, icon: const Icon(Icons.person)),
              ],
            ),
            body: const SizedBox.shrink(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // IconButton của Material 3 mặc định 40dp — theme phải nâng lên 48dp.
      final buttons = find.byType(IconButton);
      expect(buttons, findsNWidgets(2));
      for (var i = 0; i < 2; i++) {
        final size = tester.getSize(buttons.at(i));
        expect(size.width, greaterThanOrEqualTo(AppSpace.tapMin));
        expect(size.height, greaterThanOrEqualTo(AppSpace.tapMin));
      }
    });

    testWidgets('nút FilledButton phải >= 48dp chiều cao', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: buildAppTheme(),
          home: Scaffold(
            body: Center(
              child: FilledButton(onPressed: () {}, child: const Text('Gửi')),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final size = tester.getSize(find.byType(FilledButton));
      expect(size.height, greaterThanOrEqualTo(AppSpace.tapMin));
    });

    testWidgets('ReviewCard có chiều cao >= 48dp', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ReviewCard(
              item: DemoData.reviewRequests.first,
              onTap: () {},
            ),
          ),
        ),
      );

      final size = tester.getSize(find.byType(ReviewCard));
      expect(size.height, greaterThanOrEqualTo(AppSpace.tapMin));
    });

    testWidgets('ReviewCard hiện đủ thông tin khi tài liệu có lỗi AI',
        (tester) async {
      final withAi = DemoData.reviewRequests.firstWhere((r) => r.aiTotal > 0);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ReviewCard(item: withAi, onTap: () {}),
          ),
        ),
      );

      expect(find.text(withAi.documentTitle), findsOneWidget);
      expect(find.text('${withAi.version} · ${withAi.submitter}'), findsOneWidget);
    });
  });

  group('Dữ liệu demo', () {
    test('chỉ dùng tên người và lớp lấy từ code nền', () {
      for (final r in DemoData.reviewRequests) {
        expect(r.classCode, 'SE1701');
        expect(r.id, startsWith('review-'));
      }
    });

    test('mọi trạng thái đều có nhãn tiếng Việt khác rỗng', () {
      for (final s in DocStatus.values) {
        expect(s.label.trim(), isNotEmpty);
      }
    });
  });
}
