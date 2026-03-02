// app/api/suggest-messages/route.ts
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const ai = new GoogleGenAI({});

export async function POST() {
  try {
    const prompt = `
    Generate exactly 3 friendly, light, open-ended questions for an anonymous messaging app.
    Rules:
    - Keep each question under 12 words
    - No heavy/philosophical topics (meaning of life, struggles, identity, trauma)
    - No personal/sensitive topics (health, relationships, politics, religion)
    - Use everyday topics (hobbies, food, movies, school, travel, music)
    - Output ONLY one line in this format: Q1 || Q2 || Q3
    `;

    // const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started? || If you could have dinner with any historical figure, who would it be? || What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const textStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const t = chunk.text ?? "";
            if (t) controller.enqueue(enc.encode(t));
          }
        } catch (e) {
          console.error("gemini stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e: any) {
    console.error("gemini suggest-messages error:", e);
    return Response.json(
      { success: false, message: e?.message || "Gemini request failed" },
      { status: 500 },
    );
  }
}
