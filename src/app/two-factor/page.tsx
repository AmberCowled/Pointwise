import { Suspense } from "react";
import Page from "../components/ui/Page";
import TwoFactorChallenge from "./TwoFactorChallenge";

export default function TwoFactorPage() {
	return (
		<Page className="flex items-center justify-center px-4">
			<Suspense
				fallback={<div className="text-zinc-500 text-sm">Loading...</div>}
			>
				<TwoFactorChallenge />
			</Suspense>
		</Page>
	);
}
