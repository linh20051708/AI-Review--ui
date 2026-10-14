import 'package:flutter/foundation.dart';

import '../../101_domain_entities/101_DOMAIN_review_entities.dart';
import '../../111_domain_usecases/111_DOMAIN_us03_filter_requests_uc.dart';
import '../../201_data_sources/201_DOMAIN_mock_datasource.dart';

/// Trạng thái kết nối do tầng dữ liệu theo dõi.
enum NetState { online, offline }

/// Hàng đợi một thao tác ghi chờ mạng trở lại.
@immutable
class PendingWrite {
  const PendingWrite({required this.id, required this.label, required this.payload});

  final String id;
  final String label;
  final String payload;
}

/// Repository — chuẩn hoá dữ liệu từ tầng 201 và xử lý phục hồi khi mất mạng.
///
/// Đây là tầng duy nhất mà giao diện (011) được phép gọi để lấy dữ liệu.
/// Giải đúng pain point của `US11`: mất mạng thì vẫn đọc được bản cache, thao tác
/// ghi vào hàng đợi và tự gửi lại khi có mạng — không mất dữ liệu, không treo app.
class ReviewRepository extends ChangeNotifier {
  ReviewRepository._();

  static final ReviewRepository instance = ReviewRepository._();

  NetState _net = NetState.online;
  final List<PendingWrite> _queue = <PendingWrite>[];

  /// Bản cache trong bộ nhớ, nạp một lần từ tầng 201.
  List<ReviewRequest>? _cache;

  NetState get net => _net;
  bool get isOffline => _net == NetState.offline;
  List<PendingWrite> get queue => List.unmodifiable(_queue);
  int get pendingCount => _queue.length;

  /// Mô phỏng mất / có mạng. Khi có mạng trở lại, tự đẩy hàng đợi đi.
  void setNet(NetState next) {
    if (next == _net) return;
    _net = next;
    if (_net == NetState.online) {
      _flushQueue();
    }
    notifyListeners();
  }

  void _flushQueue() {
    // Không có backend thật, nhưng quyết định đã xếp hàng phải được ÁP DỤNG khi
    // có mạng lại — nếu chỉ xoá hàng đợi thì người dùng mất quyết định của mình.
    for (final w in _queue) {
      debugPrint('[202] da gui lai: ${w.label} (${w.id})');
      _apply(w);
    }
    _queue.clear();
    notifyListeners();
  }

  /// Đọc danh sách yêu cầu review.
  ///
  /// Nếu đang offline và chưa có cache thì trả rỗng (giao diện hiện trạng thái rỗng),
  /// KHÔNG bịa dữ liệu.
  List<ReviewRequest> requests() {
    // `List.of(...)`: phải SAO CHÉP, không được alias thẳng list của `DemoData`.
    // Ghi quyết định vào bản sao thì `DemoData` gốc vẫn nguyên — nếu alias thì
    // mọi test trong cùng tiến trình sẽ dính trạng thái của test chạy trước.
    _cache ??= List<ReviewRequest>.of(DemoData.reviewRequests);
    return _cache!;
  }

  /// Lọc theo từ khoá và trạng thái — uỷ quyền cho use case tầng 111.
  List<ReviewRequest> filtered({String keyword = '', List<DocStatus> statuses = const []}) {
    return FilterRequestsUseCase.run(
      source: requests(),
      keyword: keyword,
      statuses: statuses,
    );
  }

  ReviewRequest? byId(String id) {
    for (final r in requests()) {
      if (r.id == id) return r;
    }
    return null;
  }

  List<AttentionItem> attention() => DemoData.attentionItems;
  List<AiFinding> findings() => DemoData.aiFindings;
  List<AiCheck> checks() => DemoData.aiChecks;
  List<({String version, String fileName, String at, String status})> versions() =>
      DemoData.versionLog;

  /// US08 (`1-UC-09`) — hai phiên bản gần nhất để so sánh.
  List<DocVersion> docVersions() => DemoData.docVersions;

  /// US12 (`1-UC-13`) — sức khoẻ các nhóm, nhóm quá hạn lên trước.
  List<GroupHealth> groupHealth() {
    final list = [...DemoData.groupHealth];
    list.sort((a, b) => b.overdue.compareTo(a.overdue));
    return list;
  }

  /// US12 — chỉ các nhóm đang có việc quá hạn.
  List<GroupHealth> overdueGroups() =>
      groupHealth().where((g) => g.overdue > 0).toList();

  /// US13 (`1-UC-14`) — chuẩn đang áp.
  List<ActiveRuleSet> ruleSets() => DemoData.activeRuleSets;

  /// US10 (`1-UC-11`) — lý do nút nộp bị khoá. Trả về danh sách rỗng nếu nộp được.
  ///
  /// Nút nộp bị khoá khi còn mục `blocking && !done`. Màn hình PHẢI hiện
  /// `reason` của từng mục, không được để nút mờ im lặng (PN-08, `4-TC-11`).
  List<SubmitChecklistItem> submitBlockers() =>
      DemoData.submitChecklist.where((i) => i.blocking && !i.done).toList();

  /// US10 — danh sách kiểm đầy đủ để hiển thị, gồm cả mục không chặn.
  List<SubmitChecklistItem> submitChecklist() => DemoData.submitChecklist;

  /// US10 — nộp được hay không.
  bool get canSubmit => submitBlockers().isEmpty;

  String get currentUserName => DemoData.currentUserName;
  String get currentUserInitials => DemoData.currentUserInitials;
  String get currentUserRole => DemoData.currentUserRole;
  String get currentUserEmail => DemoData.currentUserEmail;
  String get currentSemester => DemoData.currentSemester;

  /// Ghi một quyết định (phê duyệt / yêu cầu chỉnh sửa / nộp).
  ///
  /// Offline thì vào hàng đợi; online thì "gửi" ngay.
  /// Trả về `true` nếu đã gửi đi, `false` nếu đang xếp hàng chờ mạng.
  bool write({required String id, required String label, required String payload}) {
    final w = PendingWrite(id: id, label: label, payload: payload);
    if (isOffline) {
      _queue.add(w);
      notifyListeners();
      return false;
    }
    _apply(w);
    return true;
  }

  /// Áp dụng một quyết định đã "gửi": đổi `status` của tài liệu.
  ///
  /// LỖI THẬT ĐÃ SỬA (14/10, đợt 3): bản trước chỉ `debugPrint` rồi trả `true`.
  /// Giao diện US04/US06 hiện "Trạng thái đã cập nhật." nhưng `byId(id).status`
  /// KHÔNG đổi — bấm Phê duyệt xong quay lại danh sách vẫn thấy "Chờ giảng viên
  /// review". App báo sai cho người dùng. Xem `test/repository_write_test.dart`.
  ///
  /// `payload` không map được sang `DocStatus` thì BỎ QUA (không ghi bừa trạng
  /// thái) — dữ liệu lạ không được làm hỏng bản ghi.
  void _apply(PendingWrite w) {
    final next = DocStatus.values.where((s) => s.name == w.payload).firstOrNull;
    final list = requests();
    final at = list.indexWhere((r) => r.id == w.id);
    if (at < 0) {
      debugPrint('[202] bo qua: khong co tai lieu ${w.id}');
      return;
    }
    if (next == null) {
      debugPrint('[202] bo qua: payload "${w.payload}" khong phai trang thai');
      return;
    }
    if (list[at].status == next) return;
    list[at] = list[at].copyWith(status: next);
    debugPrint('[202] da gui: ${w.label} (${w.id}) -> ${next.name}');
    notifyListeners();
  }

  /// Chỉ dùng cho test: xoá cache và hàng đợi về trạng thái ban đầu.
  @visibleForTesting
  void resetForTest() {
    _cache = null;
    _queue.clear();
    _net = NetState.online;
  }
}
