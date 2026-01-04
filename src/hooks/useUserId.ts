"use client";

import { useSession } from "next-auth/react";

/**
 * Hook to get the current user's ID
 * @returns The user ID or undefined if not authenticated
 */
export function useUserId(): string | undefined {
	const { data: session } = useSession();
	return session?.user?.id;
}

/**
 * Hook to get the current user's ID (throws if not authenticated)
 * @returns The user ID
 * @throws Error if user is not authenticated
 */
export function useUserIdRequired(): string {
	const userId = useUserId();
	if (!userId) {
		throw new Error("User is not authenticated");
	}
	return userId;
}
