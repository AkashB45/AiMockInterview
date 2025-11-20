export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.GENERATIVE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing GENERATIVE_API_KEY" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GENERATIVE_MODEL || "chat-bison";

    const model = genAI.getGenerativeModel({ model: modelName });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ];

    const chatSession = model.startChat({ generationConfig, safetySettings });
    const result = await chatSession.sendMessage(prompt);
    const text = (await result.response.text()) || "";

    if (!text || text.trim() === "") {
      console.error("/api/generate: model returned empty response", { model: modelName });
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    return NextResponse.json({ output: text });
  } catch (err) {
    console.error("/api/generate error:", err && err.message ? err.message : err);
    const msg = err && err.message ? err.message : String(err);
    // If the error suggests listing models, attempt to return available models to help debugging
    let models = null;
    try {
      if (typeof genAI.listModels === "function") {
        models = await genAI.listModels();
      }
    } catch (listErr) {
      console.error("listModels failed:", listErr && listErr.message ? listErr.message : listErr);
      models = { error: listErr && listErr.message ? listErr.message : String(listErr) };
    }
    return NextResponse.json({ error: msg, models }, { status: 500 });
  }
}
