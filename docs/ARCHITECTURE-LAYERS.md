# Kiến trúc tài liệu theo tầng

**Tầng thông tin:** mô tả chính quy ước tầng · **Mã:** dùng cho mọi tầng · **Gate:** H

**Mục đích:** biết ngay **một tài liệu/mã thuộc cấp độ thông tin nào**, và từ cấp đó suy ra nó được
phép chứa gì, được phép sinh ra cái gì. Tránh việc tài liệu tầng thấp tự định nghĩa lại nghiệp vụ.

**Quy ước mã:** số đầu của mã = tầng. `1-UC-01` là tầng 1; `4-TC-01` là tầng 4. Chi tiết: `rules/ID-SCHEME.md`.

---

## 1. Bốn tầng

```
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 1 — NGHIỆP VỤ / ĐỊNH DANH                              │
│  Ai? Làm gì? Vì sao?                                         │
│  1-PS persona · 1-SH stakeholder · 1-UC use case             │
│  1-US user story · 1-E evidence · 1-IN insight · 1-PN need   │
│  File: ux/persona.md · ux/use-cases.md · ux/user-stories.md  │
└───────────────────────────┬─────────────────────────────────┘
                            │ sinh ra ↓
┌───────────────────────────▼─────────────────────────────────┐
│  TẦNG 2 — PHÂN TÍCH / LUỒNG                                  │
│  Việc đó đi qua những bước nào? Hỏng thì sao?                │
│  2-FL flow                                                  │
│  File: ux/user-flow.md (FL-01 thuận · FL-02 thay thế ·       │
│        FL-03 lỗi & phục hồi)                                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ sinh ra ↓
┌───────────────────────────▼─────────────────────────────────┐
│  TẦNG 3 — THIẾT KẾ / GIAO DIỆN                                │
│  Trông thế nào? Dùng token/component gì?                     │
│  3-SC screen · 3-ST state · 3-CP component · 3-TK token      │
│  File: ux/final-ui-spec.md · design-system.md ·              │
│        figma-svg/output/03-final/                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ sinh ra ↓
┌───────────────────────────▼─────────────────────────────────┐
│  TẦNG 4 — THỰC THI / KIỂM CHỨNG                              │
│  Kiểm được không? Bằng chứng đâu?                            │
│  4-TC test case · 4-AI vòng lặp AI · 4-RG quy tắc            │
│  File: docs/test-cases.md · ai-design-log.md ·               │
│        rules/QUALITY-RULES.md · verify/                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Quy tắc chiều (quan trọng nhất)

| Hướng | Cho phép? | Nghĩa |
|---|---|---|
| `1 → 2 → 3 → 4` | ✅ **sinh ra** | Nghiệp vụ sinh luồng, luồng sinh thiết kế, thiết kế sinh test |
| `4 → 3 → 2 → 1` | ✅ **tham chiếu** | Test trỏ về màn hình, màn hình trỏ về luồng, luồng trỏ về use case |
| `1 → 4` (nhảy cóc ghi định nghĩa) | ⚠️ cho phép | Truy vết trực tiếp được, nhưng phải qua bảng `docs/traceability.md` |
| `4 → 1` (tầng 4 **định nghĩa lại** tầng 1) | ❌ **cấm** | Test không được phát minh use case mới |
| `1 → 3` (nghiệp vụ tự quyết pixel) | ❌ **cấm** | "Nút phải cao 48px" là tầng 3, không phải yêu cầu nghiệp vụ |

**Cách máy kiểm:** `rules/check-ids.py` báo lỗi khi một mã ở tầng thấp hơn được **nhắc tới để định nghĩa**
(bị coi là định nghĩa lại) ở file thuộc tầng cao hơn.

---

## 3. Cấp độ thông tin — tra nhanh

Bảng tra: gặp một câu trong tài liệu, nó thuộc tầng nào?

| Câu kiểu | Tầng | Ví dụ thật |
|---|---|---|
| "Giảng viên cần biết việc gấp trong ngày" | **1** | `1-PN-01` trong `ux/persona-decisions.md` |
| "Bấm SSO rồi mở Tổng quan" | **2** | `2-FL-01` trong `ux/user-flow.md` |
| "Thẻ review cao 158dp, bo góc 12" | **3** | `3-CP-xx` trong `design-system.md` |
| "Test: bấm Huỷ thì không có toast" | **4** | `4-TC-08` trong `docs/test-cases.md` |
| "Màu brand là #146B55" | **3** (token) | `3-TK-brand` · nguồn gốc `app/src/index.css` |

**Nhãn `Observed/Reported/Inferred/Assumed` (C2)** gắn vào **tầng 1** và đi theo xuống dưới. Một
test ở tầng 4 vẫn giữ nhãn gốc: test dựa trên `Assumed` là test trên giả định, không phải sự thật.

---

## 4. Cơ chế đặt mã theo code và folder (như SKU)

Mã không chỉ để đọc — nó **buộc cấu trúc folder phải khớp**. Quy tắc:

| Tầng | Folder bắt buộc | Loại mã được phép |
|---|---|---|
| 1 | `ux/` | `1-PS`, `1-SH`, `1-UC`, `1-US`, `1-E`, `1-IN`, `1-PN` |
| 2 | `ux/` | `2-FL` |
| 3 | `ux/`, `design-system.md`, `figma-svg/output/03-final/` | `3-SC`, `3-ST`, `3-CP`, `3-TK` |
| 4 | `docs/`, `rules/`, `verify/` | `4-TC`, `4-AI`, `4-RG` |

Một mã `3-SC-04` xuất hiện trong `docs/` → **hợp lệ** (tầng 4 tham chiếu tầng 3).
Một mã `1-UC-16` được **định nghĩa** trong `docs/` → **lỗi** (tầng 4 định nghĩa lại tầng 1).

Ánh xạ sang code thật của ứng dụng:

| Mã tài liệu | Trỏ tới code |
|---|---|
| `3-SC-01` | `app/src/pages/auth/LoginPage.tsx` |
| `3-SC-04` | `app/src/pages/reviews/ReviewWorkspacePage.tsx` |
| `3-SC-05` | `app/src/pages/reviews/AIReviewResultPage.tsx` |
| `2-FL-01` | luồng trong `app/src/app/router.tsx` (23 route) |

Ánh xạ sang app Flutter mới (`flutter_app/lib/`):

| Mã tài liệu | Trỏ tới code Flutter |
|---|---|
| `3-SC-01` | `lib/screens/login_screen.dart` |
| `3-SC-04` | `lib/screens/review_workspace_screen.dart` |
| `3-SC-05` | `lib/screens/ai_result_screen.dart` |
| `3-TK-*` | `lib/theme/app_colors.dart` |
| `4-TC-17`…`4-TC-19` | `flutter_app/test/accessibility_test.dart` |

---

## 5. Kiểm bằng lệnh

```bash
python3 rules/check-ids.py          # mã có định nghĩa, không mồ côi, đúng tầng
python3 rules/check-layers.py       # file nằm đúng folder của tầng mình
```

Exit 0 = sạch · 1 = vi phạm tầng · 2 = chưa kiểm được.

---

## 6. Ghi chú trung thực

- Quy ước 4 tầng này **tôi đặt trong phiên làm việc**, dựa trên yêu cầu của người dùng ("architect sẽ
  chỉ theo layer, biết cấp độ thông tin là cấp mấy"). Không phải quy ước chuẩn của giảng viên.
- **Về "001, 011, 202":** đã tra tài liệu ngành (khảo sát 14/10/2026) — **không có chuẩn nào** dùng
  bộ số `001/011/202` làm mã tầng kiến trúc. Các quy ước gần nhất là ADR (`ADR-001`), sheet number
  kiểu NCS (`A-102`), và dải mã theo tổ chức (`00xx` quản trị, `01xx` nền, `02xx` mô-đun) — **tất cả
  đều là quy ước cục bộ của từng dự án**, không phổ quát.
  Kết luận: số đầu mã = cấp thông tin (như §2) là **một cách hiểu hợp lệ**, nhưng **không phải chuẩn
  ngành**. Nếu người dùng có quy ước riêng của lớp/dự án, thay số cho khớp — cấu trúc 4 tầng giữ nguyên.
- Các mã **đã tồn tại trước** trong `ux/persona-decisions.md` dùng dạng cũ (`E-01`, `INS-A`, `P01`,
  `PN-01`, `F01`, `S02`, `TC-01`). Bảng đối chiếu dạng cũ ↔ dạng mới ở `docs/traceability.md` §3 —
  tài liệu cũ **không bị sửa lại** để tránh phá vỡ tham chiếu đang có.
