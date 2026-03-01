"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Input from "@pointwise/app/components/ui/Input";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IoCheckmarkCircle, IoLockClosed } from "react-icons/io5";

export default function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const token = searchParams.get("token");
	const email = searchParams.get("email");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	if (!token || !email) {
		return (
			<div className="w-full max-w-md text-center">
				<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
					Invalid or missing reset link. Please request a new password reset.
				</p>
				<Button
					variant="secondary"
					className="mt-4"
					onClick={() => router.push("/")}
				>
					Go to sign in
				</Button>
			</div>
		);
	}

	if (success) {
		return (
			<div className="w-full max-w-md text-center space-y-4">
				<IoCheckmarkCircle className="text-emerald-400 text-5xl mx-auto" />
				<h2 className={`text-xl font-semibold ${StyleTheme.Text.Primary}`}>
					Password reset successful
				</h2>
				<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
					Your password has been updated. You can now sign in with your new
					password.
				</p>
				<Button variant="primary" onClick={() => router.push("/")}>
					Go to sign in
				</Button>
			</div>
		);
	}

	const passwordError = (() => {
		if (!password) return "";
		if (password.length < 8) return "Password must be at least 8 characters";
		if (password.length > 128) return "Password must be at most 128 characters";
		return "";
	})();

	const confirmError = (() => {
		if (!confirmPassword) return "";
		if (confirmPassword !== password) return "Passwords do not match";
		return "";
	})();

	const canSubmit =
		password.length >= 8 &&
		password.length <= 128 &&
		password === confirmPassword &&
		!isLoading;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		setIsLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, token, password }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error ?? "Failed to reset password");
			}

			setSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to reset password");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={`w-full max-w-md rounded-xl p-8 bg-zinc-900/75 ${StyleTheme.Container.Border.Dark} border`}
		>
			<div className="flex items-center gap-3 mb-6">
				<IoLockClosed className={`text-2xl ${StyleTheme.Text.Secondary}`} />
				<h2 className={`text-xl font-semibold ${StyleTheme.Text.Primary}`}>
					Reset your password
				</h2>
			</div>

			<p className={`text-sm ${StyleTheme.Text.Secondary} mb-6`}>
				Enter a new password for{" "}
				<span className="font-mono text-zinc-300">{email}</span>
			</p>

			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="New password"
					type="password"
					defaultValue={password}
					onChange={setPassword}
					error={passwordError || false}
					showPasswordToggle
					autoComplete="new-password"
				/>

				<Input
					label="Confirm password"
					type="password"
					defaultValue={confirmPassword}
					onChange={setConfirmPassword}
					error={confirmError || false}
					showPasswordToggle
					autoComplete="new-password"
				/>

				{error && <p className="text-sm text-red-400">{error}</p>}

				<Button
					type="submit"
					variant="primary"
					fullWidth
					disabled={!canSubmit}
					loading={isLoading}
				>
					Reset password
				</Button>
			</form>
		</div>
	);
}
