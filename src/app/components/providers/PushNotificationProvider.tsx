"use client";

import { useGetNotificationSettingsQuery } from "@pointwise/generated/api";
import { usePushNotifications } from "@pointwise/lib/realtime/hooks/usePushNotifications";
import { useSession } from "next-auth/react";

export function PushNotificationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data } = useGetNotificationSettingsQuery(undefined, {
		skip: !userId,
	});

	const pushEnabled = data?.settings?.pushEnabled ?? true;
	usePushNotifications(userId, { enabled: pushEnabled });

	return <>{children}</>;
}
