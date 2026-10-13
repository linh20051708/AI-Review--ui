# Persona — Hệ thống quản lý học vụ & Review tài liệu

**Bước Lab 2:** Analyze · **Phase PRM393:** P0–P2 (Idea → UX Research → UX Design)
**Loại Persona:** Proto-Persona · **Trạng thái bằng chứng:** ASSUMED

> **Nhãn bằng chứng (Chuẩn chung C2):** toàn bộ persona dưới đây là **Assumed** — xây dựng
> từ **đọc code nền thật** (`app/src/data/mockData.ts`, `app/src/types/index.ts`,
> `app/src/app/router.tsx`) chứ **chưa phỏng vấn hay quan sát người dùng thật**. Vì vậy đây là
> **Proto-Persona**, không phải Qualitative Persona. Mọi con số nhân khẩu (tuổi, số lớp, tần suất)
> là giả định minh họa; mọi **hành vi và nỗi đau đều truy được về một thành phần có thật trong code**
> (cột "Bằng chứng" ghi rõ `file:dòng`).
>
> **Cần kiểm chứng trước khi dùng cho quyết định thiết kế:** tần suất thao tác thật, thiết bị thật,
> và mức độ đau của từng nỗi đau. Kế hoạch kiểm chứng ở `ux/research-plan.md`.

---

## 0. Problem statement & Scope

### Problem statement (một câu)

> **Giảng viên phụ trách 4 lớp (~30 nhóm) nhận 20–35 yêu cầu review mỗi tuần nhưng chỉ có
> điện thoại khi di chuyển giữa các lớp, nên không biết ngay hôm nay phải xử lý tài liệu nào
> và tài liệu nào đang tắc ở công đoạn nào — dẫn tới nhóm bị trễ hạn vì phản hồi chậm.**

*Bối cảnh:* phạm vi Lab 2 là **một vai duy nhất** (giảng viên/supervisor) trên **mobile 360–412dp**.
Nguồn: `app/src/data/mockData.ts` (`currentUser = "Nguyễn Văn An", "Giảng viên / Supervisor"`).

### Scope

| Trong phạm vi | Ngoài phạm vi |
|---|---|
| Vai Supervisor: xem việc cần làm, đọc tài liệu, phê duyệt / yêu cầu sửa | Vai quản trị cấu hình học vụ (semester, rule set) — có route nhưng không thiết kế sâu |
| 8 màn hình lõi (`S01–S05`, `S09`, `S11`, `S13`) | Ứng dụng desktop/tablet là mục tiêu chính |
| Trạng thái loading / empty / error / success | Đa ngôn ngữ, chế độ tối |

---

## 1. P01 · Primary — Giảng viên phụ trách đồ án

### Nhóm hành vi (archetype)

**"Giảng viên review nhanh trên điện thoại, đọc lướt để ra quyết định"** — không ngồi bàn,
mở app trong 5 phút giữa hai tiết, cần biết ngay việc gì gấp.

| # | Trường (12 trường lõi) | Nội dung |
|---|---|---|
| 01 | **Identity & Archetype** | Nguyễn Văn An · "giảng viên review nhanh trên điện thoại" |
| 02 | **Persona Priority** | **Primary** — quyết định layout và luồng chính của toàn bộ 8 màn hình lõi |
| 03 | **Usage Context** | Di chuyển giữa các lớp, mở app 2–4 lần/ngày, mỗi lần 3–7 phút. Một tay cầm điện thoại vì tay kia cầm tài liệu/ly nước; **sự chú ý bị phân tán** — vừa đi vừa nghe sinh viên hỏi. Nhiều lúc đứng ở hành lang, nắng chiếu màn hình. |
| 04 | **Goals** (Mục tiêu) | (1) Biết ngay hôm nay phải review gì mà không mở từng lớp. (2) Duyệt đúng hạn SLA để nhóm kịp tiến độ. (3) Phát hiện nhóm chậm **trước khi** quá hạn. |
| 05 | **Job to Be Done** | *Khi có ít thời gian giữa các tiết và đang cầm điện thoại, tôi muốn thấy ngay danh sách tài liệu cần xử lý kèm trạng thái của từng tài liệu, để ra quyết định phê duyệt hoặc yêu cầu sửa mà không phải mở từng lớp.* |
| 06 | **Current Behaviors** | Hiện tại: mở email/lịch để tìm bài nộp; mở từng lớp trong hệ thống cũ; ghi chú phản hồi ra giấy rồi gõ lại khi về bàn; tự nhớ hạn SLA trong đầu. Tần suất: gần như mỗi ngày có lớp. Workaround: dùng ảnh chụp màn hình để so sánh giữa các nhóm. |
| 07 | **Pain Points** | (1) Phải mở nhiều lớp mới biết việc cần làm → mất 3–5 phút đầu chỉ để định vị. (2) Không rõ tài liệu đang ở công đoạn nào (chờ AI? chờ mình? đã gửi lại?). (3) Nhóm nộp lại mà không rõ đã sửa gì so với lần trước. |
| 08 | **Motivations** | Muốn **nhanh** và **chính xác**; quan trọng là không bỏ sót nhóm nào; muốn phản hồi **nhất quán** giữa các nhóm để không bị thắc mắc. |
| 09 | **Constraints** | Thiết bị: iPhone 14, dùng một tay. Kết nối: 4G chập chờn ở hành lang/khu giảng đường. Thời gian: 3–7 phút mỗi lần. Quyền hạn: là người duyệt cuối (Supervisor). Năng lực số: tốt nhưng không muốn gõ nhiều trên điện thoại. |
| 10 | **Key Scenarios** | **S1 (tác nhân kích hoạt: có thông báo nhóm nộp bài):** mở app lúc đang đi giữa hai tiết → mục tiêu là biết có gì gấp → kết quả: biết ngay 2 nhóm sắp đến hạn. **S2 (tác nhân: rảnh 5 phút cuối giờ):** mở một tài liệu cụ thể → mục tiêu là ra quyết định → kết quả: phê duyệt hoặc để lại phản hồi. |
| 11 | **Success Criteria** | Thấy việc cần làm trong **5 giây đầu** (30%) · biết tài liệu ở công đoạn nào (25%) · duyệt/yêu cầu sửa ≤ **3 lần bấm** (20%) · hiểu vì sao AI báo lỗi (15%) · không bỏ sót nhóm quá hạn (10%). |
| 12 | **Evidence & Status** | **ASSUMED.** Hành vi kiểm chứng được qua code: `DashboardPage` (khối `attentionItems`), `types/index.ts` (3 track `documentStatus`/`aiStatus`/`supervisorStatus`), `lib/config.ts` (kế thừa Offering→Class→Project), `RuleSet` (SLA ngày), `LabItem.dependsOn` (`submissionLocked`). Chưa có `E01` (phỏng vấn thật). |

### Nỗi đau ↔ thành phần có thật trong code

| Mã | Nỗi đau | Bằng chứng trong code |
|---|---|---|
| E-01 | Phải mở nhiều lớp mới biết việc cần làm | `DashboardPage` có khối `attentionItems` gom việc gấp |
| E-02 | Không rõ tài liệu đang ở công đoạn nào | `types/index.ts` tách **3 track**: `documentStatus` · `aiStatus` · `supervisorStatus` |
| E-03 | Sinh viên nộp lại mà không rõ sửa gì | `DocumentVersion` bất biến + `ReviewFeedback` có `severity` |
| E-04 | Quên mất chuẩn review của môn | `RuleSet` (AI auto/manual, SLA ngày, định dạng, số lần nộp lại) |
| E-05 | Nhóm nộp bài mà mục trước chưa duyệt | `LabItem.dependsOn` → `submissionLocked` |
| E-06 | Deadline khác nhau ở từng tầng | Cấu hình kế thừa 3 tầng: Offering → Class → Project (`lib/config.ts`) |

---

## 2. P02 · Secondary — Sinh viên trưởng nhóm

**Vì sao là persona riêng (không gộp với P01):** khác **hướng công việc** — P01 *duyệt* tài liệu,
P02 *nộp* tài liệu; khác **nỗi đau trọng tâm** — P01 lo bỏ sót, P02 lo không biết vì sao không nộp được.
Khác biệt này kéo theo quyết định UI khác nhau (P01 cần hàng đợi + quyết định nhanh;
P02 cần thấy ràng buộc phụ thuộc và vị trí lỗi).

| # | Trường | Nội dung |
|---|---|---|
| 01 | Identity & Archetype | Trần Thị Bình · "trưởng nhóm nộp bài đúng hạn" |
| 02 | Persona Priority | **Secondary** |
| 03 | Usage Context | Dùng buổi tối ở nhà, máy Android, đôi khi mạng yếu |
| 04 | Goals | Biết bài còn thiếu gì; hiểu lỗi AI để sửa đúng chỗ; biết mục nào phải duyệt trước |
| 05 | Job to Be Done | *Khi gần đến hạn nộp, tôi muốn biết chính xác bài còn thiếu gì và vì sao bị chặn, để sửa và nộp được đúng hạn.* |
| 06 | Current Behaviors | Nộp qua email/link; tự đối chiếu checklist bằng tay |
| 07 | Pain Points | Không biết vì sao không gửi được; AI báo lỗi nhưng không nói ở trang nào; nộp lại mà không rõ đã sửa hết chưa |
| 08 | Motivations | Không bị trừ điểm trễ hạn; không làm lại nhiều lần |
| 09 | Constraints | Samsung Galaxy A54; mạng tối có thể yếu; không rành cấu hình hệ thống |
| 10 | Key Scenarios | **S3 (tác nhân: còn 1 ngày đến hạn):** mở màn tài liệu của project → mục tiêu: biết còn thiếu gì → kết quả: nộp được đúng mục chưa duyệt |
| 11 | Success Criteria | Gửi được yêu cầu review trong ≤ 2 lần thử; biết vị trí lỗi AI (số trang) |
| 12 | Evidence & Status | **ASSUMED.** Code: `submissionLocked` khi `dependsOn` chưa duyệt; `AIFinding.pageRef` (vd "tr.12"); `DocumentVersion` + đếm `feedbackCount` |

---

## 3. Ánh xạ nguyên tắc Nielsen

Mỗi nguyên tắc gắn với một thành phần **có thật** trong code nền.

| # | Nguyên tắc | Thành phần trong hệ thống |
|---|---|---|
| 1 | Hiển thị trạng thái hệ thống | `StatusBadge`, 3 track, skeleton khi tải (`ReviewListSkeleton`) |
| 2 | Khớp với thế giới thực | Từ vựng tiếng Việt: "Chờ review", "Cần chỉnh sửa", "Đã phê duyệt" (`statusMeta`) |
| 3 | Người dùng kiểm soát | Nút Back ở mọi màn, `BackLink`, hủy được trong `DecisionModals` |
| 4 | Nhất quán | Một từ vựng `Status` dùng chung cho mọi màn |
| 5 | Ngăn lỗi | `ConfirmModal` trước khi phê duyệt; chặn gửi khi `submissionLocked` |
| 6 | Nhận ra thay vì nhớ | Chip lọc hiện sẵn (`SmartFilterBar`), không bắt gõ lệnh |
| 7 | Dùng linh hoạt | Lọc + sắp xếp 5 kiểu (`SORTS` trong `ReviewRequestsPage`) |
| 8 | Thẩm mỹ tối giản | Mỗi màn theo một mục tiêu (`PageHeading` + một danh sách chính) |
| 9 | Giúp nhận ra & sửa lỗi | `AIFinding` có `level`, `category`, `pageRef`; nút Thử lại / Xem bản lưu |
| 10 | Trợ giúp | `EmptyState` có hành động gợi ý; nhãn tiếng Việt rõ nghĩa |

---

## 4. Yêu cầu khả năng tiếp cận

Áp cho cả hai persona:

| Yêu cầu | Ngưỡng | Cách kiểm |
|---|---|---|
| Kích thước vùng bấm | ≥ 48×48 dp | Đo bằng `getBoundingClientRect` |
| Tương phản chữ | ≥ 4.5:1 (chữ lớn/điều khiển ≥ 3:1) | Công thức WCAG 2.2 AA |
| Cỡ chữ thân | ≥ 14 sp | Bảng kiểu chữ |
| Bề rộng màn hình | 360dp và 412dp | Render 2 viewport |
| Chữ lớn (tiêu đề) | ≥ 3:1 | Công thức WCAG |

> **Ngưỡng lấy từ Chuẩn chung C4** (PRM393 UI/UX Material): tương phản 4.5:1 / 3:1,
> vùng chạm ≥ 48×48 dp, chữ nội dung ≥ 14 sp — theo WCAG 2.2 AA và Material 3.
>
> **Phát hiện thật:** app nền **đạt** ngưỡng tương phản chữ nhưng **không đạt** ngưỡng 48dp ở nhiều chỗ
> (link phụ cao 17–26px, chip lọc 28–40px). Chi tiết và số đo ở `facts/MEASUREMENTS.md` §3.

---

## 5. Tài liệu liên quan

| File | Nội dung |
|---|---|
| `ux/stakeholder-map.md` | Stakeholder / User Map |
| `ux/affinity-board.md` | Affinity Board (pattern theo nỗi đau) |
| `ux/persona-coverage-matrix.md` | Ma trận archetype × tác vụ × rào cản |
| `ux/persona-decisions.md` | Ma trận Persona → Need → UI decision → Test |
| `ux/assumption-backlog.md` | Giả định cần kiểm chứng |
| `ux/research-plan.md` | Kế hoạch phỏng vấn/quan sát |
