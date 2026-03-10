"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
	IoCheckmarkCircle,
	IoCloseCircle,
	IoShieldCheckmarkOutline,
} from "react-icons/io5";

interface DeviceInfo {
	deviceName: string | null;
	ipAddress: string | null;
	location: string | null;
	createdAt: string;
}

export default function RevokeDeviceClient() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [device, setDevice] = useState<DeviceInfo | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const revokeDevice = useCallback(async () => {
		if (!token) {
			setStatus("error");
			setErrorMessage("Missing token. Please use the link from your email.");
			return;
		}

		try {
			const res = await fetch("/api/auth/revoke-device", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error ?? "Failed to revoke device");
			}

			const data = await res.json();
			setDevice(data.device);
			setStatus("success");
		} catch (err) {
			setStatus("error");
			setErrorMessage(
				err instanceof Error ? err.message : "Failed to revoke device",
			);
		}
	}, [token]);

	useEffect(() => {
		revokeDevice();
	}, [revokeDevice]);

	if (status === "loading") {
		return (
			<div className="text-zinc-500 text-sm">Revoking device access...</div>
		);
	}

	if (status === "error") {
		return (
			<div
				className={`w-full max-w-md rounded-xl p-8 bg-zinc-900/75 ${StyleTheme.Container.Border.Dark} border text-center`}
			>
				<IoCloseCircle className="text-red-400 text-5xl mx-auto mb-4" />
				<h2 className={`text-xl font-semibold ${StyleTheme.Text.Primary} mb-2`}>
					Unable to revoke device
				</h2>
				<p className={`text-sm ${StyleTheme.Text.Secondary} mb-6`}>
					{errorMessage}
				</p>
				<Button variant="secondary" onClick={() => router.push("/")}>
					Go to sign in
				</Button>
			</div>
		);
	}

	return (
		<div
			className={`w-full max-w-md rounded-xl p-8 bg-zinc-900/75 ${StyleTheme.Container.Border.Dark} border`}
		>
			<div className="text-center mb-6">
				<IoCheckmarkCircle className="text-emerald-400 text-5xl mx-auto mb-4" />
				<h2 className={`text-xl font-semibold ${StyleTheme.Text.Primary} mb-2`}>
					Device access revoked
				</h2>
				<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
					The session from this device has been terminated.
				</p>
			</div>

			{device && (
				<div
					className={`rounded-lg p-4 bg-zinc-950/50 ${StyleTheme.Container.Border.Dark} border mb-6`}
				>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className={StyleTheme.Text.Secondary}>Device</span>
							<span className={StyleTheme.Text.Primary}>
								{device.deviceName ?? "Unknown device"}
							</span>
						</div>
						{device.location && (
							<div className="flex justify-between">
								<span className={StyleTheme.Text.Secondary}>Location</span>
								<span className={StyleTheme.Text.Primary}>
									{device.location}
								</span>
							</div>
						)}
						{device.ipAddress && (
							<div className="flex justify-between">
								<span className={StyleTheme.Text.Secondary}>IP address</span>
								<span className={`${StyleTheme.Text.Primary} font-mono`}>
									{device.ipAddress}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			<div
				className={`rounded-lg p-4 bg-zinc-950/50 ${StyleTheme.Container.Border.Dark} border mb-6`}
			>
				<div className="flex items-center gap-2 mb-3">
					<IoShieldCheckmarkOutline
						className={`text-lg ${StyleTheme.Text.Secondary}`}
					/>
					<h3 className={`text-sm font-semibold ${StyleTheme.Text.Primary}`}>
						Recommended security steps
					</h3>
				</div>
				<ul
					className={`text-sm ${StyleTheme.Text.Secondary} space-y-2 list-disc list-inside`}
				>
					<li>Change your Pointwise password</li>
					<li>
						Review linked accounts (Google, GitHub) for suspicious activity
					</li>
					<li>Set up two-factor authentication if not already enabled</li>
					<li>Review active sessions in Settings</li>
				</ul>
			</div>

			<Button
				variant="primary"
				fullWidth
				onClick={() => router.push("/settings")}
			>
				Go to Settings
			</Button>
		</div>
	);
}
