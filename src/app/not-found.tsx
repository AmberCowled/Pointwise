import { authOptions } from "@pointwise/lib/auth";
import { getServerSession } from "next-auth";
import { AutoRedirectNotice } from "./components/general/AutoRedirectNotice";
import BrandHeader from "./components/general/BrandHeader";
import BackgroundGlow from "./components/ui/BackgroundGlow";
import { Card } from "./components/ui/Card";
import { StyleTheme } from "./components/ui/StyleTheme";
export default async function NotFound() {
	const session = await getServerSession(authOptions);
	const isSignedIn = Boolean(session);

	const title = isSignedIn
		? "We couldn't find that page"
		: "This route doesn't exist (yet)";

	const description = isSignedIn
		? "This page isn't available right now. It may have moved, or you might not have access to it."
		: "You've reached a page we haven't built or that no longer exists.";

	const redirectTarget = isSignedIn ? "/dashboard" : "/";
	const redirectLabel = isSignedIn ? "Go to dashboard" : "Go to home";
	const redirectDescription = isSignedIn
		? "Redirecting you to your dashboard in a few seconds…"
		: "Redirecting you to the home page in a few seconds…";

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-20 text-zinc-100">
			<BackgroundGlow />

			<div className="relative z-10 w-full max-w-2xl space-y-10">
				<BrandHeader />

				<Card className="space-y-9 bg-zinc-950/80 p-8 text-center shadow-xl sm:p-12">
					<p
						className={`text-xs font-semibold uppercase tracking-[0.3em] ${StyleTheme.Text.Muted}`}
					>
						404 • Page not found
					</p>

					<h1 className="text-2xl font-semibold tracking-tight p-2 sm:text-3xl">
						{title}
					</h1>

					<p
						className={`mx-auto max-w-lg text-sm leading-relaxed ${StyleTheme.Text.Secondary} sm:text-[0.95rem] mt-2 sm:mt-3`}
					>
						{description}
					</p>

					<AutoRedirectNotice
						target={redirectTarget}
						label={redirectLabel}
						description={redirectDescription}
					/>
				</Card>
			</div>
		</main>
	);
}
