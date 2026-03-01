"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { IoFingerPrint, IoShieldCheckmarkOutline } from "react-icons/io5";

export default function TwoFactorChallenge() {
	const { data: session, status, update } = useSession();
	const router = useRouter();
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Redirect if not pending 2FA
	useEffect(() => {
		if (status === "authenticated" && !session?.pendingTwoFactor) {
			router.replace("/dashboard");
		}
		if (status === "unauthenticated") {
			router.replace("/");
		}
	}, [status, session, router]);

	const handleVerify = useCallback(async () => {
		setIsVerifying(true);
		setError(null);

		try {
			// Get authentication options
			const optionsRes = await fetch("/api/auth/webauthn/auth-options", {
				method: "POST",
			});
			if (!optionsRes.ok)
				throw new Error("Failed to get authentication options");
			const options = await optionsRes.json();

			// Start WebAuthn authentication
			const { startAuthentication } = await import("@simplewebauthn/browser");
			const assertion = await startAuthentication({ optionsJSON: options });

			// Verify authentication
			const verifyRes = await fetch("/api/auth/webauthn/auth-verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(assertion),
			});
			if (!verifyRes.ok) throw new Error("Authentication verification failed");

			// Trigger JWT update to clear pendingTwoFactor
			await update();

			// Small delay to ensure session is updated, then redirect
			setTimeout(() => {
				router.replace("/dashboard");
			}, 500);
		} catch (err) {
			setIsVerifying(false);
			if (err instanceof Error && err.name === "NotAllowedError") {
				setError("Authentication was cancelled. Please try again.");
			} else {
				setError(
					err instanceof Error
						? err.message
						: "Authentication failed. Please try again.",
				);
			}
		}
	}, [update, router]);

	if (status === "loading") {
		return <div className="text-zinc-500 text-sm">Loading...</div>;
	}

	if (!session?.pendingTwoFactor) {
		return null;
	}

	return (
		<div
			className={`w-full max-w-md rounded-xl p-8 bg-zinc-900/75 ${StyleTheme.Container.Border.Dark} border text-center`}
		>
			<IoShieldCheckmarkOutline
				className={`text-5xl mx-auto mb-4 ${StyleTheme.Text.Secondary}`}
			/>
			<h2 className={`text-xl font-semibold ${StyleTheme.Text.Primary} mb-2`}>
				Two-Factor Authentication
			</h2>
			<p className={`text-sm ${StyleTheme.Text.Secondary} mb-6`}>
				Verify your identity with your passkey to continue.
			</p>

			{error && <p className="text-sm text-red-400 mb-4">{error}</p>}

			<div className="space-y-3">
				<Button
					variant="primary"
					fullWidth
					onClick={handleVerify}
					loading={isVerifying}
					disabled={isVerifying}
				>
					<IoFingerPrint className="text-xl" />
					Verify with passkey
				</Button>

				<Button
					variant="secondary"
					fullWidth
					size="sm"
					onClick={() => signOut({ callbackUrl: "/" })}
					disabled={isVerifying}
				>
					Sign out
				</Button>
			</div>
		</div>
	);
}
