# Bảng truy vết hợp nhất

**Tầng thông tin:** 4 (tra cứu) · **Gate:** C7 · **Trạng thái:** tra cứu toàn repo

**Mục đích:** một chỗ duy nhất để trả lời *"cái này từ đâu ra và dùng ở đâu"* cho mọi artifact của
Lab 2. Bảng này **không định nghĩa lại** gì — nó chỉ trỏ tới nơi định nghĩa (`rules/check-ids.py` chặn
việc định nghĩa lại ở tầng 4).

---

## 1. Chuỗi truy vết (Chuẩn chung C7)

```
E (bằng chứng) → IN (insight) → PS/PN (persona/need) → FL (luồng) → SC (màn hình) → TC (test)
     ↑ tầng 1 ────────────────────────────────────────────↓ tầng 3 ────↓ tầng 4
```

## 2. Bảng hợp nhất (dạng mã mới)

| Chuỗi | E (bằng chứng) | IN (insight) | PS (persona) | PN (need) | FL (luồng) | SC (màn hình) | TC (test) |
|---|---|---|---|---|---|---|---|
| `4-TC-03` | `1-E-01` | `1-IN-A` | `1-PS-01` | `1-PN-01` | `2-FL-01` | `3-SC-02` | 5-second test |
| `4-TC-05` | `1-E-02` | `1-IN-B` | `1-PS-01` | `1-PN-02` | `2-FL-01` | `3-SC-04` | journeys T02 |
| `4-TC-07` | `1-E-02` | `1-IN-B` | `1-PS-01` | `1-PN-03` | `2-FL-01` | `3-SC-04` | journeys T03 |
| `4-TC-10` | `1-E-02` | `1-IN-B` | `1-PS-01`, `1-PS-02` | `1-PN-04`, `1-PN-09` | `2-FL-01` | `3-SC-05` | journeys T04 |
| `4-TC-14` | `1-E-06` | `1-IN-A` | `1-PS-01` | `1-PN-05` | `2-FL-01` | `3-SC-11` | journeys T05 |
| `4-TC-15` | `1-E-04`, `1-E-06` | `1-IN-C` | `1-PS-01` | `1-PN-06` | `2-FL-01` | `3-SC-04` | journeys T06 |
| `4-TC-17` | đo thật (`facts/MEASUREMENTS.md` §3) | `1-IN-D` | cả hai | `1-PN-07` | — | toàn bộ | `accessibility_test.dart` |
| `4-TC-11` | `1-E-05` | `1-IN-E` | `1-PS-02` | `1-PN-08` | `2-FL-01`, `2-FL-03` | `3-SC-13` | journeys T08 |
| `4-TC-08` | `1-E-03` | `1-IN-B` | `1-PS-02` | `1-PN-10` | `2-FL-02` | `3-SC-06`, `3-SC-07` | journeys T09 |
| `4-TC-12` | `2-FL-03` | `1-IN-E` | cả hai | `1-PN-11` | `2-FL-03` | `3-SC-02`, `3-SC-03` | journeys T10 |
| `4-TC-18` | đo thật (`facts/MEASUREMENTS.md` §4) | — | cả hai | `1-PN-12` | — | toàn bộ | WCAG contrast |

**Ô `—` nghĩa là không có mắt xích đó** (ví dụ test tiếp cận không gắn với một luồng nghiệp vụ).
Ghi `—` chứ không bịa ra mã.

---

## 3. Đối chiếu dạng mã cũ ↔ dạng mới

Các mã đã có **trước** phiên này (trong `ux/persona-decisions.md`, `ux/user-flow.md`) vẫn được giữ
nguyên để không phá tham chiếu. Bảng dưới chỉ để tra:

| Dạng cũ (đang dùng) | Dạng mới (chuẩn) | Loại |
|---|---|---|
| `P01`, `P02` | `1-PS-01`, `1-PS-02` | Persona |
| `E-01`…`E-06` | `1-E-01`…`1-E-06` | Bằng chứng |
| `INS-A`…`INS-E` | `1-IN-A`…`1-IN-E` | Insight |
| `PN-01`…`PN-12` | `1-PN-01`…`1-PN-12` | Need |
| `F01`, `F02`, `F03` | `2-FL-01`, `2-FL-02`, `2-FL-03` | Flow |
| `S01`…`S23` | `3-SC-01`…`3-SC-23` | Screen |
| `TC-01`…`TC-11` | `4-TC-xx` (ánh xạ §2) | Test |
| `I01`–`I03` (vòng AI) | `4-AI-01`…`4-AI-03` | Vòng lặp AI |

**Lưu ý quan trọng:** `TC-01` (dạng cũ, trong `ux/persona-decisions.md`) **không** đồng nghĩa với
`4-TC-01` (dạng mới, trong `docs/test-cases.md`). Ví dụ: `TC-01` cũ = 5-second test màn Tổng quan;
`4-TC-01` mới = đăng nhập SSO. Ánh xạ đúng nằm ở cột `TC` của bảng §2.

---

## 4. Tra theo hướng ngược

### 4.1 Từ màn hình → ra mọi thứ liên quan

| Màn hình | File code (React) | File code (Flutter) | Test phủ |
|---|---|---|---|
| `3-SC-01` | `pages/auth/LoginPage.tsx` | `login_screen.dart` | `4-TC-01`, `4-TC-02` |
| `3-SC-02` | `pages/dashboard/DashboardPage.tsx` | `dashboard_screen.dart` | `4-TC-03`, `4-TC-12` |
| `3-SC-03` | `pages/reviews/ReviewListPage.tsx` | `review_list_screen.dart` | `4-TC-04`, `4-TC-20`, `4-TC-22` |
| `3-SC-04` | `pages/reviews/ReviewWorkspacePage.tsx` | `review_workspace_screen.dart` | `4-TC-05`…`4-TC-09` |
| `3-SC-05` | `pages/reviews/AiResultPage.tsx` | `ai_result_screen.dart` | `4-TC-10` |
| `3-SC-06`/`3-SC-07` | `VersionsPage.tsx` / `HistoryPage.tsx` | — (chưa port) | `4-TC-08` |
| `3-SC-11` | `pages/projects/ProjectsPage.tsx` | — (chưa port) | `4-TC-14` |
| `3-SC-13` | `ProjectDocumentsPage.tsx` | — (chưa port) | `4-TC-11` |
| `3-SC-23` | `pages/profile/ProfilePage.tsx` | `profile_screen.dart` | `4-TC-16` |

**Ô `—` trong cột Flutter:** app Flutter mới chỉ port **6 màn** (đăng nhập, tổng quan, danh sách review,
không gian review, kết quả AI, hồ sơ). Đây là **khoảng trống thật**, không phải đã xong.

### 4.2 Từ use case → ra test phủ

Xem `docs/test-cases.md` §2.1 — bảng đầy đủ 17 use case kèm trạng thái bao phủ.

### 4.3 Từ bằng chứng → ra insight → ra quyết định

Xem `ux/affinity-board.md` (E → IN) và `ux/persona-decisions.md` §1 (IN → PN → quyết định UI).

---

## 5. Kiểm tự động

```bash
python3 rules/check-ids.py       # mã mồ côi / sai tầng
python3 rules/check-trace.py     # mọi TC có nguồn UC+US thật; mọi UC có ≥1 HP trước
```

`check-trace.py` kiểm 3 thứ:
1. Mọi `4-TC-xx` trong `docs/test-cases.md` có cột nguồn trỏ về `1-US-xx`/`1-UC-xx` **có thật**.
2. Mọi `1-UC-xx` trong `ux/use-cases.md` có **≥1** test loại `HP` trỏ tới.
3. Không có `1-US-xx` mồ côi (không trỏ về use case nào).

---

## 6. Ghi chú trung thực

- Bảng này tổng hợp từ các tài liệu **tôi viết trong phiên này** (`ux/use-cases.md`,
  `ux/user-stories.md`, `docs/test-cases.md`) và tài liệu có trước (`ux/persona-decisions.md`,
  `ux/user-flow.md`, `facts/MEASUREMENTS.md`).
- Các mã `1-E-xx`, `1-IN-xx`, `1-PN-xx` trỏ tới nơi định nghĩa **có thật**; nếu ô nào trỏ tới mã
  không tồn tại, `check-ids.py` sẽ báo.
- Ánh xạ code Flutter chỉ liệt kê **6 màn đã port thật**. Không có màn nào được ghi là "đã port" khi
  file không tồn tại.
