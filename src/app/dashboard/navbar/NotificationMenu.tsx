"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import {
	api,
	useGetNotificationsQuery,
	useMarkAllReadMutation,
} from "@pointwise/generated/api";
import {
	FALLBACK_RENDERER,
	NOTIFICATION_RENDERERS,
} from "@pointwise/lib/notifications/renderers";
import {
	type NewNotificationPayload,
	RealtimePreset,
	useSubscribeUserNotifications,
} from "@pointwise/lib/realtime";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { IoNotifications } from "react-icons/io5";
import ProfilePicture from "../userCard/ProfilePicture";

export default function NotificationMenu() {
	const dispatch = useAppDispatch();
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data, isLoading } = useGetNotificationsQuery(
		{},
		{
			skip: !userId,
		},
	);
	const notifications = data?.notifications ?? [];

	const [markAllRead] = useMarkAllReadMutation();

	// Optimistic real-time update: insert Ably payload into RTK Query cache
	const handleNotification = useCallback(
		(payload: NewNotificationPayload) => {
			dispatch(
				api.util.updateQueryData("getNotifications", {}, (draft) => {
					if (!draft.notifications.some((n) => n.id === payload.id)) {
						draft.notifications.unshift(payload);
					}
				}),
			);
		},
		[dispatch],
	);

	useSubscribeUserNotifications(userId, {
		preset: RealtimePreset.GENERAL_NOTIFICATIONS,
		onEvent: handleNotification,
	});

	// Exclude NEW_MESSAGE; those are shown only in MessagesMenu
	const notificationMenuItems = notifications.filter(
		(n) => n.type !== NotificationType.NEW_MESSAGE,
	);
	const unreadNotifications = notificationMenuItems.filter((n) => !n.read);
	const unreadCount = unreadNotifications.length;

	const handleOpenMenu = () => {
		if (unreadCount > 0) {
			// Scoped: exclude NEW_MESSAGE so opening the bell doesn't mark message notifications as read
			void markAllRead({ excludeTypes: ["NEW_MESSAGE"] });
		}
	};

	return (
		<Menu
			trigger={
				<Button
					icon={IoNotifications}
					badgeCount={unreadCount}
					title="Notifications"
					aria-label={`Notifications (${unreadCount})`}
					onClick={handleOpenMenu}
				/>
			}
		>
			<Menu.Section title="Notifications">
				{isLoading ? (
					<Menu.Option label="Loading notifications..." disabled />
				) : notificationMenuItems.length === 0 ? (
					<Menu.Option label="No notifications yet" disabled />
				) : (
					notificationMenuItems.map((notification) => {
						const renderer =
							NOTIFICATION_RENDERERS[notification.type] ?? FALLBACK_RENDERER;
						const notifData = notification.data as Record<string, unknown>;
						const userInfo = renderer.getUser(notifData);
						const message = renderer.getMessage(notifData);
						const href = renderer.getHref?.(notifData);

						const content = (
							<div
								key={notification.id}
								className="flex items-center gap-3 px-3 py-2 min-w-[300px]"
							>
								<ProfilePicture
									profilePicture={userInfo.image ?? ""}
									displayName={userInfo.name}
									size="xs"
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-zinc-100 wrap-break-word">
										{message}
									</p>
									<span className="text-[10px] text-zinc-500 uppercase tracking-wider">
										{new Date(notification.createdAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								{!notification.read && (
									<div className="h-2 w-2 rounded-full bg-indigo-500" />
								)}
							</div>
						);

						if (href) {
							return (
								<a key={notification.id} href={href}>
									{content}
								</a>
							);
						}
						return content;
					})
				)}
			</Menu.Section>
		</Menu>
	);
}
