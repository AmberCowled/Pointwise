/**
 * Thin client for apifreellm API.
 * Free tier: 1 req/5s, API key required (sign in + Discord). Premium: opt-in via APIFREELLM_PREMIUM.
 */

const CHAT_ENDPOINT = "https://apifreellm.com/api/v1/chat";

const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// apifreellm returns { success, response, tier?, features? } or { error }
interface ApifreeLLMResponse {
	success?: boolean;
	response?: string;
	error?: string;
	tier?: string;
}

export async function callApifreeLLM(message: string): Promise<{
	success: boolean;
	response?: string;
	error?: string;
}> {
	const apiKey = process.env.APIFREELLM_API_KEY?.trim();
	if (!apiKey) {
		return {
			success: false,
			error:
				"APIFREELLM_API_KEY is required. Get a free key at apifreellm.com (sign in + join Discord).",
		};
	}

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
		"User-Agent": USER_AGENT,
		Authorization: `Bearer ${apiKey}`,
	};

	const body = JSON.stringify({ message });

	try {
		const res = await fetch(CHAT_ENDPOINT, {
			method: "POST",
			headers,
			body,
			signal: AbortSignal.timeout(60_000),
		});

		const text = await res.text();
		const contentType = res.headers.get("content-type") ?? "";

		if (!contentType.includes("application/json")) {
			const snippet = text.slice(0, 200).replace(/\s+/g, " ");
			return {
				success: false,
				error: `apifreellm returned ${res.status} (expected JSON, got ${contentType || "HTML"}). Often: rate limit (429), invalid key (401), or Cloudflare. Snippet: ${snippet}`,
			};
		}

		let data: ApifreeLLMResponse;
		try {
			data = JSON.parse(text) as ApifreeLLMResponse;
		} catch {
			return {
				success: false,
				error: `apifreellm returned invalid JSON (status ${res.status}). Body starts with: ${text.slice(0, 100)}`,
			};
		}

		if (data.success === true && typeof data.response === "string") {
			return { success: true, response: data.response };
		}

		return {
			success: false,
			error: data.error ?? "Unknown error from LLM API",
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : "Request failed";
		return { success: false, error: message };
	}
}
