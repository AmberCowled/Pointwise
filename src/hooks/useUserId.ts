"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * Hook to get the current user's ID (clears session and redirects if not authenticated)
 * @returns The user ID or empty string if not authenticated (while redirecting)
 */
export function useUserId(): string {
	const { data: session } = useSession();
	const userId = session?.user?.id;

	useEffect(() => {
		if (!userId) {
			// Clear session and redirect to root
			signOut({ callbackUrl: "/", redirect: true });
		}
	}, [userId]);

	if (!userId) {
		// Return empty string while redirecting (component will unmount)
		return "";
	}

	return userId;
}
