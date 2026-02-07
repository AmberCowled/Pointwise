/**
 * Thin client for Google Gemini API (free tier).
 * Uses gemini-3-flash-preview. Get a free key at https://aistudio.google.com/apikey
 */

import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3-flash-preview";
const TIMEOUT_MS = 60_000;

export async function callGemini(prompt: string): Promise<{
	success: boolean;
	response?: string;
	error?: string;
}> {
	const apiKey = process.env.GEMINI_API_KEY?.trim();
	if (!apiKey) {
		return {
			success: false,
			error:
				"GEMINI_API_KEY is required. Get a free key at https://aistudio.google.com/apikey",
		};
	}

	const ai = new GoogleGenAI({ apiKey });

	try {
		const response = await Promise.race([
			ai.models.generateContent({ model: MODEL, contents: prompt }),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("Request timed out")), TIMEOUT_MS),
			),
		]);

		const text = response.text;
		if (typeof text === "string" && text.length > 0) {
			return { success: true, response: text };
		}

		return {
			success: false,
			error: "Gemini returned empty response",
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : "Request failed";
		return { success: false, error: message };
	}
}
