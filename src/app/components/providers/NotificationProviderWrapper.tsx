"use client";

import { NotificationProvider } from "../ui/NotificationProvider";

export function NotificationProviderWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<NotificationProvider position="bottom-center" maxNotifications={5}>
			{children}
		</NotificationProvider>
	);
}
