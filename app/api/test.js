// pages/api/test.js

export default function handler(req, res) {
  console.log("Entered test.js handler. Method:", req.method);

  // 요청 메서드 확인
  if (req.method === 'POST') {
    console.log("POST body:", req.body);
    return res.status(200).json({ ok: true, method: req.method, body: req.body || null });
  }

  // POST가 아니면 405 반환
  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
