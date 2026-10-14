import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobi_review/101_domain_entities/101_DOMAIN_review_entities.dart';
import 'package:mobi_review/202_data_repositories/202_DOMAIN_review_repository.dart';

/// Ghi quyết định review phải **đổi được trạng thái thật**, không chỉ báo thành công.
///
/// VÌ SAO CÓ FILE NÀY — lỗi thật đã bắt (14/10, đợt 3):
/// `ReviewRepository.write()` chỉ `debugPrint` rồi trả `true`. Giao diện US04/US06
/// hiện thông báo "Trạng thái đã cập nhật." nhưng `byId(id).status` **không đổi**.
/// Người dùng bấm Phê duyệt, thấy báo thành công, quay lại danh sách thì tài liệu
/// vẫn "Chờ giảng viên review" — app nói dối người dùng.
///
/// Test này khoá lại điều đó: sau `write(...)`, `byId(id).status` BẮT BUỘC đổi.
void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);

  setUp(() => ReviewRepository.instance.resetForTest());

  /// Tìm một tài liệu đang chờ xử lý (chưa phải trạng thái cuối).
  ReviewRequest pending() => ReviewRepository.instance
      .requests()
      .firstWhere((r) => r.status == DocStatus.waiting);

  test('TC_US06_HP_03 — phê duyệt thì status đổi thành approved', () {
    final r = pending();
    final repo = ReviewRepository.instance;

    final sent = repo.write(
      id: r.id,
      label: 'Phê duyệt',
      payload: DocStatus.approved.name,
    );

    expect(sent, isTrue, reason: 'đang online thì phải gửi được ngay');
    expect(
      repo.byId(r.id)!.status,
      DocStatus.approved,
      reason: 'bấm Phê duyệt mà status không đổi = app báo sai cho người dùng',
    );
  });

  test('TC_US07_HP_03 — yêu cầu chỉnh sửa thì status đổi thành needsRevision', () {
    final r = pending();
    final repo = ReviewRepository.instance;

    repo.write(
      id: r.id,
      label: 'Yêu cầu chỉnh sửa',
      payload: DocStatus.needsRevision.name,
    );

    expect(repo.byId(r.id)!.status, DocStatus.needsRevision);
  });

  test('TC_US06_AP_02 — offline thì xếp hàng, trạng thái KHÔNG đổi ngay', () {
    final r = pending();
    final repo = ReviewRepository.instance;
    repo.setNet(NetState.offline);

    final sent = repo.write(
      id: r.id,
      label: 'Phê duyệt',
      payload: DocStatus.approved.name,
    );

    expect(sent, isFalse, reason: 'offline thì phải xếp hàng');
    expect(repo.byId(r.id)!.status, DocStatus.waiting,
        reason: 'chưa gửi được thì không được đổi trạng thái');
    expect(repo.pendingCount, 1);
  });

  test('TC_US06_AP_03 — có mạng lại thì đẩy hàng đợi và áp dụng quyết định', () {
    final r = pending();
    final repo = ReviewRepository.instance;
    repo.setNet(NetState.offline);
    repo.write(id: r.id, label: 'Phê duyệt', payload: DocStatus.approved.name);
    expect(repo.byId(r.id)!.status, DocStatus.waiting);

    repo.setNet(NetState.online);

    expect(repo.pendingCount, 0, reason: 'hàng đợi phải được đẩy đi');
    expect(repo.byId(r.id)!.status, DocStatus.approved,
        reason: 'quyết định xếp hàng phải được áp dụng khi có mạng');
  });

  test('payload lạ thì không làm hỏng trạng thái', () {
    final r = pending();
    final repo = ReviewRepository.instance;

    repo.write(id: r.id, label: 'X', payload: 'khong-phai-status');

    expect(repo.byId(r.id)!.status, DocStatus.waiting,
        reason: 'payload không map được sang DocStatus thì bỏ qua, không ghi bừa');
  });
}
