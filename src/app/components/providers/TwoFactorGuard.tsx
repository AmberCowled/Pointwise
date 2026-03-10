"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function TwoFactorGuard({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.pendingTwoFactor &&
			pathname !== "/two-factor"
		) {
			router.replace("/two-factor");
		}
	}, [status, session, pathname, router]);

	return <>{children}</>;
}
