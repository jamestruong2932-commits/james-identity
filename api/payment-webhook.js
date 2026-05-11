const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined) {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      resolve(raw);
      return;
    }
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// SePay: sign "{timestamp}.{rawBody}" with HMAC-SHA256
function verifySignature(rawBody, timestamp, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(timestamp + '.' + rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function extractOrderCode(content) {
  const match = (content || '').match(/QT-\d+/);
  return match ? match[0] : null;
}

async function addToMailerLite(email, password) {
  const groupId = process.env.ML_GROUP_BUYERS;
  const loginUrl = (process.env.SITE_URL || 'https://www.youridentity.com.vn') + '/academy';

  const payload = { email, fields: { password, login_url: loginUrl } };
  if (groupId) payload.groups = [groupId];

  const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.MAILERLITE_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) console.error('MailerLite error:', await res.text());
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);

  // Verify SePay HMAC-SHA256 signature
  const secret = process.env.SEPAY_SECRET;
  if (secret) {
    const signature = req.headers['x-sepay-signature'] || '';
    const timestamp = req.headers['x-sepay-timestamp'] || '';

    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!timestamp || age > 300) {
      console.warn('SePay timestamp missing or expired:', timestamp);
      return res.status(401).json({ error: 'Request expired' });
    }

    if (!verifySignature(rawBody, timestamp, signature, secret)) {
      console.warn('Invalid SePay HMAC signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const body = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
  const { content, transferType } = body;

  if (transferType !== 'in') return res.status(200).json({ ok: true });

  const order_code = extractOrderCode(content);
  if (!order_code) return res.status(200).json({ ok: true });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: orders, error: fetchErr } = await supabase
    .from('orders')
    .select('email')
    .eq('order_code', order_code)
    .eq('status', 'pending')
    .limit(1);

  if (fetchErr || !orders || orders.length === 0) {
    console.log('Order not found or already processed:', order_code);
    return res.status(200).json({ ok: true });
  }

  const { email } = orders[0];
  const password = Math.random().toString(36).slice(-8);

  const { error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authErr && authErr.message !== 'User already registered') {
    console.error('Supabase createUser error:', authErr);
    return res.status(500).json({ error: 'Could not create user' });
  }

  await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('order_code', order_code);

  await addToMailerLite(email, password);

  return res.status(200).json({ ok: true });
};
