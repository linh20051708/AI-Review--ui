# Quy tắc đặt mã định danh (ID scheme)

**Mục đích:** mọi artifact trong Lab 2 phải có **mã tra được** — như SKU trong quản lý kho. Một mã
xuất hiện ở bất kỳ file nào cũng phải trả lời được: *nó thuộc tầng nào, sinh từ cái gì, dùng ở đâu.*

**Bước Lab 2:** Generate → Handoff · **Gate:** H (tài liệu) · **Trạng thái:** áp dụng toàn repo.

---

## 1. Cấu trúc mã

```
<TẦNG>-<LOẠI>-<SỐ>
 │      │      └── số thứ tự trong loại, 2 chữ số (01, 02, …, 99)
 │      └───────── 2–4 ký tự, loại artifact (xem §3)
 └──────────────── 1 chữ số, tầng thông tin (xem §2)
```

Ví dụ: `1-UC-01` = tầng 1 · use case · cái thứ 1.

---

## 2. Tầng thông tin (layer) — số đầu = cấp

Số đầu mã hoá **cấp độ thông tin**: thông tin ở tầng nào thì chỉ được tham chiếu *xuống*, không
được tham chiếu *lên* (tránh vòng lặp và tránh tài liệu cấp thấp tự định nghĩa lại nghiệp vụ).

| Mã | Tầng | Chứa gì | Không được chứa | File tiêu biểu |
|---|---|---|---|---|
| **1** | Nghiệp vụ / Định danh | Vai, persona, use case, user story, yêu cầu | Chi tiết pixel, mã màu | `ux/persona.md`, `ux/use-cases.md` |
| **2** | Phân tích / Luồng | User flow, luồng lỗi, ma trận Back, kịch bản | Mã màu, cỡ chữ | `ux/user-flow.md` |
| **3** | Thiết kế / Giao diện | Màn hình, component, design system, token | Yêu cầu nghiệp vụ mới | `ux/final-ui-spec.md`, `design-system.md` |
| **4** | Thực thi / Kiểm chứng | Test case, script kiểm, nhật ký AI, handoff | Quyết định thiết kế mới | `docs/test-cases.md`, `verify/` |

**Quy tắc chiều:** `4 → 3 → 2 → 1` chỉ được **đọc và tham chiếu**; `1 → 2 → 3 → 4` mới được **sinh ra**.
Một test case (tầng 4) **không được** tự phát minh use case mới; nó phải trỏ về mã tầng 1 có thật.

---

## 3. Loại artifact

| Loại | Nghĩa | Tầng hợp lệ | Nơi định nghĩa |
|---|---|---|---|
| `PS` | Persona | 1 | `ux/persona.md` |
| `SH` | Stakeholder | 1 | `ux/stakeholder-map.md` |
| `UC` | Use case | 1 | `ux/use-cases.md` |
| `US` | User story | 1 | `ux/user-stories.md` |
| `E` | Bằng chứng thô (evidence) | 1 | `ux/affinity-board.md`, `facts/MEASUREMENTS.md` |
| `IN` | Insight | 1 | `ux/affinity-board.md` |
| `PN` | Need của persona | 1 | `ux/persona-decisions.md` |
| `FL` | Flow | 2 | `ux/user-flow.md` |
| `SC` | Screen (màn hình) | 3 | `ux/final-ui-spec.md` |
| `ST` | State (biến thể trạng thái) | 3 | `ux/final-ui-spec.md` |
| `CP` | Component | 3 | `design-system.md` |
| `TK` | Token | 3 | `design-system.md` |
| `TC` | Test case | 4 | `docs/test-cases.md` |
| `AI` | Vòng lặp AI | 4 | `ai-design-log.md` |
| `RG` | Quy tắc (rule) | 4 | `rules/QUALITY-RULES.md` |

---

## 4. Vì sao đặt như vậy (tương tự SKU)

SKU trong quản lý kho giải quyết ba việc: **đếm được**, **tra được**, **biết ngay thuộc nhóm nào nhìn
vào mã**. Mã ở đây làm đúng ba việc đó:

| Vấn đề kho | SKU giải quyết | Mã này giải quyết |
|---|---|---|
| Không biết có bao nhiêu mặt hàng | Mỗi SKU một mặt hàng | `grep -o '1-UC-[0-9]*'` đếm được số use case |
| Không tra được nguồn gốc | SKU → nhà cung cấp | Mã → bảng truy vết `docs/traceability.md` |
| Không biết thuộc nhóm nào | Tiền tố nhóm trong SKU | Số đầu mã = tầng, đọc là biết cấp |

---

## 5. Kiểm tra tự động

Cơ chế đặt mã chỉ có giá trị nếu **kiểm được**. Script `rules/check-ids.py`:

1. Quét mọi file `.md` trong repo (trừ `node_modules`, `build`, `.dart_tool`).
2. Tìm mọi mã khớp `\b[1-4]-(PS|SH|UC|US|E|IN|PN|FL|SC|ST|CP|TK|TC|AI|RG)-\d{2}\b`.
3. Kiểm mỗi mã **được định nghĩa** ở đúng file của loại nó (bảng §3).
4. Kiểm mỗi mã **được nhắc tới** đều tồn tại trong bảng định nghĩa — mã mồ côi là lỗi.
5. Kiểm tầng của mã khớp tầng của file đang nhắc nó **không được thấp hơn** (tầng 4 trỏ lên tầng 1
   là hợp lệ; tầng 1 trỏ xuống tầng 4 để "định nghĩa lại" là lỗi).

Chạy:

```bash
python3 rules/check-ids.py
```

Exit 0 = sạch · Exit 1 = có mã mồ côi hoặc sai tầng · Exit 2 = chưa kiểm được (thiếu file nguồn).

---

## 6. Ghi chú trung thực

- Bảng mã này **do tôi đặt trong phiên làm việc**, không phải quy ước có sẵn của giảng viên. Nếu
  giảng viên có quy ước riêng thì thay số/tên loại cho khớp, cấu trúc 4 tầng giữ nguyên.
- Các mã đã dùng trong `ux/persona-decisions.md` từ trước (`E-01`, `INS-A`, `P01`, `PN-01`, `F01`,
  `S02`, `TC-01`) là **dạng cũ**. `docs/traceability.md` ghi bảng đối chiếu dạng cũ ↔ dạng mới để
  không phải sửa lại tài liệu đã viết.
