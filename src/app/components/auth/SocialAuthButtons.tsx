"use client";

import { signIn } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/Button";
import { getBaseUrl } from "./utils/url";

type Props = {
	onLoadingChange?: (isLoading: boolean) => void;
};

export default function SocialAuthButtons({ onLoadingChange }: Props) {
	const [pending, setPending] = useState<"google" | "github" | null>(null);

	const handle = useCallback((provider: "google" | "github") => {
		const baseUrl = getBaseUrl();
		if (!baseUrl) return;
		setPending(provider);
		signIn(provider, { callbackUrl: `${baseUrl}/dashboard` }).finally(() =>
			setPending(null),
		);
	}, []);

	// Notify parent of loading state changes
	useEffect(() => {
		onLoadingChange?.(!!pending);
	}, [pending, onLoadingChange]);

	return (
		<div className="grid grid-cols-2 gap-3">
			<Button
				type="button"
				variant="secondary"
				size="md"
				stack
				loading={pending === "google"}
				disabled={!!pending}
				onClick={() => handle("google")}
			>
				<FcGoogle className="text-xl sm:text-2xl shrink-0" />
				<span className="text-xs sm:text-sm whitespace-nowrap">
					Continue with Google
				</span>
			</Button>

			<Button
				type="button"
				variant="secondary"
				size="md"
				stack
				loading={pending === "github"}
				disabled={!!pending}
				onClick={() => handle("github")}
			>
				<FaGithub className="text-xl sm:text-2xl text-white shrink-0" />
				<span className="text-xs sm:text-sm whitespace-nowrap">
					Continue with GitHub
				</span>
			</Button>
		</div>
	);
}
