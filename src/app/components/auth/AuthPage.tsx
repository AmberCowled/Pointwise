"use client";

import { useCallback, useState } from "react";
import BrandHeader from "../general/BrandHeader";
import Container from "../ui/Container";
import { Divider } from "../ui/Divider";
import Page from "../ui/Page";
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
		<Page height="full" width="full">
			<Container
				direction="vertical"
				className="items-center justify-center min-h-screen"
			>
				<Container
					direction="vertical"
					width="full"
					gap="lg"
					className="text-center"
				>
					<BrandHeader />
					<WelcomeBlock tab={tab} />
				</Container>

				<Container
					direction="vertical"
					cosmicBorder
					width="auto"
					className="bg-zinc-900/50 p-10"
				>
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
				</Container>

				<Container
					direction="vertical"
					width="full"
					className="text-center"
					gap="sm"
				>
					<p className="text-sm text-zinc-200 leading-relaxed">
						Gamify your work. Track your tasks. Level up your productivity.
					</p>

					<Container
						direction="vertical"
						width="full"
						className="text-xs text-zinc-300"
					>
						© {COPYRIGHT_YEAR} Amber Cowled. All rights reserved.
					</Container>
				</Container>
			</Container>
		</Page>
	);
}
