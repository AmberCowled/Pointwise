import Ably from "ably";

let restClient: Ably.Rest | null = null;

const getRestClient = () => {
	if (restClient) {
		return restClient;
	}
	const apiKey = process.env.ABLY_API_KEY;
	if (!apiKey) {
		return null;
	}
	restClient = new Ably.Rest({ key: apiKey });
	return restClient;
};

const RETRY_DELAY_MS = 200;

/** Delay helper for retry logic. */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Publish a single event to a single channel. Retries once on failure.
 */
export const publishAblyEvent = async (
	channelName: string,
	eventName: string,
	payload: Record<string, unknown>,
	extras?: Record<string, unknown>,
) => {
	const client = getRestClient();
	if (!client) {
		return;
	}

	const message = {
		name: eventName,
		data: payload,
		...(extras ? { extras } : {}),
	};

	try {
		await client.channels.get(channelName).publish(message);
	} catch (_err) {
		// Retry once after a short delay
		await delay(RETRY_DELAY_MS);
		try {
			await client.channels.get(channelName).publish(message);
		} catch (retryErr) {
			console.warn(
				`[ably] Failed to publish to ${channelName} after retry`,
				retryErr,
			);
		}
	}
};

/**
 * Publish the same event to multiple channels in a single batch request.
 * Falls back to individual publishes if the batch API is not available.
 * Retries once on failure.
 */
export const publishAblyBatch = async (
	channelNames: string[],
	eventName: string,
	payload: Record<string, unknown>,
	extras?: Record<string, unknown>,
) => {
	const client = getRestClient();
	if (!client) {
		return;
	}

	if (channelNames.length === 0) return;

	const message = {
		name: eventName,
		data: payload,
		...(extras ? { extras } : {}),
	};

	// Use Ably's batch publish: publish the same message to multiple channels
	const batchSpec = {
		channels: channelNames,
		messages: [message],
	};

	const publishBatch = async () => {
		await client.request("POST", "/messages", 2, {}, batchSpec);
	};

	try {
		await publishBatch();
	} catch (_err) {
		// Retry once after a short delay
		await delay(RETRY_DELAY_MS);
		try {
			await publishBatch();
		} catch (retryErr) {
			// Batch API failed twice — fall back to individual publishes
			console.warn(
				`[ably] Batch publish failed, falling back to individual publishes for ${channelNames.length} channels`,
				retryErr,
			);
			const results = await Promise.allSettled(
				channelNames.map((ch) => client.channels.get(ch).publish(message)),
			);
			const failures = results.filter((r) => r.status === "rejected");
			if (failures.length > 0) {
				console.warn(
					`[ably] ${failures.length}/${channelNames.length} individual publishes failed`,
				);
			}
		}
	}
};
