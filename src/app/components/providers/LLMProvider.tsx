"use client";

import { llmApi } from "@pointwise/lib/api/llm";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
export interface LLMResult {
	status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
	feature: string;
	result?: string;
	error?: string;
}

export interface LLMQueueContextValue {
	submit: (params: { prompt: string; feature: string }) => Promise<string>;
	pendingRequestIds: string[];
	getResult: (requestId: string) => LLMResult | undefined;
	isPolling: boolean;
}

const STORAGE_KEY = "pointwise_llm_queue";
const POLL_INTERVAL_MS = 5_000;

function loadPendingFromStorage(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as { requestIds?: string[] };
		return Array.isArray(parsed?.requestIds) ? parsed.requestIds : [];
	} catch {
		return [];
	}
}

function savePendingToStorage(requestIds: string[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ requestIds }));
	} catch {
		// ignore
	}
}

export const LLMQueueContext = createContext<LLMQueueContextValue | null>(null);

export function LLMProvider({ children }: { children: React.ReactNode }) {
	const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]);
	const [results, setResults] = useState<Map<string, LLMResult>>(new Map());
	const [isPolling, setIsPolling] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const removePending = useCallback((requestId: string) => {
		setPendingRequestIds((prev) => {
			const next = prev.filter((id) => id !== requestId);
			savePendingToStorage(next);
			return next;
		});
	}, []);

	const addPending = useCallback((requestId: string) => {
		setPendingRequestIds((prev) => {
			if (prev.includes(requestId)) return prev;
			const next = [...prev, requestId];
			savePendingToStorage(next);
			return next;
		});
	}, []);

	const poll = useCallback(async () => {
		const ids = loadPendingFromStorage();
		if (ids.length === 0) return;

		try {
			await llmApi.tick();
		} catch {
			// Tick can fail (auth, network). Continue to poll results.
		}

		for (const requestId of ids) {
			try {
				const res = await llmApi.getResult(requestId);
				setResults((prev) => {
					const next = new Map(prev);
					next.set(requestId, {
						status: res.status,
						feature: res.feature,
						result: res.result,
						error: res.error,
					});
					return next;
				});
				if (res.status === "DONE" || res.status === "FAILED") {
					removePending(requestId);
				}
			} catch {
				// Skip this request on error, will retry next poll
			}
		}
	}, [removePending]);

	useEffect(() => {
		const initial = loadPendingFromStorage();
		if (initial.length > 0) {
			setPendingRequestIds(initial);
		}
	}, []);

	useEffect(() => {
		if (pendingRequestIds.length === 0) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			setIsPolling(false);
			return;
		}
		setIsPolling(true);
		poll();
		intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [pendingRequestIds.length, poll]);

	const submit = useCallback(
		async (params: { prompt: string; feature: string }): Promise<string> => {
			const res = await llmApi.submit(params.prompt, params.feature);
			addPending(res.requestId);
			return res.requestId;
		},
		[addPending],
	);

	const getResult = useCallback(
		(requestId: string): LLMResult | undefined => {
			return results.get(requestId);
		},
		[results],
	);

	const value: LLMQueueContextValue = {
		submit,
		pendingRequestIds,
		getResult,
		isPolling,
	};

	return (
		<LLMQueueContext.Provider value={value}>
			{children}
		</LLMQueueContext.Provider>
	);
}
