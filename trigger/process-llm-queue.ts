import { task } from "@trigger.dev/sdk/v3";

/**
 * Processes one pending LLM queue entry. Runs on Trigger.dev (no Vercel timeout).
 * Called after each XP suggestion enqueue.
 * concurrencyLimit: 1 ensures only one apifreellm call at a time (rate limit).
 */
export const processLlmQueue = task({
	id: "process-llm-queue",
	queue: {
		concurrencyLimit: 1,
	},
	maxDuration: 60,
	run: async () => {
		const { tick } = await import("@pointwise/lib/llm/queue-service");
		const processed = await tick();
		return { processed };
	},
});
