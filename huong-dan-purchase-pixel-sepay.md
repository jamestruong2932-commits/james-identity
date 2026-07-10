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
      }, { eventID: 'purchase_' + orderId }); // eventID dùng để dedup với CAPI ở mục 4
      localStorage.setItem(key, '1');
    }
  })();
</script>
```

Bắt buộc phải có phần chặn bắn trùng (`localStorage` theo `orderId`) vì màn hình polling
có thể re-render nhiều lần hoặc người dùng reload trang thành công — nếu không chặn, một
đơn hàng sẽ bị đếm thành nhiều Purchase, làm sai lệch dữ liệu tối ưu quảng cáo.

**4. Conversions API (CAPI) — bắn Purchase từ server, làm song song với client pixel**

Vì SePay xác nhận qua webhook server-side, đây là chỗ lý tưởng để bắn Purchase đáng tin
cậy nhất — không phụ thuộc trình duyệt còn mở hay không, không bị ad-blocker/Safari ITP
chặn như pixel client-side (client pixel thường mất 20–30% data thực tế).

**4.1. Lấy Access Token**
Meta Events Manager → chọn đúng Pixel (`37029946209982129`) → tab **Settings** →
mục **Conversions API** → "Generate access token" (token dài hạn, không hết hạn trừ khi
tự thu hồi). Lưu token này vào biến môi trường server, ví dụ `META_CAPI_TOKEN` — **tuyệt
đối không hardcode trong code, không để lộ ở client-side.**

**4.2. Gọi API ngay trong webhook handler SePay**, chỗ code đang xử lý sự kiện "đã nhận
tiền" — cùng chỗ mà bạn cập nhật trạng thái đơn hàng thành `paid` trong database. Ví dụ
Node.js (điều chỉnh theo cú pháp thật của handler webhook SePay hiện có):

```js
const crypto = require('crypto');

function sha256(value) {
  if (!value) return undefined;
  return crypto.createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex');
}

async function sendPurchaseToMeta({ orderId, amount, customerEmail, customerPhone, pageUrl }) {
  const pixelId = '37029946209982129';
  const accessToken = process.env.META_CAPI_TOKEN;

  const eventId = 'purchase_' + orderId; // PHẢI khớp eventID dùng ở client pixel (mục 3) để dedup

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: pageUrl,
        user_data: {
          em: [sha256(customerEmail)].filter(Boolean),
          ph: [sha256(customerPhone)].filter(Boolean),
        },
        custom_data: {
          value: amount,
          currency: 'VND',
          content_ids: [orderId],
          order_id: orderId,
        },
      },
    ],
    // test_event_code: 'TESTxxxx', // chỉ thêm khi đang test qua Events Manager > Test Events
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  const json = await res.json();
  console.log('Meta CAPI response:', json);
  return json;
}
```

Gọi hàm này ngay sau khi webhook SePay xác nhận đơn `paid`:
```js
await sendPurchaseToMeta({
  orderId: order.id,
  amount: order.total,
  customerEmail: order.email,   // nếu có thu thập
  customerPhone: order.phone,   // nếu có thu thập
  pageUrl: 'https://quantumrebirth.io.vn/thank-you',
});
```

**4.3. Deduplication với client pixel — bắt buộc nếu làm cả hai**
Nếu bước 3 (client-side pixel) và bước 4 (CAPI) cùng bắn Purchase cho cùng một đơn, Meta
sẽ đếm thành 2 lượt mua trừ khi bạn dùng **chung `event_id`/`eventID`** ở cả hai nơi —
xem `eventID: 'purchase_' + orderId` ở mục 3 và `event_id` ở mục 4.2, phải khớp công thức
với nhau. Meta tự động nhận diện và gộp làm một khi trùng event_id trong vòng 48 giờ.

**4.4. Test CAPI riêng trước khi nối vào webhook thật**
Vào Events Manager → Test Events → lấy `test_event_code` (dạng `TESTxxxxx`) → thêm tạm
vào payload (`test_event_code: 'TESTxxxxx'`) → gọi thử hàm `sendPurchaseToMeta` với dữ
liệu giả → xác nhận event xuất hiện trong tab Test Events với đúng giá trị. Xóa dòng
`test_event_code` trước khi lên production.

**5. Test:**
- Cài Meta Pixel Helper (Chrome extension).
- Tạo một đơn test (SePay có môi trường sandbox không? nếu không, dùng giao dịch thật giá
  trị nhỏ), đi hết luồng quét QR → chờ webhook xác nhận → xác nhận Purchase fire đúng 1
  lần với giá trị đúng (kiểm tra cả client pixel lẫn CAPI nếu làm cả hai — trong Events
  Manager sẽ thấy nhãn "Deduplicated" nếu ghép đúng).
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

Kết hợp client pixel (mục 3) + server CAPI (mục 4) với chung `event_id` cho **độ chính
xác cao nhất**: CAPI không mất data do ad-blocker, client pixel giúp Meta match được
browser/cookie signal để targeting tốt hơn — hai bên bổ sung cho nhau, không thay thế.
