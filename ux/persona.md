> **Bản hiện hành — đối chiếu source ngày 16/10/2026.** Nguồn nghiệp vụ và route: `src/` tại merge HEAD `8258f69` + local `46a509d`. Phần A là tài liệu hiện hành đã chuẩn hóa. Phần B là bản lưu GitHub lịch sử, chỉ dùng truy vết và hướng dẫn Lab 2; không xác nhận trạng thái sản phẩm, nghiên cứu hay kết quả kiểm thử hiện tại.

## Đối chiếu source và thông tin chưa thống nhất

Hai vai trò Supervisor/Student đã có layout, navigation và pages trong `src/`. Các tên/tuổi/thiết bị/tần suất và mục tiêu nghiên cứu vẫn là giả định; code demo không chứng minh hành vi người dùng thật. GitHub mô tả Student Trần Thị Bình, 21 tuổi; local dùng Trần Minh Anh, 20–23 tuổi. Supervisor là Primary Persona, Student là Secondary Persona. Phần A dùng proto-persona local hiện hành; hồ sơ GitHub chỉ là bản lịch sử. Chưa có persona nghiên cứu chính thức đã xác thực.

**Không nhầm mã:** P01 Supervisor / P02 Student của tài liệu persona là mã persona. Persona Checklist P01–P10 trong `src/lib/rubric.ts` là mã tiêu chí đánh giá, không phải mười người dùng. Checklist thực tế gồm:

1. P01: Phạm vi sản phẩm, tác vụ trọng tâm và nhóm người dùng.
2. P02: User/Stakeholder Map, người dùng dễ bị bỏ sót.
3. P03: Số Persona phù hợp phạm vi, lý giải nếu chỉ có một.
4. P04: Phân biệt bằng goals, behaviors, contexts hoặc constraints.
5. P05: Đủ 12 trường cốt lõi.
6. P06: Nhu cầu theo kết quả mong muốn.
7. P07: Bằng chứng nghiên cứu hoặc nhãn giả định chưa kiểm chứng.
8. P08: Affinity Board hoặc tổng hợp pattern hình thành phân khúc.
9. P09: Primary Persona có scenario và success criteria.
10. P10: Quyết định/giả thuyết UI và phương pháp kiểm chứng liên kết Persona.

Template `Persona Evaluation — 100 Points` chấm binary 10/0 ở demo; ngưỡng đạt 80, cần cải thiện 70. Đây là rubric đề xuất của giảng viên; khoảng 70–79 là quy ước triển khai bổ sung, không phải tiêu chuẩn chính thức NN/g. AI findings/điểm là mô phỏng cần xác minh.

Mục tiêu thiết kế hiện hành giữ theo local: 48dp/14sp; ngưỡng GitHub 44px/13px chỉ là tham chiếu lịch sử, không phải chuẩn nghiệm thu thứ hai. Số đo `facts/MEASUREMENTS.md` thuộc bản nền, chưa chứng nhận source hiện tại. Chưa xác nhận đạt bất kỳ ngưỡng nào cho UI hiện tại.

---

# Phần A — Tài liệu hiện hành

# PROJECT REVIEW AI — USER PERSONAS

**Môn học:** PRM323 — Lab 2: Thiết kế UI/UX có hỗ trợ AI
**Sản phẩm:** Project Review AI — Hệ thống quản lý Project và Review tài liệu sinh viên có hỗ trợ AI
**Phiên bản:** 1.0 — 15/10/2026
**Trạng thái nghiên cứu:** **Proto-persona (giả định thiết kế, chưa xác thực bằng phỏng vấn/quan sát)**
**Phạm vi:** Mobile-first, hai vai trò Supervisor và Student; tập trung vào học vụ, review và nộp lại tài liệu.

> **Lưu ý bằng chứng:** Tên, tuổi, tần suất, thói quen, khó khăn và các chỉ tiêu dưới đây là **giả định/kịch bản đề xuất** để phục vụ phân tích UI/UX. Chưa có dữ liệu phỏng vấn, usability test hoặc số liệu sử dụng thực tế được cung cấp. Không trình bày các nội dung này là findings đã được kiểm chứng. Các chức năng mô tả là định hướng thiết kế, không mặc nhiên khẳng định code hiện tại đã hoàn thiện.

---

## 1. Problem Statement & Design Scope

### Bối cảnh

Hệ thống hướng tới quản lý chuỗi học vụ **Học kỳ → Môn học → Course Offering → Lớp → Sinh viên → Nhóm → Project → Lab → Tài liệu → AI Review → Supervisor Review → Revision/Approval**. Mỗi tài liệu có thể có nhiều phiên bản; AI cung cấp findings hỗ trợ, còn Supervisor đưa ra quyết định chính thức.

### Vấn đề cần giải quyết

Trong bối cảnh nhiều lớp, nhóm và tài liệu cùng được xử lý, người hướng dẫn cần nắm rõ tài liệu nào đang chờ review, ngữ cảnh của từng phiên bản và các quyết định đã đưa ra. Sinh viên cần biết yêu cầu nộp bài, xem phản hồi và nộp phiên bản mới mà không làm mất lịch sử. Nếu thông tin rời rạc hoặc trạng thái khó nhận biết, người dùng có thể mất thời gian tìm kiếm hoặc thao tác nhầm.

### Problem statement

**Làm thế nào để hỗ trợ giảng viên quản lý và đánh giá tài liệu project một cách hiệu quả, minh bạch và có kiểm soát, đồng thời giúp sinh viên theo dõi yêu cầu, tiếp nhận feedback và nộp lại các phiên bản tài liệu thuận tiện trên mobile?**

### Phạm vi Lab 2

- Thiết kế các màn hình mobile và prototype cho Supervisor và Student; không yêu cầu backend thật hay mã Flutter.
- Chứng minh ba flow: **(F1)** Academic Management & Project Creation; **(F2)** AI-Assisted Supervisor Review; **(F3)** Document Submission, Revision & Approval.
- Thể hiện trạng thái **loading, empty, error, success**, dialog xác nhận, nhánh thay thế và error/recovery.
- Không cho AI tự phê duyệt tài liệu; version đã nộp cần được giữ nguyên.

---

## 2. P01 — SUPERVISOR (PRIMARY PERSONA)

### 01. Identity & Archetype

**Tên minh họa:** Nguyễn Văn An
**Archetype:** Giảng viên hướng dẫn nhiều nhóm project, cần ưu tiên công việc review và theo dõi tiến độ.
**Độ tuổi giả định:** 35–45.
**Vai trò:** Supervisor / Lecturer.

### 02. Persona Priority

**Primary Persona.** Đây là vai trò trọng tâm vì các tác vụ lõi của sản phẩm bao gồm quản lý học vụ, quản lý project, AI-assisted document review và quyết định phê duyệt.

### 03. Usage Context

- **Bối cảnh giả định:** Giữa các giờ lên lớp hoặc khi di chuyển, giảng viên kiểm tra nhanh tài liệu chờ review bằng điện thoại; khi đọc tài liệu dài có thể dùng máy tính.
- **Thiết bị:** Mobile là nền tảng thiết kế chính; desktop có thể hỗ trợ đọc tài liệu phức tạp.
- **Sự chú ý:** Thời gian ngắn, nhiều nhóm và deadline; cần nhìn thấy mức ưu tiên ngay khi mở Dashboard.
- **Kết nối:** Có thể không ổn định; cần nhận biết trạng thái đang xử lý và lỗi.

### 04. Goals

1. Xác định nhanh tài liệu nào cần được review và mức độ ưu tiên.
2. Đọc tài liệu đúng project/lab/version, tham khảo AI findings và đưa ra feedback rõ ràng.
3. Theo dõi quyết định, lịch sử chỉnh sửa và tiến độ của nhiều nhóm mà không nhầm ngữ cảnh.

### 05. Job to Be Done

**Khi** có nhiều tài liệu do các nhóm sinh viên nộp cùng lúc, **tôi muốn** lọc danh sách cần review, xem bản nộp cùng AI findings và đưa ra quyết định tại một nơi, **để** xử lý đúng hạn mà vẫn kiểm soát chất lượng đánh giá.

### 06. Current Behaviors

**Giả định cần kiểm chứng:** Giảng viên có thể đang kết hợp danh sách lớp, nơi lưu trữ file, bảng theo dõi tiến độ và tin nhắn/email để nhận tài liệu, trả feedback và nhắc deadline. Chưa có dữ liệu thực tế để xác nhận tần suất hoặc công cụ cụ thể.

### 07. Pain Points

1. **Quá tải yêu cầu review:** Khi nhiều nhóm nộp gần deadline, khó biết tài liệu nào cần xử lý trước; có nguy cơ bỏ sót.
2. **Nhầm phiên bản:** Khi sinh viên nộp lại nhiều lần, khó đối chiếu feedback cũ và bản mới nếu lịch sử không rõ.
3. **Kiểm tra thủ công lặp lại:** Phải đọc nhiều lỗi tương tự, nhưng vẫn cần tự xác nhận chất lượng và không thể tin AI tuyệt đối.

### 08. Motivations

Ưu tiên **tiết kiệm thời gian, đúng nghiệp vụ, truy vết được quyết định và đảm bảo công bằng trong đánh giá**. AI hữu ích nếu cung cấp nhận xét có thể kiểm tra, không tự ý quyết định.

### 09. Constraints

- Màn hình điện thoại hẹp, tài liệu PDF/DOCX có thể dài và nhiều chi tiết.
- Thời gian xử lý gián đoạn; cần giữ ngữ cảnh và thao tác Back hợp lý.
- Quyền hạn: chỉ Supervisor đưa ra Approve / Request Revision / Reject.
- Accessibility: chữ nội dung ≥14sp, vùng chạm ≥48×48dp, tương phản văn bản thường ≥4.5:1; các trạng thái phải có nhãn, không chỉ dùng màu.

### 10. Key Scenarios

**S01 — Review tài liệu vừa nộp lại**
*Trigger:* Có thông báo nhóm nộp `Use Case Diagram v2`.
*Task:* Mở Review Queue → chọn request → xem tài liệu và feedback v1 → đọc AI findings → nhập feedback → Approve hoặc Request Revision.
*Expected outcome:* Quyết định được gắn đúng phiên bản, có xác nhận và xuất hiện trong lịch sử.

**S02 — Tạo project từ nhóm hiện có**
*Trigger:* Nhóm mới được thành lập.
*Task:* Vào học vụ → chọn lớp/nhóm → tạo Project → kiểm tra cấu trúc Lab kế thừa.
*Expected outcome:* Project hợp lệ; nếu nhóm đã có Project, hệ thống chặn tạo trùng và dẫn tới Project hiện có.

### 11. Success Criteria (mục tiêu đề xuất, chưa đo)

| Mã | Chỉ số | Cách kiểm thử | Mục tiêu |
|---|---|---|---|
| SC-P01-1 | Tìm đúng tài liệu chờ review | Đếm thao tác từ Dashboard đến Review Workspace | Tối đa 3 thao tác chính với dữ liệu demo |
| SC-P01-2 | Hoàn thành review đúng version | Giao tác vụ chọn v2, nhập feedback và xác nhận | ≥90% người thử nghiệm hoàn thành không cần trợ giúp |
| SC-P01-3 | Nhận biết người quyết định cuối cùng | Hỏi người thử nghiệm vai trò của AI và Supervisor | 100% hiểu AI không tự phê duyệt |
| SC-P01-4 | Phục hồi sau AI Error | Demo trạng thái error và Retry | Thực hiện lại thành công, không mất ngữ cảnh |

### 12. Evidence & Status

- **Status:** Proto-persona, **chưa xác thực**.
- **Observed / Reported evidence:** Chưa có phỏng vấn, quan sát hoặc kết quả khảo sát được cung cấp.
- **Assumption IDs:** A-S01 (review thường xuyên trên mobile); A-S02 (khó quản lý nhiều version); A-S03 (ưu tiên hàng đợi review).
- **Cần thu thập:** Phỏng vấn/quan sát Supervisor thực hiện review thật; hỏi số lượng nhóm/tài liệu, cách nhận file, trải nghiệm AI và thao tác gây chậm; ghi ngày, mã nghiên cứu ẩn danh, trích dẫn khi có.

---

## 3. P02 — STUDENT (SECONDARY PERSONA)

### 01. Identity & Archetype

**Tên minh họa:** Trần Minh Anh
**Archetype:** Sinh viên thực hiện project theo nhóm, thường kiểm tra deadline và phản hồi trên điện thoại.
**Độ tuổi giả định:** 20–23.
**Vai trò:** Student / Group Member.

### 02. Persona Priority

**Secondary Persona.** Vai trò khác biệt rõ với Supervisor: không thiết lập học vụ hay phê duyệt tài liệu; chủ yếu hoàn thành yêu cầu nộp bài và phản hồi chỉnh sửa.

### 03. Usage Context

- **Bối cảnh giả định:** Kiểm tra trạng thái bài nộp giữa giờ học, khi di chuyển hoặc khi trao đổi với nhóm.
- **Thiết bị:** Điện thoại là kênh xem deadline/thông báo; laptop có thể dùng để tạo và chỉnh sửa tài liệu.
- **Sự chú ý:** Cần thông tin nhanh về Lab nào phải nộp và phần nào bị yêu cầu chỉnh sửa.
- **Kết nối:** Có thể gián đoạn khi chọn và gửi file.

### 04. Goals

1. Biết chính xác Lab Item, deadline, định dạng file và điều kiện nộp.
2. Nộp tài liệu hoặc version mới, nhận xác nhận và theo dõi tiến trình review.
3. Xem rõ feedback để sửa đúng lỗi, đồng thời tra lại lịch sử các phiên bản.

### 05. Job to Be Done

**Khi** giảng viên yêu cầu chỉnh sửa một tài liệu đã nộp, **tôi muốn** xem góp ý gắn với phiên bản cũ và nộp một phiên bản mới đúng yêu cầu, **để** nhóm có thể được review lại mà không làm mất lịch sử trước đó.

### 06. Current Behaviors

**Giả định cần kiểm chứng:** Sinh viên có thể theo dõi công việc qua nhóm chat, email hoặc hệ thống nộp bài, sửa tài liệu trên máy tính và kiểm tra thông báo trên điện thoại. Chưa có nguồn nghiên cứu xác nhận quy trình cụ thể.

### 07. Pain Points

1. **Không rõ việc phải làm:** Khi nhiều Lab Item có deadline khác nhau, khó xác định mục nào đang chờ nộp hoặc bị khóa do dependency.
2. **Feedback phân tán:** Nhận xét khó liên kết với version, khiến nhóm sửa sai hoặc bỏ sót lỗi.
3. **Thiếu xác nhận nộp lại:** Sau khi gửi file, không chắc phiên bản mới đã được ghi nhận hay yêu cầu review đã tạo thành công.

### 08. Motivations

Ưu tiên **nộp đúng hạn, hiểu góp ý, không phải hỏi lại giảng viên và có bằng chứng lịch sử các lần nộp**.

### 09. Constraints

- Có thể không có file cuối cùng trên điện thoại; cần rõ bước chọn file và trạng thái nộp.
- File có giới hạn định dạng/kích thước theo Lab Item.
- Không được sửa hoặc ghi đè version đã nộp.
- Accessibility: chữ ≥14sp, vùng chạm ≥48×48dp, trạng thái có biểu tượng/nhãn, form báo lỗi rõ và hướng dẫn phục hồi.

### 10. Key Scenarios

**S03 — Nộp tài liệu v1**
*Trigger:* Lab Item đến hạn.
*Task:* My Project → Documents → chọn Lab Item → Upload v1 → Request Review.
*Expected outcome:* Hiển thị `Waiting for Review`, có version và thời gian nộp rõ ràng.

**S04 — Nộp lại sau feedback**
*Trigger:* Nhận thông báo `Request Revision` cho v1.
*Task:* Mở feedback v1 → chỉnh tài liệu → upload v2 → kiểm tra file hợp lệ → request review → theo dõi trạng thái.
*Expected outcome:* v1 vẫn xem được; v2 tạo DocumentVersion mới và giữ reviewId của logical review request; khi Supervisor approve, trạng thái Approved được hiển thị đúng.

### 11. Success Criteria (mục tiêu đề xuất, chưa đo)

| Mã | Chỉ số | Cách kiểm thử | Mục tiêu |
|---|---|---|---|
| SC-P02-1 | Tìm tài liệu cần chỉnh sửa | Từ Dashboard tới feedback của v1 | Tối đa 3 thao tác chính với dữ liệu demo |
| SC-P02-2 | Nộp lại version mới | Thực hiện upload v2 và Request Review | ≥90% hoàn thành không cần trợ giúp |
| SC-P02-3 | Khôi phục lỗi upload | Thử file sai định dạng rồi chọn lại | Có thông báo lỗi cụ thể và thao tác Retry thành công |
| SC-P02-4 | Hiểu trạng thái phiên bản | Hỏi người thử nghiệm phân biệt v1/v2, Waiting/Approved | ≥90% trả lời đúng |

### 12. Evidence & Status

- **Status:** Proto-persona, **chưa xác thực**.
- **Observed / Reported evidence:** Chưa có dữ liệu khảo sát hoặc phỏng vấn được cung cấp.
- **Assumption IDs:** A-T01 (xem thông báo qua mobile); A-T02 (khó theo dõi feedback/version); A-T03 (cần xác nhận sau upload).
- **Cần thu thập:** Quan sát sinh viên tìm Lab Item, nộp file và tìm feedback; hỏi cách chia việc trong nhóm và vấn đề đã gặp; lưu bằng chứng ẩn danh, ngày và mã nghiên cứu.

---

## 4. Persona Coverage Matrix

| Persona | Vai trò / tác vụ | Bối cảnh thiết bị | Rào cản đặc trưng | Ưu tiên UI |
|---|---|---|---|---|
| P01 Supervisor (Primary) | Quản lý học vụ, xử lý Review Queue, quyết định cuối | Mobile xử lý nhanh; desktop đọc sâu (giả định) | Nhiều request, nhiều version, cần độ tin cậy | Dashboard công việc, lọc ngữ cảnh, AI Findings, Decision Dialog |
| P02 Student (Secondary) | Xem Lab, nộp/re-submit, nhận feedback | Mobile theo dõi; laptop chỉnh tài liệu (giả định) | Deadline, file không hợp lệ, thiếu feedback rõ ràng | My Project, Documents, Upload Validation, Version History |

**Lý do chọn hai persona cho phạm vi Lab 2:** Hai vai trò có goals, quyền hạn và task flows khác nhau. Phạm vi bài này tập trung vào Supervisor làm primary và Student là secondary để chứng minh tương tác hai chiều. Nếu làm đồ án nhóm quy mô lớn, có thể khảo sát và cân nhắc thêm persona cho giảng viên mới, trưởng nhóm sinh viên hoặc người quản trị; không tạo persona chỉ để đủ số lượng.

---

## 5. Persona → Need → UI Decision → Test Matrix

| Persona | Need / Pain Point | Giả thuyết quyết định UI | Màn hình liên quan | Cách xác minh |
|---|---|---|---|---|
| P01 | Nhận ra việc review cần ưu tiên | Dashboard hiển thị pending, reviewing, revision và deadline | Dashboard | Task test tìm đúng request |
| P01 | Tránh nhầm ngữ cảnh tài liệu | Workspace hiển thị lớp, nhóm, project, lab, version | Review Workspace | Yêu cầu người thử nghiệm xác định version |
| P01 | Tin AI có kiểm chứng, giữ quyền quyết định | AI Findings tách khỏi Approve/Revise/Reject, có cảnh báo AI hỗ trợ | AI Review / Review Workspace | Hỏi ai có quyền phê duyệt; test quyết định |
| P01 | Tránh quyết định nhầm | Dialog xác nhận, feedback tổng quan bắt buộc khi Revision; lý do bắt buộc khi Reject | Review Decision | Test hủy dialog, validation |
| P02 | Biết việc cần nộp | Nhóm tài liệu theo Lab Item với trạng thái/deadline | My Project / Documents | Task test tìm Lab Item |
| P02 | Không mất phiên bản cũ | Upload luôn tạo version mới; Version History truy cập được | Upload / Version History | Test v1 → v2 và so sánh lịch sử |
| P02 | Tự phục hồi khi upload lỗi | Hiển thị định dạng file cho phép, lỗi cụ thể và chọn lại | Document Upload | Test invalid file → retry |
| P01 + P02 | Minh bạch vòng phản hồi | Shared review status, notifications, feedback gắn version | Review Queue / Student Documents | Demo luồng Student ↔ Supervisor |

*Các UI decisions trên là giả thuyết cần đối chiếu với thiết kế đã thực hiện và thử nghiệm; không mặc nhiên là kết luận từ khảo sát.*

---

## 6. Mapping 3 User Flows to Personas

| Flow | Persona / người tham gia | Start | Goal / End | Alternate Path | Error / Recovery |
|---|---|---|---|---|---|
| F1 Academic Management & Project Creation | P01 Supervisor | Dashboard → Academic Management | Project tạo thành công và kế thừa cấu trúc Lab | Group đã có Project → View Existing Project | Form không hợp lệ → sửa → thử lưu lại |
| F2 AI-Assisted Document Review | P01 Supervisor | Review Queue | Supervisor Decision lưu và cập nhật trạng thái | Hủy dialog; AI disabled → review thủ công nếu được phép | AI Error → Retry; không cho bỏ qua nếu Rule Set yêu cầu AI |
| F3 Document Submission, Revision & Approval | P02 Student + P01 Supervisor | Student Documents → Upload v1 | v2 (hoặc version mới) được Approved, lịch sử bảo toàn | v1 được Approve ngay; hoặc cần sửa tiếp v3 | File invalid → chọn lại; lỗi request → retry |

---

## 7. Research & Validation Plan (chưa thực hiện)

### Câu hỏi phỏng vấn gợi ý

**Supervisor**
1. Lần gần nhất bạn review một tài liệu do nhóm nộp lại là khi nào? Bạn thao tác qua những công cụ nào?
2. Làm sao nhận ra tài liệu cần xử lý sớm nhất?
3. Bạn so sánh phiên bản và tìm feedback cũ như thế nào?
4. Điều gì khiến bạn tin hoặc không tin một AI finding?

**Student**
1. Lần gần nhất bạn nhận yêu cầu sửa tài liệu là khi nào? Bạn tìm feedback ở đâu?
2. Làm sao biết bạn phải nộp loại file gì, khi nào?
3. Khi upload thất bại, bạn muốn hệ thống chỉ dẫn điều gì?
4. Làm thế nào bạn biết phiên bản mới đã được giảng viên nhận?

### Kế hoạch kiểm thử đề xuất

- Chọn người tham gia phù hợp từng persona nếu điều kiện lớp học cho phép.
- Task test: T1 Supervisor tìm request; T2 Supervisor review và yêu cầu sửa; T3 Student nộp v2; T4 Supervisor phê duyệt v2; T5 kiểm tra lịch sử.
- Ghi thời gian, số lần chạm, lỗi thao tác, mức độ cần hỗ trợ và nhận xét thực tế.
- Lưu `Evidence ID`, ngày, kết quả, ghi chú nghiên cứu đã ẩn danh; cập nhật mục `Evidence & Status` của từng persona.

### Bảng theo dõi evidence (để điền sau)

| Evidence ID | Ngày | Vai trò | Phương pháp | Quan sát / phát biểu thực tế | Persona / Assumption bị ảnh hưởng |
|---|---|---|---|---|---|
| Chưa có | — | — | — | Chưa thu thập | — |

---

## 8. Accessibility & Mobile Constraints

**Yêu cầu thiết kế cần kiểm chứng trên bản Figma cuối:**

- Mobile widths: **360dp, 390dp, 412dp**; không tràn ngang, không che nội dung bởi navigation.
- Body/label text: **≥14sp** theo guideline Lab; đảm bảo có khả năng đọc trong điều kiện sử dụng thực tế.
- Touch targets: **≥48×48dp** cho hành động chính và các tương tác cần chạm.
- Contrast: **≥4.5:1** cho văn bản thường; **≥3:1** cho văn bản lớn/các điều khiển theo yêu cầu Lab.
- Trạng thái `Waiting`, `Revision`, `Approved`, `Rejected` có **text label và/hoặc icon**, không chỉ đổi màu.
- Biểu mẫu upload và quyết định review cần nêu nguyên nhân lỗi, giữ dữ liệu người dùng và có Recovery.

*Đây là design constraints; cần ảnh chụp kiểm tra responsive, contrast và component measurements để khẳng định PASS.*

---

## 9. Assumption Backlog & Next Actions

| Ưu tiên | Assumption cần kiểm chứng | Tại sao quan trọng | Cách kiểm chứng |
|---|---|---|---|
| Cao | Supervisor ưu tiên pending review trên Dashboard | Quyết định thứ tự thông tin chính | Interview + task observation |
| Cao | Student gặp khó khăn trong việc tìm feedback theo version | Ảnh hưởng luồng Revision | Student task test |
| Cao | AI Findings cần phân biệt rõ với kết luận chính thức | Tránh hiểu sai vai trò AI | Comprehension test |
| Trung bình | Người dùng cần xem lịch sử chi tiết trên điện thoại | Ảnh hưởng thiết kế Document History | Interview + usability test |
| Trung bình | Quick Access phù hợp hơn thêm tab học vụ | Ảnh hưởng IA và Bottom Navigation | Navigation tree test |

### Checklist tài liệu

- [x] Có 1 Primary Persona (Supervisor) và 1 Secondary Persona (Student).
- [x] Mỗi Persona đủ 12 trường lõi và thông tin tuổi/vai trò/thiết bị/accessibility.
- [x] Có Problem Statement, Key Scenarios, Success Criteria đo được.
- [x] Có Persona Coverage Matrix và Persona → Need → UI Decision → Test Matrix.
- [x] Có mapping tới 3 User Flows và assumption backlog.
- [ ] Có bằng chứng phỏng vấn/quan sát thật và evidence IDs.
- [ ] Các success metrics đã được đo trong usability testing.
- [ ] Đã đối chiếu tất cả giả thuyết UI với Figma Final UI và prototype chạy thực tế.

---

## 10. Tóm tắt dùng cho Slide 02

**Primary — Supervisor:** Cần nắm nhanh các tài liệu chờ review, xem đúng ngữ cảnh project/lab/version, tận dụng AI findings để giảm thao tác lặp lại nhưng vẫn quyết định cuối cùng.
**Secondary — Student:** Cần biết Lab Item phải nộp, xem feedback rõ ràng, tạo version mới khi sửa và theo dõi trạng thái approval.
**Problem Statement:** Thiết kế trải nghiệm mobile giúp quản lý quy trình review và revision minh bạch, hiệu quả giữa hai vai trò.
**Success targets (chưa đo):** Tìm tài liệu trong tối đa 3 thao tác, ≥90% hoàn thành tác vụ review/re-submit không cần hỗ trợ, có error/recovery và lịch sử version rõ ràng.

---

<details>
<summary>Phần B — Bản lưu GitHub 8258f69 (lịch sử, không phải đặc tả hiện hành)</summary>

> **Chỉ là bản lưu lịch sử.** Mọi khẳng định hoàn thành/PASS, số đo, route `app/`, persona và flow trong phần này thuộc tài liệu GitHub gốc, chưa được xác nhận lại cho bản hiện tại. Hướng dẫn Figma, UX/UI, Design System, AI Design Log, Handoff và Lab 2 được bảo toàn để tham khảo. Khi có khác biệt, dùng phần A và source `src/`.

# Persona — Hệ thống quản lý học vụ & Review tài liệu

Persona dưới đây **suy ra từ code nền thật** (`app/src/data/mockData.ts`, `app/src/types/index.ts`),
không phải tự nghĩ. Người dùng mặc định trong code là `currentUser = "Nguyễn Văn An", "Giảng viên / Supervisor"`.

---

## 1. Persona chính — Giảng viên phụ trách đồ án

| Thuộc tính | Giá trị |
|---|---|
| Họ tên | Nguyễn Văn An |
| Tuổi | 38 |
| Nghề | Giảng viên bộ môn Công nghệ phần mềm |
| Vai trong hệ thống | Supervisor (người duyệt) |
| Thiết bị | iPhone 14, dùng khi di chuyển giữa các lớp; laptop khi ngồi bàn |
| Học kỳ | Fall 2026 |
| Số lớp phụ trách | 4 lớp (~130 sinh viên, ~30 nhóm) |
| Số yêu cầu review / tuần | 20–35 |

### Mục tiêu

1. Biết ngay **hôm nay phải review gì** mà không phải mở từng lớp.
2. Duyệt tài liệu đúng hạn SLA (2–5 ngày tuỳ rule set) để nhóm kịp tiến độ.
3. Phát hiện nhóm nào đang chậm **trước khi** quá hạn, không phải sau.
4. Giữ phản hồi nhất quán giữa các nhóm — cùng một chuẩn cho mọi bài.
5. Phân biệt rõ đâu là **lỗi máy/AI phát hiện** và đâu là **nhận xét của mình**.

### Nỗi đau (bằng chứng từ code nền)

| Nỗi đau | Bằng chứng trong code |
|---|---|
| Phải mở nhiều lớp mới biết việc cần làm | `DashboardPage` có khối `attentionItems` gom việc gấp |
| Không rõ tài liệu đang ở công đoạn nào | `types/index.ts` tách **3 track**: `documentStatus` · `aiStatus` · `supervisorStatus` |
| Sinh viên nộp lại mà không rõ sửa gì | `DocumentVersion` bất biến + `ReviewFeedback` có `severity` |
| Quên mất chuẩn review của môn | `RuleSet` (AI auto/manual, SLA ngày, định dạng, số lần nộp lại) |
| Nhóm nộp bài mà mục trước chưa duyệt | `LabItem.dependsOn` → `submissionLocked` |
| Deadline khác nhau ở từng tầng | Cấu hình kế thừa 3 tầng: Offering → Class → Project (`lib/config.ts`) |

### Tiêu chí thành công

| Tiêu chí | Trọng số |
|---|---|
| Thấy việc cần làm trong 5 giây đầu | 30% |
| Biết tài liệu đang ở công đoạn nào | 25% |
| Duyệt / yêu cầu sửa không quá 3 lần bấm | 20% |
| Hiểu vì sao AI báo lỗi | 15% |
| Không bỏ sót nhóm quá hạn | 10% |

---

## 2. Persona phụ — Sinh viên trưởng nhóm

| Thuộc tính | Giá trị |
|---|---|
| Họ tên | Trần Thị Bình |
| Tuổi | 21 |
| Vai | Trưởng nhóm (Group 01, SE1701) |
| Thiết bị | Android, Samsung Galaxy A54 |
| Số thành viên | 5 |
| Số tài liệu phải nộp | 4 học kỳ này |

### Mục tiêu

1. Biết bài mình **còn thiếu gì** trước khi hết hạn.
2. Hiểu lỗi AI báo để sửa đúng chỗ.
3. Biết mục nào phải được duyệt trước mới nộp được mục sau.

### Nỗi đau

| Nỗi đau | Bằng chứng |
|---|---|
| Không biết vì sao **không gửi được** yêu cầu review | `submissionLocked` khi `dependsOn` chưa duyệt |
| AI báo lỗi nhưng không nói ở trang nào | `AIFinding.pageRef` (ví dụ "tr.12") |
| Nộp lại mà không rõ đã sửa hết chưa | `DocumentVersion` + đếm `feedbackCount` |

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
| Kích thước vùng bấm | ≥ 44×44 px | Đo bằng `getBoundingClientRect` |
| Tương phản chữ | ≥ 4.5:1 | Tính công thức WCAG |
| Cỡ chữ thân | ≥ 13 px | Bảng kiểu chữ |
| Bề rộng màn hình | 360dp và 412dp | Render 2 viewport |
| Chữ lớn (tiêu đề) | ≥ 3:1 | Tính công thức WCAG |

> **Phát hiện thật:** app nền **đạt** ngưỡng tương phản chữ nhưng **không đạt** ngưỡng 44px ở nhiều chỗ
> (link phụ cao 17–26px, chip lọc 28–40px). Chi tiết và số đo ở `facts/MEASUREMENTS.md` §3.

</details>
