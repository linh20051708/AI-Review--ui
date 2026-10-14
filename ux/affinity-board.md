# Affinity Board — Hệ thống quản lý học vụ & Review tài liệu

**Bước Lab 2:** Analyze · **Phase PRM393:** P2 (UX Design) · **Gate:** G2
**Trạng thái bằng chứng:** ASSUMED. Nhóm theo **hành vi/nỗi đau**, không theo tuổi/giới.

> **Lưu ý phương pháp:** Affinity Board chuẩn được làm bằng sticky note sau buổi brainwriting.
> Board này tái dựng từ **quan sát code nền + phân tích luồng** (chưa có workshop thật).
> Mọi ghi chú đều gắn mã bằng chứng `E-xx` để truy vết, và nhãn **ASSUMED**.


## 0. Mã định danh (tầng 1)

| Mã | Loại | Nội dung |
|---|---|---|
| `1-E-01` | Bằng chứng | Không biết bắt đầu từ đâu; phải mở từng lớp mới biết việc cần làm |
| `1-E-02` | Bằng chứng | Không phân biệt được tài liệu đang chờ AI hay chờ mình |
| `1-E-03` | Bằng chứng | Không nhớ lần trước đã phản hồi gì; sinh viên nộp lại chưa |
| `1-E-04` | Bằng chứng | Không rõ chuẩn nào đang áp tại thời điểm ra quyết định |
| `1-E-05` | Bằng chứng | Không rõ vì sao nút bị khoá |
| `1-E-06` | Bằng chứng | Muốn biết nhóm sắp quá hạn trước khi quá muộn |
| `1-IN-A` | Insight | Giảng viên cần *định vị việc gấp*, không cần xem hết |
| `1-IN-B` | Insight | Tài liệu thiếu *ngữ cảnh công đoạn* khiến phải hỏi lại |
| `1-IN-C` | Insight | Chuẩn áp dụng phải hiện *tại chỗ ra quyết định*, không ở trang cấu hình |
| `1-IN-D` | Insight | Vùng chạm nhỏ làm bấm sai một tay |
| `1-IN-E` | Insight | Trạng thái khoá/lỗi im lặng tạo *dead end* |

Mã cũ tương ứng: `E-01`…`E-06`, `INS-A`…`INS-E`.

---

## 1. Cách nhóm

Không nhóm theo: tuổi, giới tính, nghề.
Nhóm theo: **mục tiêu bị chặn**, **hành vi lặp lại**, **nỗi đau cùng nguyên nhân**.

---

## 2. Các cụm (cluster)

### Cụm A — "Định vị việc gấp" (động lực: không bỏ sót)

| Ghi chú | Nguồn | Nhãn |
|---|---|---|
| Mở app không biết bắt đầu từ đâu | `E-01` | ASSUMED |
| Phải mở từng lớp mới biết việc cần làm | `E-01` | ASSUMED |
| Không phân biệt được việc hôm nay và việc tuần sau | `E-01` | ASSUMED |
| Muốn biết nhóm nào sắp quá hạn trước khi quá muộn | `E-06` | ASSUMED |

→ **Insight A:** *Người dùng cần một hàng đợi việc-cần-làm đã sắp thứ tự, không phải một danh sách
màn hình để họ tự tổng hợp.* **Quyết định UI:** `DashboardPage` khối `attentionItems` là nội dung
chính của màn đầu; không để thẻ số liệu chiếm chỗ trước nó.

### Cụm B — "Không rõ đang ở đâu" (động lực: kiểm soát)

| Ghi chú | Nguồn | Nhãn |
|---|---|---|
| Tài liệu đang chờ AI hay chờ mình? | `E-02` | ASSUMED |
| Sinh viên đã nộp lại chưa? | `E-03` | ASSUMED |
| Không biết lần trước mình đã nói gì | `E-03` | ASSUMED |
| Không rõ vì sao nút bị khoá | `E-05` | ASSUMED |

→ **Insight B:** *Ba câu hỏi trạng thái khác nhau bị trộn vào một nhãn duy nhất.* **Quyết định UI:**
hiển thị **3 track tách bạch** (`documentStatus` / `aiStatus` / `supervisorStatus`) ở màn `S04`.

### Cụm C — "Chuẩn bị không nhất quán" (động lực: công bằng)

| Ghi chú | Nguồn | Nhãn |
|---|---|---|
| Quên chuẩn review của môn | `E-04` | ASSUMED |
| Sợ nhận xét khác nhau giữa các nhóm | `E-04` | ASSUMED |
| Deadline mỗi lớp mỗi khác, khó nhớ | `E-06` | ASSUMED |

→ **Insight C:** *Người dùng cần thấy chuẩn đang áp ngay tại chỗ ra quyết định.* **Quyết định UI:**
màn `S04` hiện rule set + deadline đã resolve kèm **nguồn gốc** (Offering / Class / Project).

### Cụm D — "Thao tác trên điện thoại khó" (động lực: nhanh)

| Ghi chú | Nguồn | Nhãn |
|---|---|---|
| Một tay cầm máy, hay bấm sai | `MEASUREMENTS` §3 | **Observed** (đo thật) |
| Nút nhỏ 17–28px rải khắp app | `MEASUREMENTS` §3 | **Observed** (đo thật) |
| Ô tìm kiếm bấm vào viền không focus | `critique` #3 | **Observed** (đo thật) |

→ **Insight D:** *Đây là cụm duy nhất có bằng chứng đo được, không phải giả định.* **Quyết định UI:**
nâng toàn bộ vùng chạm lên 48dp, input `h-full` khớp khung.

### Cụm E — "Bị chặn mà không hiểu vì sao" (động lực: hoàn thành tác vụ)

| Ghi chú | Nguồn | Nhãn |
|---|---|---|
| Không gửi được mà không biết lý do | `E-05` | ASSUMED |
| Lỗi mạng thì mất hết dữ liệu đang xem | Luồng 3 | ASSUMED |
| Trạng thái rỗng không gợi ý bước tiếp | `critique` #8 | ASSUMED |

→ **Insight E:** *Mọi chỗ chặn phải nói lý do + có ≥2 đường phục hồi.* **Quyết định UI:** luật toàn hệ
thống ở `ux/user-flow.md` §6.

---

## 3. Từ cụm → phân khúc persona

| Cụm | P01 Supervisor | P02 Sinh viên | Vai khác |
|---|---|---|---|
| A Định vị việc gấp | **Trọng tâm** | Phụ | Giáo vụ |
| B Không rõ ở đâu | **Trọng tâm** | Phụ | — |
| C Chuẩn nhất quán | **Trọng tâm** | — | Giáo vụ |
| D Thao tác khó | Chung | Chung | Chung |
| E Bị chặn | Chung | **Trọng tâm** | — |

**Kết luận phân khúc:** A, B, C phân biệt P01; E phân biệt P02; D dùng chung.
⇒ **2 persona là đủ** cho phạm vi Lab 2, khớp Chuẩn chung C5 (Lab 2 tối thiểu 1 Primary;
2 persona vì có khác biệt hành vi thật).

---

## 4. Giả định còn treo

| # | Giả định | Cần kiểm bằng |
|---|---|---|
| AS-01 | Giảng viên thao tác nhiều trên điện thoại chứ không phải máy tính | Phỏng vấn Q5 (thiết bị) |
| AS-02 | Nỗi đau lớn nhất là định vị việc gấp (không phải đọc tài liệu) | Phỏng vấn Q3 (đoạn mất thời gian) |
| AS-03 | Giảng viên quan tâm tính nhất quán phản hồi giữa nhóm | Phỏng vấn Q6 |

Chi tiết ở `ux/assumption-backlog.md` và `ux/research-plan.md`.