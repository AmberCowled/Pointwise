"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function DeviceSessionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status !== "authenticated" || !session?.jti) return;

		// Only register once per browser session
		const key = `device-session-registered-${session.jti}`;
		if (sessionStorage.getItem(key)) return;

		fetch("/api/auth/register-session", { method: "POST" })
			.then(() => {
				sessionStorage.setItem(key, "1");
			})
			.catch(() => {
				// Silently fail - not critical
			});
	}, [session, status]);

	return <>{children}</>;
}
