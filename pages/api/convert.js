// pages/api/convert.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Only POST is supported." });
  }

  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Please provide a valid text string in request body." });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable.");
      return res.status(500).json({ error: "Server configuration error: API key is missing." });
    }

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "입력된 문장을 공손한 이메일 어투로 바꿔줘. 불필요한 설명은 하지 마." },
        { role: "user", content: text }
      ],
      max_tokens: 120,
      temperature: 0.7
    };

    // 내장 fetch 사용
    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("OpenAI API responded with error:", errorText);
      return res.status(apiResponse.status).json({ error: "OpenAI API call failed." });
    }

    const data = await apiResponse.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    return res.status(200).json({ result });

  } catch (error) {
    console.error("Exception during API handling:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
