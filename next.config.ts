import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// CSP is handled per-request via nonce in src/middleware.ts.
// Only static security headers remain here.
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
