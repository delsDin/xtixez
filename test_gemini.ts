import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Quelles sont les dernières actualités sur React ?",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log("SUCCESS:", response.text);
  } catch (e: any) {
    console.error("ERROR:");
    console.error(e.message || e);
    if (e.status) console.error("Status:", e.status);
    if (e.error) console.error("Inner error:", JSON.stringify(e.error, null, 2));
  }
}
test();
