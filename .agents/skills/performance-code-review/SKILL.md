---
name: performance-code-review
description: Use this skill whenever the user asks to review, audit, or diagnose PERFORMANCE specifically — for frontend, backend, or both — and wants the two compared or handled with distinct checklists. Trigger for requests like "review performance code fe vs be", "check hiệu năng frontend", "sao trang load chậm", "optimize backend query", "app bị lag/giật", "review Core Web Vitals", "so sánh performance issue giữa FE và BE", "audit performance trước khi launch", "tại sao API chậm", "bundle size quá to", "N+1 query", or any request to specifically diagnose slowness, high latency, jank, memory leaks, bundle size, or database/query bottlenecks — as opposed to a general code review covering all dimensions (architecture, security, etc.), which should use backend-code-review or a general review skill instead. Works for any language, framework, or project — not tied to one specific codebase.
---

# Performance Code Review Skill (Frontend vs Backend)

Skill này giúp Claude chẩn đoán và review vấn đề **hiệu năng (performance)** một
cách chuyên sâu, tách biệt rõ ràng giữa **Frontend (FE)** và **Backend (BE)** —
vì nguyên nhân, công cụ đo, và cách sửa của hai phía khác nhau hoàn toàn dù
triệu chứng bên ngoài đều là "chậm".

Nguyên tắc cốt lõi: **không đoán mò "chắc là do X"** — luôn đo trước, kết luận
sau, dựa trên bằng chứng (profiler, metrics, EXPLAIN plan, Lighthouse report...).

---

## 1. Bước 0 — Xác định triệu chứng & khoanh vùng FE hay BE

Hỏi/nắm rõ trước khi review sâu:
- Triệu chứng cụ thể là gì: load trang chậm, thao tác giật/lag, API response
  chậm, app đơ khi data lớn, memory tăng dần theo thời gian?
- Đã có số liệu đo chưa (Lighthouse score, response time p95/p99, query time)
  hay mới chỉ là cảm giác "chậm"?
- Vấn đề nằm ở đâu: chỉ render/UI phía client, chỉ ở server/API/database, hay
  cả hai (VD: server trả chậm → UI cũng cảm thấy chậm theo)?

**Nếu chưa rõ khoanh vùng** → hướng dẫn người dùng đo trước (Network tab xem
API mất bao lâu vs FE render mất bao lâu) rồi mới review sâu đúng phía.

---

## 2. Bảng phân biệt nhanh: Performance FE vs BE

| Khía cạnh | Frontend | Backend |
|---|---|---|
| Đơn vị đo chính | Core Web Vitals (LCP, INP, CLS), FPS, bundle size (KB) | Response time (p50/p95/p99), throughput (req/s), query time |
| Công cụ đo | Lighthouse, Chrome DevTools Performance tab, WebPageTest, React DevTools Profiler | APM (New Relic/Datadog), `EXPLAIN ANALYZE`, profiler (pprof, py-spy, JFR), load test (k6, JMeter) |
| Nguyên nhân điển hình | Bundle to, render thừa (re-render), ảnh không tối ưu, chặn main thread, không lazy load | N+1 query, thiếu index, không cache, connection pool cạn, thuật toán O(n²), lock/deadlock |
| Nơi tìm bug | Component tree, network waterfall, JS execution timeline | Query plan, database schema, service layer, external API call chain |

---

## 3. Checklist Performance Frontend

Đọc kỹ khi review, đánh giá theo từng nhóm:

### 3.1 Loading & Bundle
- Bundle size tổng có được tách code-splitting (route-based, component-based)
  không, hay load 1 file JS khổng lồ ban đầu?
- Có tree-shaking hiệu quả không (import cả thư viện chỉ để dùng 1 hàm)?
- Ảnh có dùng định dạng tối ưu (WebP/AVIF), lazy load (`loading="lazy"`),
  responsive `srcset` không?
- Có preload/prefetch cho resource quan trọng (font, critical CSS) không?
- Third-party script (analytics, chat widget...) có chặn render không?

### 3.2 Rendering & Runtime
- Re-render thừa: component cha re-render kéo theo toàn bộ con dù props không
  đổi (thiếu `memo`, `useMemo`, `useCallback` — hoặc dùng dư thừa gây phức tạp
  không cần thiết)?
- List dài (>~100 item) có virtualization (`react-window`, `react-virtual`)
  không, hay render hết DOM cùng lúc?
- Có tác vụ nặng (tính toán, parse JSON lớn) chạy trên main thread gây block
  UI không — nên đưa ra Web Worker?
- State management: state global có bị đặt sai chỗ gây re-render toàn cây
  không (VD: 1 state đổi mỗi giây nằm ở context gốc)?

### 3.3 Network (phía client)
- Có gọi API thừa (duplicate request, gọi lại khi không cần) không?
- Có dùng cache hợp lý (SWR/React Query, HTTP cache-control) không?
- Waterfall request: các API có gọi tuần tự dù có thể gọi song song không?

### 3.4 Memory
- Có memory leak: event listener/subscription/timer không được cleanup khi
  unmount không?
- Object lớn giữ reference không cần thiết (closure giữ state cũ) không?

### 3.5 Core Web Vitals (nếu là web app public-facing)
- **LCP** (Largest Contentful Paint) — phần tử lớn nhất load có nhanh không?
- **INP** (Interaction to Next Paint) — phản hồi thao tác người dùng có mượt
  không?
- **CLS** (Cumulative Layout Shift) — layout có bị nhảy do ảnh/font load sau
  không?

---

## 4. Checklist Performance Backend

### 4.1 Database & Query
- **N+1 query**: loop gọi query riêng cho từng item thay vì JOIN/batch load?
- Index: các cột dùng trong `WHERE`, `JOIN`, `ORDER BY` có index phù hợp
  không? Có index thừa gây chậm write không?
- Query có `SELECT *` khi chỉ cần vài cột không?
- Pagination: có dùng OFFSET lớn trên bảng nhiều dữ liệu (chậm dần theo
  offset) thay vì cursor-based pagination không?
- Transaction có giữ quá lâu (long-running transaction) gây lock contention
  không?

### 4.2 Caching
- Có cache ở tầng nào phù hợp chưa (application cache, Redis, CDN cho static/
  API response ít đổi)?
- Cache invalidation có đúng đắn không (dữ liệu cũ bị serve nhầm)?
- Cache stampede: nhiều request cùng lúc miss cache và cùng query nguồn gốc
  (cần lock/singleflight)?

### 4.3 Concurrency & Resource
- Connection pool (DB, HTTP client) có đủ lớn và có bị leak connection không?
- Có tác vụ nặng chạy đồng bộ trong request thay vì đưa vào queue/background
  job (email, export file, gọi API bên thứ 3 chậm)?
- Thuật toán có độ phức tạp cao bất thường (O(n²) trở lên) trên dữ liệu lớn
  không?

### 4.4 API & Scalability
- Response payload có quá lớn (trả thừa field không cần) không?
- Có rate limiting/circuit breaker cho dependency bên ngoài không, tránh
  cascading failure khi 1 service chậm kéo chậm cả hệ thống?
- Có hỗ trợ horizontal scaling không hay có state lưu local (in-memory
  session) gây không scale được?

---

## 5. Phân loại mức độ nghiêm trọng (Severity)

Dùng chung chuẩn P0–P3:
- **P0 — Blocker**: Hệ thống timeout/crash dưới tải thật, N+1 query gây sập
  DB, memory leak dẫn đến OOM.
- **P1 — Critical**: Chậm rõ rệt ảnh hưởng trải nghiệm chính (LCP >4s, API
  chính p95 >2s), re-render gây giật UI ở luồng dùng nhiều nhất.
- **P2 — Major**: Chưa cache chỗ nên cache, bundle to hơn cần thiết, thiếu
  index ở query ít dùng.
- **P3 — Minor**: Tối ưu nhỏ, micro-optimization không ảnh hưởng trải nghiệm
  thực tế.

**Lưu ý:** không chấm P0/P1 chỉ vì "về lý thuyết chưa tối ưu" — phải gắn với
tác động thực tế đo được hoặc suy luận rõ ràng từ dữ liệu/tải thật.

---

## 6. Cách kiểm chứng (không kết luận bằng cảm tính)

- **Frontend**: chạy Lighthouse (`lighthouse <url> --view`), mở Chrome
  DevTools Performance tab để record + phân tích flame chart, dùng React
  DevTools Profiler để xem re-render nào thừa, `next build`/bundle analyzer để
  xem breakdown bundle size.
- **Backend**: chạy `EXPLAIN ANALYZE` cho query nghi ngờ chậm, dùng profiler
  đúng ngôn ngữ (pprof cho Go, py-spy cho Python, async-profiler/JFR cho Java,
  clinic.js cho Node), load test bằng k6/JMeter để lấy số p95/p99 thật thay vì
  đoán.

Báo cáo review PHẢI nêu rõ: đã đo bằng công cụ gì, số liệu trước/sau (nếu có),
không chỉ liệt kê "có thể chậm vì...".

---

## 7. Ngôn ngữ & giọng văn

- Viết bằng tiếng Việt nếu người dùng dùng tiếng Việt, giữ nguyên thuật ngữ kỹ
  thuật tiếng Anh (LCP, N+1, connection pool...).
- Giọng văn khách quan, cụ thể, luôn kèm hướng đo/kiểm chứng và hướng sửa —
  không chỉ nêu vấn đề chung chung.
