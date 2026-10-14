import 'package:flutter_test/flutter_test.dart';
import 'package:mobi_review/101_domain_entities/101_DOMAIN_review_entities.dart';
import 'package:mobi_review/111_domain_usecases/111_DOMAIN_us03_filter_requests_uc.dart';
import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';

/// Test cho tầng 111 (use case) và tầng 202 (repository).
///
/// Neo vào mã test case CMPlan tương ứng ở `docs/test-cases-cmplan.md`:
///   TC_US03_*  — lọc danh sách yêu cầu review
///   TC_US04_AP_02 — mở lại tài liệu đọc từ cache
///   TC_US11_*  — mất mạng, hàng đợi, tự phục hồi
void main() {
  setUp(() => ReviewRepository.instance.resetForTest());
  tearDown(() => ReviewRepository.instance.resetForTest());

  group('FilterRequestsUseCase (111) — US03', () {
    final sample = <ReviewRequest>[
      ReviewRequest(
        id: 'a',
        classCode: 'SE1701',
        groupName: 'Group 04',
        projectName: 'Smart Attendance System',
        documentTitle: 'Use Case Diagram',
        version: 'v1',
        submitter: 'Nguyễn Minh Anh',
        submittedAt: '01/10/2026 · 08:00',
        aiErrors: 0,
        aiWarnings: 0,
        aiSuggestions: 0,
        status: DocStatus.waiting,
      ),
      ReviewRequest(
        id: 'b',
        classCode: 'SE1701',
        groupName: 'Group 05',
        projectName: 'Campus Service Portal',
        documentTitle: 'Class Diagram',
        version: 'v2',
        submitter: 'Trần Hoàng Nam',
        submittedAt: '02/10/2026 · 09:00',
        aiErrors: 1,
        aiWarnings: 0,
        aiSuggestions: 0,
        status: DocStatus.approved,
      ),
    ];

    test('TC_US03_HP_01 — không lọc thì trả nguyên danh sách', () {
      final out = FilterRequestsUseCase.run(source: sample);
      expect(out.length, 2);
      expect(out.map((r) => r.id).toList(), ['a', 'b']);
    });

    test('TC_US03_AP_02 — lọc theo trạng thái', () {
      final out = FilterRequestsUseCase.run(
        source: sample,
        statuses: <DocStatus>[DocStatus.approved],
      );
      expect(out.length, 1);
      expect(out.single.id, 'b');
    });

    test('TC_US03_AP_02b — nhiều trạng thái là OR', () {
      final out = FilterRequestsUseCase.run(
        source: sample,
        statuses: <DocStatus>[DocStatus.approved, DocStatus.waiting],
      );
      expect(out.length, 2);
    });

    test('TC_US03_BV_01 — từ khoá rỗng trả toàn bộ', () {
      expect(FilterRequestsUseCase.run(source: sample, keyword: '   ').length, 2);
    });

    test('TC_US03_BV_02 — từ khoá không khớp trả rỗng', () {
      expect(FilterRequestsUseCase.run(source: sample, keyword: 'zzz').length, 0);
    });

    test('tìm không phân biệt hoa thường và khớp nhiều trường', () {
      // khớp theo projectName
      expect(FilterRequestsUseCase.run(source: sample, keyword: 'campus').single.id, 'b');
      // khớp theo submitter
      expect(FilterRequestsUseCase.run(source: sample, keyword: 'minh anh').single.id, 'a');
      // khớp theo documentTitle
      expect(FilterRequestsUseCase.run(source: sample, keyword: 'CLASS DIAGRAM').single.id, 'b');
    });

    test('lọc kết hợp từ khoá và trạng thái', () {
      final out = FilterRequestsUseCase.run(
        source: sample,
        keyword: 'group',
        statuses: <DocStatus>[DocStatus.approved],
      );
      expect(out.single.id, 'b');
    });

    test('không làm thay đổi danh sách nguồn', () {
      final before = List<ReviewRequest>.from(sample);
      FilterRequestsUseCase.run(source: sample, keyword: 'campus');
      expect(sample.length, before.length);
    });
  });

  group('ReviewRepository (202) — US11 mất mạng & phục hồi', () {
    test('TC_US11_HP_01 — mặc định là online', () {
      expect(ReviewRepository.instance.net, NetState.online);
      expect(ReviewRepository.instance.isOffline, isFalse);
    });

    test('TC_US11_HP_02 — có mạng trở lại thì tự đẩy hàng đợi', () {
      final repo = ReviewRepository.instance;
      repo.setNet(NetState.offline);
      expect(repo.write(id: 'review-001', label: 'phê duyệt', payload: 'x'), isFalse);
      expect(repo.pendingCount, 1);

      repo.setNet(NetState.online);
      expect(repo.pendingCount, 0, reason: 'hàng đợi phải được đẩy đi khi có mạng');
    });

    test('TC_US11_EX_01 — ghi khi offline thì vào hàng đợi, không mất', () {
      final repo = ReviewRepository.instance;
      repo.setNet(NetState.offline);
      repo.write(id: 'a', label: 'l1', payload: 'p1');
      repo.write(id: 'b', label: 'l2', payload: 'p2');
      expect(repo.pendingCount, 2);
      expect(repo.queue.map((w) => w.id).toList(), ['a', 'b']);
    });

    test('ghi khi online thì gửi ngay, không vào hàng đợi', () {
      final repo = ReviewRepository.instance;
      expect(repo.write(id: 'a', label: 'l', payload: 'p'), isTrue);
      expect(repo.pendingCount, 0);
    });

    test('TC_US04_AP_02 — đọc lại dùng cache, không nạp lại nguồn', () {
      final repo = ReviewRepository.instance;
      final first = repo.requests();
      final second = repo.requests();
      expect(identical(first, second), isTrue, reason: 'lần hai phải là cùng một đối tượng cache');
    });

    test('offline vẫn đọc được dữ liệu đã cache', () {
      final repo = ReviewRepository.instance;
      repo.requests(); // nạp cache
      repo.setNet(NetState.offline);
      expect(repo.requests(), isNotEmpty);
    });

    test('byId trả null khi không có — không bịa bản ghi', () {
      expect(ReviewRepository.instance.byId('khong-ton-tai'), isNull);
      expect(ReviewRepository.instance.byId('review-001'), isNotNull);
    });

    test('setNet cùng giá trị không thông báo thừa', () {
      final repo = ReviewRepository.instance;
      var n = 0;
      void listener() => n++;
      repo.addListener(listener);
      repo.setNet(NetState.online); // đang online -> không đổi
      expect(n, 0);
      repo.setNet(NetState.offline);
      expect(n, 1);
      repo.removeListener(listener);
    });

    test('resetForTest trả về trạng thái ban đầu', () {
      final repo = ReviewRepository.instance;
      repo.setNet(NetState.offline);
      repo.write(id: 'x', label: 'l', payload: 'p');
      repo.resetForTest();
      expect(repo.isOffline, isFalse);
      expect(repo.pendingCount, 0);
    });
  });
}
