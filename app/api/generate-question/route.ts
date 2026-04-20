import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a quiz question generator. Generate a single quiz question based on the user's topic/instructions.
You must respond ONLY with a valid JSON object — no markdown, no backticks, no explanation.

The JSON must follow this exact shape:
{
  "text": "string — the question text",
  "hint": "string or null",
  "questionType": "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE",
  "points": number (1–20),
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "code": "string or null — optional code snippet if relevant",
  "answers": [
    { "text": "string", "correct": boolean }
  ]
}

Rules:
- answers must have at least 2 items
- at least 1 answer must be correct
- SINGLE_CHOICE: exactly 1 correct answer
- MULTIPLE_CHOICE: 2+ correct answers allowed
- TRUE_FALSE: exactly 2 answers: "True" and "False"`;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile", // free + very capable
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" }, // forces clean JSON like Gemini's responseMimeType
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    return NextResponse.json(
      { error: data.error?.message ?? "Groq error" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}