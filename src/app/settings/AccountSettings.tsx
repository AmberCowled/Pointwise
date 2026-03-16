"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	useGetAccountInfoQuery,
	useGetDeviceSessionsQuery,
	useRevokeAllDeviceSessionsMutation,
} from "@pointwise/generated/api";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
	IoFingerPrint,
	IoGlobeOutline,
	IoKeyOutline,
	IoLogoGithub,
	IoLogoGoogle,
	IoPhonePortraitOutline,
	IoShieldCheckmarkOutline,
	IoTrashBinOutline,
} from "react-icons/io5";
import DeleteAccountModal from "./DeleteAccountModal";

export default function AccountSettings() {
	const { data: session } = useSession();
	const { data: accountData, isLoading } = useGetAccountInfoQuery();
	const { data: sessionsData } = useGetDeviceSessionsQuery();
	const [revokeAll, { isLoading: isRevoking }] =
		useRevokeAllDeviceSessionsMutation();
	const { showNotification } = useNotifications();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isResettingPassword, setIsResettingPassword] = useState(false);

	if (isLoading) {
		return (
			<Container
				direction="vertical"
				width="full"
				className="py-4 !items-start"
			>
				<div className={StyleTheme.Text.Secondary}>Loading...</div>
			</Container>
		);
	}

	const info = accountData?.accountInfo;
	const currentJti = (session as unknown as { jti?: string })?.jti;

	const providerIcons: Record<string, React.ReactNode> = {
		google: <IoLogoGoogle className="text-lg" />,
		github: <IoLogoGithub className="text-lg" />,
	};

	const handleRevokeAll = async () => {
		if (!currentJti) {
			showNotification({
				message: "Unable to identify current session",
				variant: "error",
			});
			return;
		}
		const confirmed = await Modal.Confirm({
			title: "Sign out all other devices",
			message:
				"This will sign you out of all other browsers and devices. Your current session will remain active.",
			confirmText: "Sign out all",
			confirmVariant: "danger",
		});
		if (!confirmed) return;

		try {
			await revokeAll({ currentJti }).unwrap();
			showNotification({
				message: "All other sessions have been signed out",
				variant: "success",
			});
		} catch {
			showNotification({
				message: "Failed to revoke sessions",
				variant: "error",
			});
		}
	};

	const handleRequestPasswordReset = async () => {
		if (!info?.email) return;
		setIsResettingPassword(true);
		try {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: info.email }),
			});
			if (res.ok) {
				showNotification({
					message: "Password reset email sent. Check your inbox.",
					variant: "success",
				});
			} else {
				throw new Error();
			}
		} catch {
			showNotification({
				message: "Failed to send password reset email",
				variant: "error",
			});
		} finally {
			setIsResettingPassword(false);
		}
	};

	const handleSetup2FA = async () => {
		try {
			// Get registration options
			const optionsRes = await fetch("/api/auth/webauthn/register-options", {
				method: "POST",
			});
			if (!optionsRes.ok) throw new Error("Failed to get registration options");
			const options = await optionsRes.json();

			// Start WebAuthn registration
			const { startRegistration } = await import("@simplewebauthn/browser");
			const attestation = await startRegistration({ optionsJSON: options });

			// Verify registration
			const verifyRes = await fetch("/api/auth/webauthn/register-verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(attestation),
			});
			if (!verifyRes.ok) throw new Error("Verification failed");

			showNotification({
				message: "Two-factor authentication enabled",
				variant: "success",
			});
			// Refetch account info to update UI
			window.location.reload();
		} catch (err) {
			const message =
				err instanceof Error && err.name === "NotAllowedError"
					? "Passkey registration was cancelled"
					: "Failed to set up two-factor authentication";
			showNotification({ message, variant: "error" });
		}
	};

	const handleRemove2FA = async () => {
		const confirmed = await Modal.Confirm({
			title: "Disable Two-Factor Authentication",
			message:
				"This will remove all passkeys and disable 2FA on your account. You can re-enable it at any time.",
			confirmText: "Disable 2FA",
			confirmVariant: "danger",
		});
		if (!confirmed) return;

		try {
			const res = await fetch("/api/auth/webauthn/remove", {
				method: "DELETE",
			});
			if (!res.ok) throw new Error();
			showNotification({
				message: "Two-factor authentication disabled",
				variant: "success",
			});
			window.location.reload();
		} catch {
			showNotification({
				message: "Failed to disable two-factor authentication",
				variant: "error",
			});
		}
	};

	const formatRelativeTime = (dateStr: string) => {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 30) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	return (
		<Container
			direction="vertical"
			width="full"
			gap="lg"
			className="pt-3 !items-stretch"
		>
			{/* Linked Accounts */}
			<section>
				<div className="flex items-center gap-2 mb-3">
					<IoGlobeOutline
						className={`text-base ${StyleTheme.Text.Secondary}`}
					/>
					<span
						className={`text-xs font-semibold uppercase tracking-[0.3em] ${StyleTheme.Text.Secondary}`}
					>
						Linked Accounts
					</span>
				</div>
				<div className="space-y-2">
					{["google", "github"].map((provider) => {
						const connected = info?.providers.includes(provider);
						return (
							<Container
								key={provider}
								width="full"
								className={`items-center justify-between border-b ${StyleTheme.Container.Border.Dark} pb-3`}
							>
								<div className="flex items-center gap-3">
									{providerIcons[provider]}
									<span
										className={`text-sm font-medium capitalize ${StyleTheme.Text.Primary}`}
									>
										{provider}
									</span>
								</div>
								<span
									className={`text-xs px-2 py-1 rounded-full ${
										connected
											? "bg-emerald-500/10 text-emerald-400"
											: "bg-zinc-700/50 text-zinc-500"
									}`}
								>
									{connected ? "Connected" : "Not connected"}
								</span>
							</Container>
						);
					})}
				</div>
			</section>

			{/* Password */}
			<section>
				<div className="flex items-center gap-2 mb-3">
					<IoKeyOutline className={`text-base ${StyleTheme.Text.Secondary}`} />
					<span
						className={`text-xs font-semibold uppercase tracking-[0.3em] ${StyleTheme.Text.Secondary}`}
					>
						Password
					</span>
				</div>
				<Container
					width="full"
					className={`items-center justify-between border-b ${StyleTheme.Container.Border.Dark} pb-3`}
				>
					<div>
						<span className={`text-sm font-medium ${StyleTheme.Text.Primary}`}>
							{info?.hasPassword ? "Password is set" : "No password set"}
						</span>
						<p className="text-xs text-zinc-500 mt-0.5">
							{info?.hasPassword
								? "You can reset your password via email"
								: "Set a password to enable direct email login"}
						</p>
					</div>
					<Button
						variant="secondary"
						size="sm"
						onClick={handleRequestPasswordReset}
						disabled={!info?.email}
						loading={isResettingPassword}
					>
						{info?.hasPassword ? "Reset password" : "Set password"}
					</Button>
				</Container>
			</section>

			{/* Two-Factor Authentication */}
			<section>
				<div className="flex items-center gap-2 mb-3">
					<IoShieldCheckmarkOutline
						className={`text-base ${StyleTheme.Text.Secondary}`}
					/>
					<span
						className={`text-xs font-semibold uppercase tracking-[0.3em] ${StyleTheme.Text.Secondary}`}
					>
						Two-Factor Authentication
					</span>
				</div>
				<Container
					width="full"
					className={`items-center justify-between border-b ${StyleTheme.Container.Border.Dark} pb-3`}
				>
					<div>
						<span className={`text-sm font-medium ${StyleTheme.Text.Primary}`}>
							{info?.twoFactorEnabled ? "2FA is enabled" : "2FA is not enabled"}
						</span>
						<p className="text-xs text-zinc-500 mt-0.5">
							{info?.twoFactorEnabled
								? "Your account is protected with a passkey"
								: "Add a passkey for extra security on login"}
						</p>
					</div>
					{info?.twoFactorEnabled ? (
						<div className="flex gap-2">
							<Button variant="secondary" size="sm" onClick={handleSetup2FA}>
								<IoFingerPrint className="text-base" />
								Add another
							</Button>
							<Button variant="danger" size="sm" onClick={handleRemove2FA}>
								Disable
							</Button>
						</div>
					) : (
						<Button variant="secondary" size="sm" onClick={handleSetup2FA}>
							<IoFingerPrint className="text-base" />
							Set up 2FA
						</Button>
					)}
				</Container>
			</section>

			{/* Active Sessions */}
			<section>
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<IoPhonePortraitOutline
							className={`text-base ${StyleTheme.Text.Secondary}`}
						/>
						<span
							className={`text-xs font-semibold uppercase tracking-[0.3em] ${StyleTheme.Text.Secondary}`}
						>
							Active Sessions
						</span>
					</div>
					{sessionsData && sessionsData.sessions.length > 1 && (
						<Button
							variant="danger"
							size="xs"
							onClick={handleRevokeAll}
							loading={isRevoking}
						>
							Sign out all other devices
						</Button>
					)}
				</div>
				<div className="space-y-2">
					{sessionsData?.sessions.map((s) => {
						const isCurrent = s.jti === currentJti;
						return (
							<Container
								key={s.id}
								width="full"
								className={`items-center justify-between border-b ${StyleTheme.Container.Border.Dark} pb-3`}
							>
								<div>
									<div className="flex items-center gap-2">
										<span
											className={`text-sm font-medium ${StyleTheme.Text.Primary}`}
										>
											{s.deviceName ?? "Unknown device"}
										</span>
										{isCurrent && (
											<span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
												Current
											</span>
										)}
									</div>
									{s.location && (
										<p className="text-xs text-zinc-500 mt-0.5">{s.location}</p>
									)}
									<p className="text-xs text-zinc-500 mt-0.5">
										{s.ipAddress && `${s.ipAddress} · `}
										Last active {formatRelativeTime(s.lastActiveAt)}
									</p>
								</div>
							</Container>
						);
					})}
					{(!sessionsData || sessionsData.sessions.length === 0) && (
						<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
							No active sessions found
						</p>
					)}
				</div>
			</section>

			{/* Danger Zone */}
			<section className="mt-2">
				<div className="flex items-center gap-2 mb-3">
					<IoTrashBinOutline className="text-base text-red-400" />
					<span className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
						Danger Zone
					</span>
				</div>
				<Container
					width="full"
					className="items-center justify-between border border-red-500/20 rounded-lg p-4"
				>
					<div>
						<span className={`text-sm font-medium ${StyleTheme.Text.Primary}`}>
							Delete Account
						</span>
						<p className="text-xs text-zinc-500 mt-0.5">
							Permanently delete your account and all associated data
						</p>
					</div>
					<Button
						variant="danger"
						size="sm"
						onClick={() => setShowDeleteModal(true)}
					>
						Delete account
					</Button>
				</Container>
			</section>

			{showDeleteModal && (
				<DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
			)}
		</Container>
	);
}
