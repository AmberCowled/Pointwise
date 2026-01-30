"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import { IoNotifications } from "react-icons/io5";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAblyClient } from "@pointwise/lib/ably/client";
import ProfilePicture from "../userCard/ProfilePicture";
import {
	notificationsApi,
	useGetNotificationsQuery,
	useMarkAllReadMutation,
} from "@pointwise/lib/redux/services/notificationsApi";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";

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

	useEffect(() => {
		if (!userId) return;

		let channel: any = null;
		let isActive = true;

		const handleMessage = (message: any) => {
			// When any new notification arrives, invalidate the Redux cache
			if (message.name === "new-notification") {
				dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
			}
		};

		const subscribe = async () => {
			try {
				const client = await getAblyClient();
				if (!isActive) return;
				const channelName = `user:${userId}:friend-requests`;
				channel = client.channels.get(channelName);
				channel.subscribe(handleMessage);
			} catch (error) {
				console.warn("Failed to subscribe to notifications", error);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			if (channel) {
				channel.unsubscribe(handleMessage);
			}
		};
	}, [userId, dispatch]);

	const unreadNotifications = notifications.filter((n) => !n.read);
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
				) : notifications.length === 0 ? (
					<Menu.Option label="No notifications yet" disabled />
				) : (
					notifications.map((notification) => {
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
