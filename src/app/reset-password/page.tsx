import { Suspense } from "react";
import Page from "../components/ui/Page";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
	return (
		<Page className="flex items-center justify-center px-4">
			<Suspense
				fallback={<div className="text-zinc-500 text-sm">Loading...</div>}
			>
				<ResetPasswordForm />
			</Suspense>
		</Page>
	);
}
