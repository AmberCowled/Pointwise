"use client";

import { useCallback, useState } from "react";
import BrandHeader from "../general/BrandHeader";
import BackgroundGlow from "../ui/BackgroundGlow";
import { Card } from "../ui/Card";
import { Divider } from "../ui/Divider";
import { Spinner } from "../ui/Spinner";
import { Tabs } from "../ui/Tabs";
import AuthForm from "./AuthForm";
import SocialAuthButtons from "./SocialAuthButtons";
import type { AuthTab } from "./types";
import WelcomeBlock from "./WelcomeBlock";

const AUTH_TABS = [
	{ id: "signin", label: "Sign In" },
	{ id: "signup", label: "Sign Up" },
];

const COPYRIGHT_YEAR = new Date().getFullYear();

export default function AuthPage() {
	const [tab, setTab] = useState<AuthTab>("signin");
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [isSocialLoading, setIsSocialLoading] = useState(false);

	const isLoading = isFormLoading || isSocialLoading;

	const handleTabChange = useCallback((value: string) => {
		setTab(value as AuthTab);
	}, []);

	const handleFormLoadingChange = useCallback((loading: boolean) => {
		setIsFormLoading(loading);
	}, []);

	const handleSocialLoadingChange = useCallback((loading: boolean) => {
		setIsSocialLoading(loading);
	}, []);

	return (
		<div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
			<BackgroundGlow />
			<div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
				<BrandHeader className="mb-8" />
				<WelcomeBlock tab={tab} />
				<main className="w-full">
					<Card variant="primary" responsivePadding>
						<Tabs items={AUTH_TABS} value={tab} onChange={handleTabChange} />
						<div className="relative min-h-[400px]">
							{isLoading ? (
								<div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
									<Spinner size="lg" variant="primary" type="circular" />
									<p className="text-sm font-medium text-zinc-300">
										{isSocialLoading
											? "Logging In..."
											: tab === "signin"
												? "Logging In..."
												: "Signing Up..."}
									</p>
								</div>
							) : null}
							<div className={isLoading ? "invisible" : ""}>
								<AuthForm tab={tab} onLoadingChange={handleFormLoadingChange} />
								<Divider label="or" spacing="md" />
								<SocialAuthButtons onLoadingChange={handleSocialLoadingChange} />
							</div>
						</div>
					</Card>

					<p className="mt-6 text-sm text-zinc-400 leading-relaxed">
						Join the millions of productive users who benefit from our Pointwise gamified
						productivity app. Log in to access your personalised dashboard, track your tasks and
						have fun being productive.
					</p>

					<footer className="mt-10 text-xs text-zinc-500">
						© {COPYRIGHT_YEAR} Amber Cowled. All rights reserved.
					</footer>
				</main>
			</div>
		</div>
	);
}
