const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, phone } = req.body;
  if (!email || !phone) return res.status(400).json({ error: 'Missing email or phone' });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const order_code = 'QT-' + Date.now();

  const { error } = await supabase.from('orders').insert({
    order_code,
    email,
    phone,
    status: 'pending',
  });

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: 'Could not create order' });
  }

  return res.status(200).json({ order_code });
};
