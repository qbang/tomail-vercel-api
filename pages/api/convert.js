// pages/api/convert.js

// 서버 사이드에서만 실행되므로 require 방식도 괜찮습니다.
const fetch = require("node‑fetch");  // 혹은 require("node-fetch"); 하이픈 꼭 일반 문자로!

export default async function handler(req, res) {
  // POST 요청만 처리
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, POST만 지원합니다." });
  }

  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text 필드가 문자열로 필요합니다." });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY 환경변수");
      return res.status(500).json({ error: "서버 설정 오류: API 키가 없습니다." });
    }

    const payload = {
      model: "gpt‑4o‑mini",
      messages: [
        { role: "system", content: "입력된 문장을 공손한 이메일 어투로 바꿔줘. 불필요한 설명은 하지 마." },
        { role: "user", content: text }
      ],
      max_tokens: 120,
      temperature: 0.7
    };

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("OpenAI API 응답 오류:", errText);
      return res.status(apiRes.status).json({ error: "OpenAI API 호출 실패" });
    }

    const data = await apiRes.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    return res.status(200).json({ result });

  } catch (err) {
    console.error("API 처리 중 예외 발생:", err);
    return res.status(500).json({ error: "서버 내부 오류" });
  }
}
