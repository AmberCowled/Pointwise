"use client";

import { LLMQueueContext } from "@pointwise/app/components/providers/LLMProvider";
import { useContext } from "react";

export type {
	LLMQueueContextValue,
	LLMResult,
} from "@pointwise/app/components/providers/LLMProvider";

export function useLLMQueue() {
	const ctx = useContext(LLMQueueContext);
	if (!ctx) {
		throw new Error("useLLMQueue must be used within LLMProvider");
	}
	return ctx;
}
