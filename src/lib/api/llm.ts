"use client";

import { apiClient } from "./client";

const BASE = "/api/llm";

export interface SubmitLLMResponse {
	requestId: string;
}

export interface ResultLLMResponse {
	status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
	feature: string;
	result?: string;
	error?: string;
}

export const llmApi = {
	submit: (prompt: string, feature: string) =>
		apiClient.post<SubmitLLMResponse>(`${BASE}/submit`, { prompt, feature }),
	submitXpSuggestion: (taskId: string) =>
		apiClient.post<SubmitLLMResponse>(`${BASE}/submit-xp-suggestion`, {
			taskId,
		}),
	getResult: (requestId: string) =>
		apiClient.get<ResultLLMResponse>(`${BASE}/result/${requestId}`),
};
