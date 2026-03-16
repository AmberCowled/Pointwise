import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const cspDirectives = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' blob: data: https://lh3.googleusercontent.com https://utfs.io https://*.utfs.io https://ufs.sh https://*.ufs.sh",
	"font-src 'self'",
	"connect-src 'self' https://realtime.ably.io https://rest.ably.io https://*.ably.io https://*.ably.net wss://realtime.ably.io wss://*.ably.io wss://*.ably.net https://ingest.uploadthing.com https://*.uploadthing.com",
	"worker-src 'self'",
	"frame-ancestors 'none'",
	"form-action 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"upgrade-insecure-requests",
];

const securityHeaders = [
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
	},
	...(isProd
		? [
				{
					key: "Content-Security-Policy",
					value: cspDirectives.join("; "),
				},
				{
					key: "Strict-Transport-Security",
					value: "max-age=63072000; includeSubDomains; preload",
				},
			]
		: []),
];

const nextConfig: NextConfig = {
	reactCompiler: true,
	allowedDevOrigins: ["http://192.168.0.*:3000", "http://localhost:3000"],

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "utfs.io",
				port: "",
			},
			{
				protocol: "https",
				hostname: "*.utfs.io",
				port: "",
			},
			{
				protocol: "https",
				hostname: "ufs.sh",
			},
			{
				protocol: "https",
				hostname: "*.ufs.sh",
			},
			// Development localhost support
			{
				protocol: "http",
				hostname: "localhost",
			},
			{
				protocol: "https",
				hostname: "localhost",
			},
		],
	},

	async headers() {
		return [
			{
				source: "/(.*)",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
