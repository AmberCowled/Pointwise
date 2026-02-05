"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import {
	RealtimePreset,
	useSubscribeUserNotifications,
} from "@pointwise/lib/realtime";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import {
	notificationsApi,
	useGetNotificationsQuery,
	useMarkAllReadMutation,
} from "@pointwise/lib/redux/services/notificationsApi";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { IoNotifications } from "react-icons/io5";
import ProfilePicture from "../userCard/ProfilePicture";

export default function NotificationMenu() {
	const dispatch = useAppDispatch();
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data: notifications = [], isLoading } = useGetNotificationsQuery(
		undefined,
		{
			skip: !userId,
		},
	);
	const [markAllRead] = useMarkAllReadMutation();

	const handleNotification = useCallback(() => {
		dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
	}, [dispatch]);

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
			void markAllRead();
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
						const isAccepted =
							notification.type === NotificationType.FRIEND_REQUEST_ACCEPTED;
						const isReceived =
							notification.type === NotificationType.FRIEND_REQUEST_RECEIVED;

						const userName = isAccepted
							? notification.data.accepterName
							: isReceived
								? notification.data.senderName
								: "User";
						const userImage = isAccepted
							? notification.data.accepterImage
							: isReceived
								? notification.data.senderImage
								: "";

						return (
							<div
								key={notification.id}
								className="flex items-center gap-3 px-3 py-2 min-w-[300px]"
							>
								<ProfilePicture
									profilePicture={userImage ?? ""}
									displayName={userName ?? "User"}
									size="xs"
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-zinc-100 wrap-break-word">
										<span className="font-semibold text-zinc-50">
											{userName}
										</span>{" "}
										{isAccepted
											? "accepted your friend request."
											: isReceived
												? "sent you a friend request."
												: "sent you a notification."}
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
					})
				)}
			</Menu.Section>
		</Menu>
	);
}
