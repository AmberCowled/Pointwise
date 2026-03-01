import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
			<Suspense
				fallback={<div className="text-zinc-500 text-sm">Loading...</div>}
			>
				<ResetPasswordForm />
			</Suspense>
		</div>
	);
}
