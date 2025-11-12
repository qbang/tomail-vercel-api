export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Please provide a valid text string in request body." }),
        { status: 400 }
      );
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable.");
      return new Response(
        JSON.stringify({ error: "Server configuration error: API key is missing." }),
        { status: 500 }
      );
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

    // OpenAI API 호출
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
      return new Response(
        JSON.stringify({ error: "OpenAI API call failed.", details: errorText }),
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ result }), { status: 200 });

  } catch (error) {
    console.error("Exception during API handling:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500 }
    );
  }
}

// GET 요청은 허용하지 않음
export async function GET() {
  return new Response(
    JSON.stringify({ error: "Method GET Not Allowed" }),
    { status: 405, headers: { Allow: 'POST' } }
  );
}
