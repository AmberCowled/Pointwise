import { Suspense } from "react";
import TwoFactorChallenge from "./TwoFactorChallenge";

export default function TwoFactorPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
			<Suspense
				fallback={<div className="text-zinc-500 text-sm">Loading...</div>}
			>
				<TwoFactorChallenge />
			</Suspense>
		</div>
	);
}
