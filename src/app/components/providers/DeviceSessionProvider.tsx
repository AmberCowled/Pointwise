"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DeviceSessionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (status === "loading") return;

		// Not authenticated — no registration needed, render immediately
		if (status !== "authenticated" || !session?.jti) {
			setReady(true);
			return;
		}

		// Already registered this browser session
		const key = `device-session-registered-${session.jti}`;
		if (sessionStorage.getItem(key)) {
			setReady(true);
			return;
		}

		// Register device session, then allow children to render
		fetch("/api/auth/register-session", { method: "POST" })
			.then(() => {
				sessionStorage.setItem(key, "1");
			})
			.catch(() => {
				// Allow rendering even on failure — queries will retry
			})
			.finally(() => {
				setReady(true);
			});
	}, [session, status]);

	if (!ready) return null;

	return <>{children}</>;
}
