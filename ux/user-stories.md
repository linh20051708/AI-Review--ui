# User story — Hệ thống quản lý học vụ & Review tài liệu

**Tầng thông tin:** 1 (nghiệp vụ) · **Mã:** `1-US-xx` · **Gate:** A · **Trạng thái:** ASSUMED (chờ lớp xác nhận)

Mỗi user story nối **1 use case thật** (`ux/use-cases.md`) với **1 persona thật** (`ux/persona.md`) và
**≥1 test case** (`docs/test-cases.md`). Story không trỏ về use case có thật là **story mồ côi** —
`rules/check-ids.py` báo lỗi.

**Định dạng:** thẻ 3C (Card / Conversation / Acceptance criteria), tiêu chí nghiệm thu viết dạng
Given-When-Then để máy kiểm được.

---

## 1. Bảng user story

| Mã | User story (Card) | Persona | Use case | Ưu tiên | Test case |
|---|---|---|---|---|---|
| `1-US-01` | Là **giảng viên**, tôi muốn đăng nhập bằng SSO trường để không phải nhớ thêm mật khẩu | `1-PS-01` | `1-UC-01` | Cao | `4-TC-01`, `4-TC-02` |
| `1-US-02` | Là **giảng viên**, tôi muốn thấy ngay việc gấp trong hôm nay để không bỏ sót deadline | `1-PS-01` | `1-UC-02` | Cao | `4-TC-03` |
| `1-US-03` | Là **giảng viên**, tôi muốn danh sách yêu cầu review lọc được theo trạng thái để tập trung vào việc đang chờ | `1-PS-01` | `1-UC-03`, `1-UC-04` | Cao | `4-TC-04` |
| `1-US-04` | Là **giảng viên**, tôi muốn mở một tài liệu và thấy đủ thông tin để quyết định trong một màn | `1-PS-01` | `1-UC-05` | Cao | `4-TC-05`, `4-TC-06` |
| `1-US-05` | Là **giảng viên**, tôi muốn hiểu vì sao AI báo lỗi để không tin mù kết quả máy | `1-PS-01` | `1-UC-06` | Cao | `4-TC-10` |
| `1-US-06` | Là **giảng viên**, tôi muốn phê duyệt tài liệu với ít bấm nhất nhưng vẫn có xác nhận | `1-PS-01` | `1-UC-07` | Cao | `4-TC-07`, `4-TC-08` |
| `1-US-07` | Là **giảng viên**, tôi muốn yêu cầu chỉnh sửa và huỷ được nếu bấm nhầm | `1-PS-01` | `1-UC-08` | Cao | `4-TC-09` |
| `1-US-08` | Là **giảng viên**, tôi muốn so sánh hai phiên bản trước khi quyết định | `1-PS-01` | `1-UC-09` | Trung bình | `4-TC-10` |
| `1-US-09` | Là **sinh viên**, tôi muốn nộp tài liệu cho nhóm và biết đã nộp chưa | `1-PS-02` | `1-UC-10` | Cao | `4-TC-13` |
| `1-US-10` | Là **sinh viên**, tôi muốn biết vì sao nút nộp bị khoá để xử lý đúng việc còn thiếu | `1-PS-02` | `1-UC-11` | Cao | `4-TC-11` |
| `1-US-11` | Là **người dùng**, tôi muốn không bị kẹt khi mất mạng để vẫn hoàn thành được việc | Cả hai | `1-UC-12` | Cao | `4-TC-12` |
| `1-US-12` | Là **giảng viên**, tôi muốn thấy sức khoẻ nhóm để phát hiện nhóm quá hạn mà không phải mở từng nhóm | `1-PS-01` | `1-UC-13` | Trung bình | `4-TC-14` |
| `1-US-13` | Là **giảng viên**, tôi muốn biết chuẩn nào đang áp ngay tại chỗ ra quyết định | `1-PS-01` | `1-UC-14` | Trung bình | `4-TC-15` |
| `1-US-14` | Là **người dùng**, tôi muốn xem hồ sơ và đăng xuất an toàn | Cả hai | `1-UC-15` | Thấp | `4-TC-16` |

**Tổng: 14 user story**, tất cả trỏ về use case có thật.

---

## 2. Conversation + Acceptance criteria cho story trọng yếu

Chỉ viết đầy đủ cho 4 story cốt lõi. Các story khác ở mức bảng §1.

### `1-US-04` — Mở tài liệu, thấy đủ thông tin để quyết định

**Conversation:** giảng viên không muốn mở 3 tab để đọc một tài liệu. Mọi thứ cần để quyết định
phải nằm trên **một** màn: tài liệu, trạng thái đang ở công đoạn nào, AI đã nói gì, và hai nút quyết định.

```gherkin
Scenario: Xem không gian review có đủ thông tin quyết định
  Given giảng viên đã đăng nhập và đang ở màn Yêu cầu review
  When  giảng viên bấm vào thẻ tài liệu đầu tiên
  Then  màn Không gian review hiện ra
  And   có đúng 3 track trạng thái
  And   có khối tóm tắt kết quả AI
  And   có nút "Phê duyệt" và nút "Cần chỉnh sửa" ngay trên màn, không nằm trong menu

Scenario: Tài liệu có nhiều phiên bản
  Given tài liệu đang mở có từ 2 phiên bản trở lên
  When  giảng viên chọn "So sánh phiên bản"
  Then  mở màn so sánh phiên bản (1-UC-09)
```

**Nghiệm thu tự động:** `4-TC-05`, `4-TC-06`.

### `1-US-06` — Phê duyệt với ít bấm nhất nhưng có xác nhận

**Conversation:** giảng viên review rất nhiều tài liệu, nên đổi trạng thái phải nhanh. Nhưng phê duyệt
là việc khó lùi, nên vẫn phải có một bước xác nhận, và huỷ được.

```gherkin
Scenario: Phê duyệt thành công
  Given giảng viên đang ở màn Không gian review, tài liệu chưa ở trạng thái cuối
  When  giảng viên bấm "Phê duyệt"
  Then  hộp thoại xác nhận "Phê duyệt tài liệu?" hiện ra
  And   giảng viên bấm xác nhận
  Then  trạng thái đổi sang "Đã phê duyệt"
  And   có toast xác nhận
  And   tổng số lần bấm không quá 3

Scenario: Huỷ giữa chừng
  Given hộp thoại xác nhận đang mở
  When  giảng viên bấm "Huỷ"
  Then  hộp thoại đóng
  And   trạng thái tài liệu KHÔNG đổi
  And   KHÔNG có toast nào phát sinh
```

**Nghiệm thu tự động:** `4-TC-07`, `4-TC-08`.

### `1-US-10` — Biết vì sao nút nộp bị khoá

**Conversation:** sinh viên thấy nút mờ thường đoán sai lý do và đi hỏi giảng viên. Lý do phải hiện ngay.

```gherkin
Scenario: Nút nộp bị khoá có lý do
  Given tài liệu phụ thuộc chưa được duyệt
  When  sinh viên mở màn Tài liệu của project
  Then  nút nộp ở trạng thái khoá
  And   lý do khoá hiện ngay cạnh nút (không phải chú thích rời hay tooltip phải di chuột mới thấy)
```

**Nghiệm thu tự động:** `4-TC-11`.

### `1-US-11` — Không bị kẹt khi mất mạng

**Conversation:** mạng trường hay chập. Khi lỗi, người dùng phải luôn có ít nhất hai cách thoát.

```gherkin
Scenario: Mất mạng có nhiều đường phục hồi
  Given người dùng đang ở màn Tổng quan hoặc Yêu cầu review
  When  mạng bị ngắt
  Then  hiện banner offline
  And   có ít nhất 2 đường phục hồi ("Thử lại" và "Xem bản lưu")
  And   chọn một đường thì thoát được trạng thái lỗi
```

**Nghiệm thu tự động:** `4-TC-12`.

---

## 3. Ghi chú trung thực

- User story ở đây **suy ra từ code thật và persona đã viết**, không phải từ phỏng vấn với người dùng
  thật. Nhãn: `Assumed`. Đây là hạn chế đã biết của Lab 2 (không có người dùng thật để phỏng vấn).
- 14 story phủ 14/17 use case. Ba use case chưa có story (`1-UC-16`, `1-UC-17`, và phần actor
  `1-SH-03`) — khoảng trống đã ghi, không giả vờ đã xong.
- Nghiệm thu ở đây chạy được bằng `docs/test-cases.md`; không có story nào chỉ nằm trên giấy.
