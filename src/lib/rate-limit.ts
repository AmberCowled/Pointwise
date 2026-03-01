import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL ?? "",
	token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

const limiters = new Map<string, Ratelimit>();

function getLimiter(windowMs: number, max: number): Ratelimit {
	const key = `${windowMs}:${max}`;
	let limiter = limiters.get(key);
	if (!limiter) {
		limiter = new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
			prefix: "auth_rl",
		});
		limiters.set(key, limiter);
	}
	return limiter;
}

function getClientIp(req: Request): string {
	const forwarded = req.headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0].trim();
	return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Check rate limit for a request. Returns a 429 Response if rate limited,
 * or null if the request is allowed.
 */
export async function checkRateLimit(
	req: Request,
	config: { windowMs: number; max: number },
): Promise<Response | null> {
	const limiter = getLimiter(config.windowMs, config.max);
	const ip = getClientIp(req);
	const result = await limiter.limit(ip);

	if (!result.success) {
		const resetAt = Math.ceil(result.reset / 1000);
		const retryAfter = Math.max(1, resetAt - Math.floor(Date.now() / 1000));
		return Response.json(
			{ error: "Too many requests" },
			{
				status: 429,
				headers: {
					"Retry-After": String(retryAfter),
					"X-RateLimit-Limit": String(result.limit),
					"X-RateLimit-Remaining": String(result.remaining),
					"X-RateLimit-Reset": String(resetAt),
				},
			},
		);
	}

	return null;
}
