"use client";

import { useEffect } from "react";
import { AutoRedirectNotice } from "./components/general/AutoRedirectNotice";
import BrandHeader from "./components/general/BrandHeader";
import { Card } from "./components/ui/Card";
import Page from "./components/ui/Page";
import { StyleTheme } from "./components/ui/StyleTheme";

export default function ErrorPage({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<Page className="flex items-center justify-center px-4 py-20">
			<div className="relative z-10 w-full max-w-2xl space-y-10">
				<BrandHeader />

				<Card className="space-y-9 bg-zinc-950/80 p-8 text-center shadow-xl sm:p-12">
					<p
						className={`text-xs font-semibold uppercase tracking-[0.3em] ${StyleTheme.Text.Muted}`}
					>
						500 • Something went wrong
					</p>

					<h1 className="text-2xl font-semibold tracking-tight p-2 sm:text-3xl">
						An unexpected error occurred
					</h1>

					<p
						className={`mx-auto max-w-lg text-sm leading-relaxed ${StyleTheme.Text.Secondary} sm:text-[0.95rem] mt-2 sm:mt-3`}
					>
						Something didn&apos;t work as expected. We&apos;ll redirect you
						shortly.
					</p>

					<AutoRedirectNotice
						target="/"
						label="Go to home"
						description="Redirecting you to the home page in a few seconds…"
					/>
				</Card>
			</div>
		</Page>
	);
}
