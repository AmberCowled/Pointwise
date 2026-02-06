import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import "./globals.css";
import { LLMProviderWrapper } from "./components/providers/LLMProviderWrapper";
import { NotificationProviderWrapper } from "./components/providers/NotificationProviderWrapper";
import { SessionProviderWrapper } from "./components/providers/SessionProviderWrapper";
import { ModalProvider } from "./components/ui/modal";
import { StoreProvider } from "./StoreProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Pointwise",
	description:
		"Transform task management into an engaging experience with XP, levels, and team collaboration. Create projects, track tasks, earn experience points, and level up your productivity.",
	keywords: [
		"productivity",
		"task management",
		"gamification",
		"team collaboration",
		"project management",
		"XP system",
		"dashboard",
	],
	authors: [{ name: "Amber Cowled" }],
	creator: "Amber Cowled",
	openGraph: {
		title: "Pointwise",
		description:
			"Transform task management into an engaging experience with XP, levels, and team collaboration.",
		type: "website",
	},
	twitter: {
		title: "Pointwise",
		description:
			"Transform task management into an engaging experience with XP, levels, and team collaboration.",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
				<SessionProviderWrapper>
					<StoreProvider>
						<ModalProvider>
							<NotificationProviderWrapper>
								<LLMProviderWrapper>{children}</LLMProviderWrapper>
							</NotificationProviderWrapper>
						</ModalProvider>
					</StoreProvider>
				</SessionProviderWrapper>
			</body>
		</html>
	);
}
