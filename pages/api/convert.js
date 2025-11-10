// backend/pages/api/convert.js

// 만약 node‑fetch 설치했다면 import 가능
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "텍스트를 입력해주세요." });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY가 설정되지 않았습니다.");
    return res.status(500).json({ error: "서버 설정 오류" });
  }

  try {
    const payload = {
      model: "gpt‑4o‑mini",
      messages: [
        {
          role: "system",
          content: "입력된 문장을 공손한 이메일 어투로 바꿔줘. 불필요한 설명은 하지 마."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 120,
      temperature: 0.7
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API 오류:", errorText);
      return res.status(response.status).json({ error: "OpenAI API 호출 실패" });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    return res.status(200).json({ result });
  } catch (err) {
    console.error("API 호출 중 오류:", err);
    return res.status(500).json({ error: "서버 내부 오류" });
  }
}
