// api/subscribe.js — MailerLite subscriber handler
// Nhận email + group từ diagnostic.html, gửi lên MailerLite API v3
// Env variables cần set trên Vercel:
//   MAILERLITE_API_KEY  — API key từ MailerLite
//   ML_GROUP_1  — Group ID nhóm 1: Cỗ Máy Không Tắt
//   ML_GROUP_2  — Group ID nhóm 2: Người Mang Bóng Tối
//   ML_GROUP_3  — Group ID nhóm 3: Nhà Tầm Nhìn
//   ML_GROUP_4  — Group ID nhóm 4: Tù Nhân Thành Công
//   ML_GROUP_5  — Group ID nhóm 5: Bản Vẽ Hoàn Hảo

const GROUP_MAP = {
  1: process.env.ML_GROUP_1,
  2: process.env.ML_GROUP_2,
  3: process.env.ML_GROUP_3,
  4: process.env.ML_GROUP_4,
  5: process.env.ML_GROUP_5,
};

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, group } = req.body;
  if (!email || !group) return res.status(400).json({ error: 'Missing email or group' });

  const groupId = GROUP_MAP[group];

  const payload = {
    email: email,
    fields: { archetype_group: String(group) },
  };
  if (groupId) payload.groups = [groupId];

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + process.env.MAILERLITE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error('MailerLite subscribe error:', err);
    return res.status(500).json({ error: 'Subscribe failed' });
  }
};
