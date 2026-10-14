import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';
import 'package:mobi_review/011_presentation/review/us03/011_REVIEW_US03_request_list_screen.dart';

void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);
  setUp(() => ReviewRepository.instance.resetForTest());
  testWidgets('dbg', (tester) async {
    tester.view.physicalSize = const Size(1080, 2280);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: ReviewListScreen())));
    await tester.pumpAndSettle();
    final seen=<String>[];
    for (final e in find.byType(Text).evaluate()) {
      final d=(e.widget as Text).data; if(d!=null) seen.add(d);
    }
    debugPrint('TEXTS: ${seen.join(' | ')}');
  });
}
