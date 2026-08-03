# TOEIC Local App — Bổ sung: 3 Theme màu (Light / Dark / Night Reading Mode)

> Dựa trên nguyên tắc thiết kế dark mode hiện hành (2026): không dùng đen tuyền `#000000` (gây tương phản gắt, "smearing" trên màn OLED), không dùng trắng tuyền `#FFFFFF` làm chữ trên nền tối (gây "halation" — hiện tượng nhòe sáng chói mắt), giữ tỷ lệ tương phản đạt chuẩn WCAG 2.1 AA (≥ 4.5:1 cho chữ thường, ≥ 3:1 cho chữ lớn/UI component), và giảm độ bão hoà (saturation) của màu nhấn khi chuyển sang nền tối để tránh chói/rung màu.

---

## 1. Bảng màu cụ thể cho 3 theme

### 1.1. Light Theme (ban ngày)
| Token | Hex | Dùng cho |
|---|---|---|
| `--bg-base` | `#FAFAF8` | Nền tổng thể (không dùng #FFFFFF thuần để giảm chói) |
| `--bg-surface` | `#FFFFFF` | Nền card/panel nổi lên trên |
| `--text-primary` | `#1A1A1A` | Chữ chính (gần đen, không đen tuyền) |
| `--text-secondary` | `#5B5B5B` | Chữ phụ, chú thích |
| `--border` | `#E5E5E3` | Viền, đường phân cách |
| `--accent-primary` | `#2563EB` | Nút chính, link, highlight (xanh dương, tỷ lệ tương phản với nền trắng ~5.2:1, đạt AA) |
| `--accent-success` | `#16A34A` | Đáp án đúng |
| `--accent-error` | `#DC2626` | Đáp án sai |
| `--accent-warning` | `#D97706` | Cảnh báo (đồng hồ đếm ngược sắp hết giờ) |

### 1.2. Dark Theme (tối chuẩn, dùng ban ngày/phòng thiếu sáng)
| Token | Hex | Dùng cho |
|---|---|---|
| `--bg-base` | `#121212` | Nền tổng thể (chuẩn Material Design dark, không dùng #000000) |
| `--bg-surface` | `#1E1E1E` | Nền card/panel nổi lên (sáng hơn nền 1 bậc để tạo độ sâu/elevation) |
| `--bg-surface-2` | `#262626` | Panel nổi cao hơn nữa (modal, popup) |
| `--text-primary` | `#E8E8E6` | Chữ chính (trắng ngà, không trắng tuyền để tránh halation) |
| `--text-secondary` | `#A3A3A0` | Chữ phụ, chú thích |
| `--border` | `#333331` | Viền, đường phân cách |
| `--accent-primary` | `#7C9CFF` | Nút chính, link (xanh dương làm dịu độ bão hoà so với light theme, tương phản với nền tối ~6.1:1) |
| `--accent-success` | `#4ADE80` | Đáp án đúng (xanh lá sáng hơn để nổi trên nền tối) |
| `--accent-error` | `#F87171` | Đáp án sai |
| `--accent-warning` | `#FBBF24` | Cảnh báo |

### 1.3. Night Reading Mode (chế độ đọc đêm — ấm, dịu mắt, giảm ánh sáng xanh)
> Đây là chế độ riêng biệt, không phải chỉ là "dark theme tối hơn" — nguyên lý giống chế độ đọc đêm trên máy đọc sách (Kindle warm light, f.lux): giảm tông xanh dương (blue light — loại ánh sáng ảnh hưởng nhịp sinh học/gây mỏi mắt ban đêm nhiều nhất), chuyển toàn bộ bảng màu sang tông ấm (nâu/vàng/hổ phách), tránh hoàn toàn dùng accent xanh dương.

| Token | Hex | Dùng cho |
|---|---|---|
| `--bg-base` | `#1F1811` | Nền tổng thể (nâu đen ấm, không phải đen-xanh như dark theme thường) |
| `--bg-surface` | `#2A2118` | Nền card/panel |
| `--bg-surface-2` | `#352A1D` | Panel nổi cao (modal, popup) |
| `--text-primary` | `#E8DCC4` | Chữ chính (màu kem/sepia ấm, giống trang sách cũ — không trắng, không xanh) |
| `--text-secondary` | `#B3A483` | Chữ phụ |
| `--border` | `#3D3221` | Viền |
| `--accent-primary` | `#D99B4D` | Nút chính, link — **dùng màu hổ phách/cam thay vì xanh dương**, vì xanh dương là màu cần tránh nhất về đêm |
| `--accent-success` | `#8FBC6A` | Đáp án đúng (xanh lá ngả vàng, ấm hơn xanh lá thuần) |
| `--accent-error` | `#D97757` | Đáp án sai (đỏ cam ấm, không đỏ tươi chói) |
| `--accent-warning` | `#E0A458` | Cảnh báo |

---

## 2. Hướng dẫn kỹ thuật implement (React + Tailwind + Vite)

### 2.1. Dùng CSS Custom Properties (biến CSS), KHÔNG hardcode màu trực tiếp trong từng component
- [ ] Định nghĩa toàn bộ token màu ở mục 1 dưới dạng CSS variables trong 1 file gốc (ví dụ `src/styles/themes.css`), theo 3 class: `.theme-light`, `.theme-dark`, `.theme-night`.
- [ ] Toàn bộ component hiện có (Flashcard, Quiz, Dashboard, popup tra từ, thẻ ngữ pháp, PracticeTimer...) phải dùng lại các token này (`bg-[var(--bg-base)]`, hoặc cấu hình Tailwind `theme.extend.colors` trỏ vào CSS variables) — **không được để bất kỳ màu hex cứng nào còn sót lại trong code cũ**, vì sẽ làm hỏng theme khi chuyển đổi.

### 2.2. Cơ chế chuyển đổi theme
- [ ] Nút chuyển theme (3 lựa chọn: Light / Dark / Night) đặt ở vị trí cố định dễ thấy (header/thanh điều hướng).
- [ ] Lưu lựa chọn vào `localStorage` (app React thông thường, không phải Claude Artifact, nên dùng `localStorage` bình thường là hợp lệ) để nhớ lựa chọn giữa các lần mở lại app.
- [ ] Mặc định lần đầu mở app: tự động theo `prefers-color-scheme` của hệ điều hành (dark → Dark theme, light → Light theme), người dùng có thể đổi tay bất cứ lúc nào, kể cả chọn Night Reading Mode thủ công.
- [ ] Áp dụng class theme lên thẻ `<html>` hoặc `<body>` gốc để toàn bộ app đổi theo ngay lập tức, không cần reload trang.

### 2.3. Những nơi CẦN kiểm tra kỹ khi đổi theme (dễ bị bỏ sót)
- [ ] Màu đáp án đúng/sai trong Quiz/Practice (đã liệt kê `--accent-success`/`--accent-error` riêng cho từng theme ở trên — không dùng chung 1 màu xanh/đỏ cố định cho cả 3 theme).
- [ ] Màu `PracticeTimer` (xanh/vàng/đỏ theo % thời gian còn lại) — cần map đúng theo từng theme, đặc biệt Night Mode phải tránh dùng xanh dương/đỏ tươi chói.
- [ ] Biểu đồ/thanh tiến độ trên Dashboard.
- [ ] Vùng bôi đen text (Module 16) và popup tra từ — nền popup phải đổi theo theme, không bị "trắng cứng" giữa nền tối.

**DoD:**
- [ ] Dùng công cụ kiểm tra tỷ lệ tương phản (WebAIM Contrast Checker hoặc tương đương) xác nhận MỌI cặp `text` trên `background` ở cả 3 theme đều đạt tối thiểu 4.5:1 cho chữ thường — dán kết quả đo cho ít nhất 5 cặp quan trọng nhất (chữ chính/nền chính, chữ phụ/nền chính, mỗi accent color/nền surface).
- [ ] Kiểm tra bằng mắt: chuyển qua lại cả 3 theme trên ít nhất 4 trang khác nhau (Flashcard, Quiz, Dashboard, Chi tiết tài liệu) — xác nhận không còn màu hex cứng nào "trơ" không đổi theo theme (ví dụ nền trắng cứng còn sót giữa Dark/Night mode).
- [ ] Xác nhận lựa chọn theme được nhớ lại đúng sau khi đóng và mở lại trình duyệt.
- [ ] Riêng Night Reading Mode: xác nhận không còn màu xanh dương/xanh lam nào sáng chói trong toàn bộ giao diện (kể cả icon, border, focus state) — đây là mục đích cốt lõi của chế độ này.
