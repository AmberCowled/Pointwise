"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function ProfileRedirectPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return;
		if (session?.user?.id) {
			router.replace(`/profile/${session.user.id}`);
		} else {
			router.replace("/");
		}
	}, [session, status, router]);

	return null;
}
