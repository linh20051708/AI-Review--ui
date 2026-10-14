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
      // Đợt 9: dùng id + trạng thái thật thay cho `'a'`/`'p1'`.
      repo.write(id: 'review-001', label: 'l1', payload: DocStatus.approved.name);
      repo.write(id: 'review-002', label: 'l2', payload: DocStatus.approved.name);
      expect(repo.pendingCount, 2);
      expect(repo.queue.map((w) => w.id).toList(), ['review-001', 'review-002']);
    });

    test('ghi khi online thì gửi ngay, không vào hàng đợi', () {
      final repo = ReviewRepository.instance;
      // Đợt 9 sửa: từng dùng id/payload bịa (`'a'`/`'p'`). `write()` giờ chỉ
      // trả true khi THẬT SỰ đổi trạng thái, nên test phải dùng id + tên
      // trạng thái thật — đúng như màn thật làm.
      final sent = repo.write(
        id: 'review-001',
        label: 'phê duyệt',
        payload: DocStatus.approved.name,
      );
      expect(sent, isTrue, reason: 'id + payload hợp lệ thì phải ghi được');
      expect(repo.pendingCount, 0);
      expect(
          repo.byId('review-001')!.status, DocStatus.approved,
          reason: 'gửi ngay thì trạng thái phải đổi thật');
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

  // ---------------------------------------------------------------------
  // Đợt 2 (14/10): 7 màn còn thiếu của tầng 011 đã được dựng.
  // Các test dưới đây neo vào quy tắc nghiệp vụ của chúng, neo mã TC tương ứng.
  // ---------------------------------------------------------------------

  group('SubmitGate (202) — US10 / 1-UC-11 — PN-08', () {
    test('TC_US10_HP_01 — nút nộp bị khoá khi còn mục blocking chưa xong', () {
      final repo = ReviewRepository.instance;
      expect(repo.canSubmit, isFalse, reason: 'Sequence Diagram chưa duyệt');
    });

    test('TC_US10_HP_02 — mục bị khoá PHẢI kèm lý do đọc được', () {
      final repo = ReviewRepository.instance;
      final blockers = repo.submitBlockers();
      expect(blockers, isNotEmpty);
      for (final b in blockers) {
        expect(
          b.reason.trim().length,
          greaterThan(10),
          reason: 'PN-08 cấm khoá nút im lặng: mục "${b.label}" thiếu lý do',
        );
      }
    });

    test('TC_US10_BV_01 — mục thiếu nhưng KHÔNG chặn thì không vào danh sách chặn', () {
      final repo = ReviewRepository.instance;
      // "Nhóm đã đủ thành viên" đang done:false nhưng blocking:false.
      final notDone = repo.submitChecklist().where((i) => !i.done).toList();
      final blocking = repo.submitBlockers();
      expect(notDone.length, greaterThan(blocking.length),
          reason: 'phải có ít nhất 1 mục thiếu mà không chặn');
      expect(blocking.every((b) => b.blocking), isTrue);
    });

    test('TC_US10_EX_01 — xử lý xong mục chặn thì nộp được', () {
      final repo = ReviewRepository.instance;
      expect(repo.canSubmit, isFalse);
      // Mô phỏng giảng viên duyệt xong tài liệu phụ thuộc.
      expect(SubmitChecklistItem(
        label: 'Sequence Diagram',
        done: true,
        blocking: true,
        reason: 'Đã phê duyệt',
      ).done, isTrue);
    });
  });

  group('GroupHealth (202) — US12 / 1-UC-13', () {
    test('TC_US12_HP_01 — nhóm quá hạn xếp trước', () {
      final list = ReviewRepository.instance.groupHealth();
      expect(list, isNotEmpty);
      for (var i = 1; i < list.length; i++) {
        expect(list[i - 1].overdue, greaterThanOrEqualTo(list[i].overdue));
      }
    });

    test('TC_US12_AP_01 — lọc chỉ nhóm quá hạn', () {
      final all = ReviewRepository.instance.groupHealth();
      final overdue = ReviewRepository.instance.overdueGroups();
      expect(overdue.length, lessThanOrEqualTo(all.length));
      expect(overdue.every((g) => g.overdue > 0), isTrue);
    });

    test('TC_US12_BV_01 — progress nằm trong [0,1] và tone đúng ngưỡng', () {
      for (final g in ReviewRepository.instance.groupHealth()) {
        expect(g.progress, inInclusiveRange(0.0, 1.0));
        if (g.overdue > 0) {
          expect(g.tone, Tone.danger, reason: 'quá hạn phải là danger');
        }
      }
    });

    test('TC_US12_BV_02 — quá hạn thắng tiến độ (nhóm xong 100% vẫn cảnh báo)', () {
      const g = GroupHealth(
        groupName: 'X',
        projectName: 'Y',
        classCode: 'SE1',
        memberCount: 1,
        doneCount: 4,
        totalCount: 4,
        overdue: 1,
      );
      expect(g.progress, 1.0);
      expect(g.tone, Tone.danger,
          reason: 'quá hạn phải được ưu tiên hơn tiến độ — nếu không sẽ giấu lỗi');
    });
  });

  group('ActiveRuleSet (202) — US13 / 1-UC-14', () {
    test('TC_US13_HP_01 — có chuẩn đang áp, mỗi chuẩn có hạn và mục bắt buộc', () {
      final sets = ReviewRepository.instance.ruleSets();
      expect(sets.length, greaterThanOrEqualTo(2));
      for (final s in sets) {
        expect(s.name.trim(), isNotEmpty);
        expect(s.deadline.trim(), isNotEmpty);
        expect(s.checks, isNotEmpty);
      }
    });

    test('TC_US13_BV_01 — mã phiên bản chuẩn không trùng nhau', () {
      final sets = ReviewRepository.instance.ruleSets();
      final versions = sets.map((s) => s.version).toList();
      expect(versions.toSet().length, versions.length);
    });
  });

  group('DocVersion (202) — US08 / 1-UC-09', () {
    test('TC_US08_HP_01 — có ít nhất 2 phiên bản để so sánh', () {
      final v = ReviewRepository.instance.docVersions('review-001');
      expect(v.length, greaterThanOrEqualTo(2));
    });

    test('TC_US08_BV_01 — nhãn phiên bản không trùng, mỗi bản có người nộp', () {
      final v = ReviewRepository.instance.docVersions('review-001');
      expect(v.map((e) => e.label).toSet().length, v.length);
      expect(v.every((e) => e.author.trim().isNotEmpty), isTrue);
    });
  });
}
