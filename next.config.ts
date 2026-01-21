import type { NextConfig } from "next";

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
		],
	},
};

export default nextConfig;
