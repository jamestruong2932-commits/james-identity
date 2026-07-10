# Hướng dẫn thêm Meta Pixel Purchase event (SePay) — dán cho Claude bên quantumrebirth.io.vn

Dán nguyên văn phần dưới cho Claude Code đang chạy trên repo của quantumrebirth.io.vn.

---

## Prompt để dán

Tôi cần thêm Meta Pixel Purchase event vào trang bán hàng này (quantumrebirth.io.vn).

**Bối cảnh:** Trang này là bước cuối trong phễu funnel — người dùng làm quiz chẩn đoán ở
một site khác (james identity portal), được retarget sang đây để mua Quantum Rebirth OS.
Site portal kia đã có Meta Pixel base code (PageView) + Lead + InitiateCheckout event,
dùng Pixel ID: `37029946209982129`. Trang này cần dùng ĐÚNG Pixel ID đó để dữ liệu đổ về
chung một chỗ, tối ưu quảng cáo.

**Cổng thanh toán ở đây là SePay** — lưu ý điểm khác biệt quan trọng so với VNPay/MoMo:
SePay xác nhận thanh toán qua **webhook server-side** (SePay phát hiện giao dịch chuyển
khoản khớp nội dung/mã đơn, rồi gọi webhook về server của bạn để báo "đã nhận tiền").
Không có bước redirect người dùng về từ cổng thanh toán như VNPay. Do đó frontend thường
hiển thị màn hình QR + polling (gọi API kiểm tra trạng thái đơn mỗi vài giây) cho đến khi
server xác nhận đã nhận tiền, rồi mới chuyển sang màn hình "thanh toán thành công".

### Việc cần làm

**1. Kiểm tra/thêm Meta Pixel base code** vào `<head>` của mọi trang (nếu chưa có):

```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '37029946209982129');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=37029946209982129&ev=PageView&noscript=1"
/></noscript>
```

**2. Tìm đúng điểm "thanh toán thành công thật"** trong code — thường là:
- Hàm xử lý kết quả polling khi API trả về `status: "paid"` / `"success"` (gọi từ
  frontend, lặp lại mỗi 2–5 giây sau khi hiện QR SePay), HOẶC
- Trang/route "thank-you" chỉ được điều hướng tới SAU KHI polling xác nhận thành công
  (không phải trang hiện QR, không phải khi vừa tạo đơn).

**3. Thêm Purchase event tại đúng điểm đó, có chặn bắn trùng:**

```html
<script>
  (function() {
    var orderId = /* mã đơn hàng / mã giao dịch SePay, lấy từ biến có sẵn */;
    var key = 'fb_purchase_tracked_' + orderId;
    if (orderId && !localStorage.getItem(key)) {
      fbq('track', 'Purchase', {
        value: /* giá trị đơn hàng thật, lấy từ biến có sẵn, không hardcode */,
        currency: 'VND'
      });
      localStorage.setItem(key, '1');
    }
  })();
</script>
```

Bắt buộc phải có phần chặn bắn trùng (`localStorage` theo `orderId`) vì màn hình polling
có thể re-render nhiều lần hoặc người dùng reload trang thành công — nếu không chặn, một
đơn hàng sẽ bị đếm thành nhiều Purchase, làm sai lệch dữ liệu tối ưu quảng cáo.

**4. Khuyến nghị nâng cao (làm nếu có thời gian):** Vì SePay đã xác nhận qua webhook
server-side, cách đáng tin cậy nhất là bắn Purchase từ **server** (Meta Conversions API)
ngay trong handler xử lý webhook SePay — không phụ thuộc vào việc trình duyệt người dùng
có còn mở tab hay không, và không bị ad-blocker chặn như pixel client-side. Nếu làm cả
hai (client pixel + server CAPI), cần dùng chung `event_id` để Meta tự loại trùng
(deduplication) — hỏi tôi nếu cần hướng dẫn chi tiết phần CAPI này.

**5. Test:**
- Cài Meta Pixel Helper (Chrome extension).
- Tạo một đơn test (SePay có môi trường sandbox không? nếu không, dùng giao dịch thật giá
  trị nhỏ), đi hết luồng quét QR → chờ webhook xác nhận → xác nhận Purchase fire đúng 1
  lần với giá trị đúng.
- Reload lại trang thành công sau khi đã fire — xác nhận KHÔNG fire thêm lần nữa.

**6. Báo lại:** đã thêm ở file/route nào, cách hệ thống nhận diện "đã thanh toán" ở đây
hoạt động ra sao (polling endpoint tên gì, biến chứa orderId/giá trị tên gì), để xác nhận
logic đúng.

---

## Vì sao quan trọng

Đây là event **quan trọng nhất trong toàn phễu** — không có Purchase chuẩn, tối ưu quảng
cáo. Vì SePay xác nhận qua webhook (không redirect), điểm dễ sai nhất là gắn Purchase vào
lúc *tạo đơn* hoặc *hiện QR* thay vì lúc *xác nhận đã nhận tiền* — sẽ đếm cả đơn chưa
thanh toán, khiến Meta tối ưu sai đối tượng.

---

## Đã triển khai (báo cáo)

Pixel ID dùng chung: `37029946209982129`

**1. Base Pixel code** — `index.html` (`<head>`). Fire `PageView` mỗi lần trang load
(SPA React, một `index.html` duy nhất).

**2. InitiateCheckout** — `src/components/Checkout.jsx`, fire khi component Checkout
mount (`useEffect`). Trigger: user bấm 1 trong 3 CTA chính (Hero / Pricing / Guarantee)
và vào trang checkout. `value: 1790000`, `currency: 'VND'`.

**3. Purchase — đã đổi cách làm giữa chừng.** Ban đầu thử fire ở client trong
`ThankYou.jsx`, nhưng đã gỡ bỏ vì trang "cảm ơn" hiện ra ngay khi khách **tự bấm "Tôi đã
chuyển khoản"** — tự khai báo, chưa phải xác nhận tiền đã vào tài khoản thật. Đúng cái
bẫy mục "Vì sao quan trọng" cảnh báo ở trên.

Đã chuyển sang **server-side qua Meta Conversions API (CAPI)**:
- File mới `api/_meta-capi.js` — hàm `sendMetaPurchase()`, hash SHA-256 email/phone theo
  chuẩn Meta trước khi gửi.
- Gọi tại `api/sepay-webhook.js` và `api/payment-webhook.js`, ngay sau dòng cập nhật
  `orders.status = 'completed'` — đúng lúc SePay xác nhận đã nhận tiền qua webhook.
- `value: 1790000`, `content_ids: [order_code]`, `event_id: order_code` (dedup nếu sau
  này bật thêm pixel client).
- Chống bắn trùng: webhook chỉ xử lý đơn có `status='pending'`; nếu SePay gọi lại webhook
  cho cùng giao dịch, đơn đã `completed` nên bị bỏ qua tự động — không cần localStorage.

**4. Cách hệ thống nhận diện "đã thanh toán"** — không có polling/redirect như VNPay.
SePay phát hiện giao dịch khớp mã đơn (`QT-<timestamp>`) + đúng số tiền → gọi webhook →
server verify chữ ký HMAC → cập nhật Supabase `orders.status = 'completed'` → tạo tài
khoản học viên → gửi email MailerLite → gửi `Purchase` lên Meta CAPI.

Ghi chú kỹ thuật: hiện có **2 webhook handler gần như trùng nhau**
(`api/sepay-webhook.js` và `api/payment-webhook.js`) — đã thêm CAPI vào cả hai vì chưa
xác định chắc SePay dashboard đang trỏ endpoint nào. Cần đội vận hành xác nhận URL nào
đang thật sự nhận webhook từ SePay để dọn bớt file dư thừa.

**5. Token & deploy** — `META_CAPI_ACCESS_TOKEN` đã thêm vào Vercel Environment
Variables, đã deploy thủ công.

**6. Còn cần làm để xác nhận hoạt động đúng:**
- [ ] Tạo 1 đơn test, đi hết luồng quét QR → chờ SePay gọi webhook → kiểm tra Meta Events
      Manager → tab Test Events → xác nhận `Purchase` fire đúng 1 lần, đúng giá trị, đúng
      `order_code`.
- [ ] Cài Meta Pixel Helper (Chrome) để verify `PageView` + `InitiateCheckout` fire đúng
      lúc trên trình duyệt.
- [ ] Xác nhận với đội portal rằng Pixel ID `37029946209982129` không bị trùng định nghĩa
      event giữa 2 funnel (site portal đã có Lead + InitiateCheckout riêng).
- [ ] Xác nhận webhook endpoint nào (`sepay-webhook` hay `payment-webhook`) là endpoint
      thật SePay đang gọi.
