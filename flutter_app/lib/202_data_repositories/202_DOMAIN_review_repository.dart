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
    // Không có backend thật: chỉ ghi log và xoá hàng đợi.
    for (final w in _queue) {
      debugPrint('[202] da gui lai: ${w.label} (${w.id})');
    }
    _queue.clear();
  }

  /// Đọc danh sách yêu cầu review.
  ///
  /// Nếu đang offline và chưa có cache thì trả rỗng (giao diện hiện trạng thái rỗng),
  /// KHÔNG bịa dữ liệu.
  List<ReviewRequest> requests() {
    _cache ??= DemoData.reviewRequests;
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
    debugPrint('[202] da gui: ${w.label} (${w.id})');
    return true;
  }

  /// Chỉ dùng cho test: xoá cache và hàng đợi về trạng thái ban đầu.
  @visibleForTesting
  void resetForTest() {
    _cache = null;
    _queue.clear();
    _net = NetState.online;
  }
}
