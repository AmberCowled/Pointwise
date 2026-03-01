import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { RateLimitAdapter, RateLimitResult } from "ertk/next";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL ?? "",
	token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

// Cache Ratelimit instances by windowMs+max to avoid recreating them
const instances = new Map<string, Ratelimit>();

function getInstance(windowMs: number, max: number): Ratelimit {
	const key = `${windowMs}:${max}`;
	let instance = instances.get(key);
	if (!instance) {
		instance = new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
			prefix: "ertk_rl",
		});
		instances.set(key, instance);
	}
	return instance;
}

export class UpstashRateLimitAdapter implements RateLimitAdapter {
	async check(
		key: string,
		windowMs: number,
		max: number,
	): Promise<RateLimitResult> {
		const limiter = getInstance(windowMs, max);
		const result = await limiter.limit(key);

		return {
			allowed: result.success,
			limit: result.limit,
			remaining: result.remaining,
			resetAt: Math.ceil(result.reset / 1000),
		};
	}
}
