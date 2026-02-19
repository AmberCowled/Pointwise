"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import { api, useGetNotificationsQuery } from "@pointwise/generated/api";
import { invalidateTags } from "@pointwise/generated/invalidation";
import {
	type NewNotificationPayload,
	RealtimePreset,
	useSubscribeUserNotifications,
} from "@pointwise/lib/realtime";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { IoMail } from "react-icons/io5";
import ProfilePicture from "../userCard/ProfilePicture";

export default function MessagesMenu() {
	const dispatch = useAppDispatch();
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data, isLoading: notificationsLoading } = useGetNotificationsQuery(
		{},
		{ skip: !userId },
	);
	const notifications = data?.notifications ?? [];

	const handleNotification = useCallback(
		(payload: NewNotificationPayload) => {
			// Optimistic: insert into notification cache
			dispatch(
				api.util.updateQueryData("getNotifications", {}, (draft) => {
					if (!draft.notifications.some((n) => n.id === payload.id)) {
						draft.notifications.unshift(payload);
					}
				}),
			);
			// Still invalidate conversations and messages (those need real refetch)
			dispatch(invalidateTags(["Conversations"]));
			const payloadData = payload.data as
				| { conversationId?: string }
				| undefined;
			if (
				payload.type === "NEW_MESSAGE" &&
				typeof payloadData?.conversationId === "string"
			) {
				dispatch(
					invalidateTags([
						{ type: "Messages", id: payloadData.conversationId },
					]),
				);
			}
		},
		[dispatch],
	);

	useSubscribeUserNotifications(userId, {
		preset: RealtimePreset.MESSAGE_NOTIFICATIONS,
		onEvent: handleNotification,
	});

	const allMessageNotifications = notifications.filter(
		(n) => n.type === NotificationType.NEW_MESSAGE && !n.read,
	);
	// One entry per conversation: keep only the most recent notification per conversation
	const messageNotificationsByConversation = (() => {
		const byConversation = new Map<
			string,
			(typeof allMessageNotifications)[0]
		>();
		for (const n of allMessageNotifications) {
			const nData = n.data as { conversationId?: string };
			const cid = nData?.conversationId;
			if (!cid) continue;
			const existing = byConversation.get(cid);
			const created = new Date(n.createdAt).getTime();
			if (!existing || created > new Date(existing.createdAt).getTime()) {
				byConversation.set(cid, n);
			}
		}
		return Array.from(byConversation.values());
	})();
	// When user is on a conversation page, don't show that conversation in unread list/badge
	const pathname = usePathname();
	const currentConversationId =
		pathname?.match(/^\/messages\/([^/]+)$/)?.[1] ?? null;
	const messageNotificationsForMenu = currentConversationId
		? messageNotificationsByConversation.filter(
				(n) =>
					(n.data as { conversationId?: string }).conversationId !==
					currentConversationId,
			)
		: messageNotificationsByConversation;
	const unreadCount = messageNotificationsForMenu.length;

	return (
		<Menu
			trigger={
				<Button
					icon={IoMail}
					badgeCount={unreadCount}
					title="Messages"
					aria-label={`Messages${unreadCount ? ` (${unreadCount} unread)` : ""}`}
				/>
			}
		>
			<Menu.Section title="Messages">
				{notificationsLoading ? (
					<Menu.Option label="Loading..." disabled />
				) : messageNotificationsForMenu.length === 0 ? (
					<Menu.Option label="No unread messages" disabled />
				) : (
					messageNotificationsForMenu
						.filter(
							(n) =>
								(n.data as { conversationId?: string }).conversationId != null,
						)
						.slice(0, 5)
						.map((n) => {
							const nData = n.data as {
								conversationId: string;
								senderName?: string | null;
								senderImage?: string | null;
								messageSnippet?: string;
							};
							return (
								<Link
									key={n.id}
									href={`/messages/${nData.conversationId}`}
									className="flex w-full items-center gap-3 px-3 py-2 min-w-[280px] text-left hover:bg-white/5 rounded-lg transition-colors"
								>
									<ProfilePicture
										profilePicture={nData.senderImage ?? ""}
										displayName={nData.senderName ?? "User"}
										size="xs"
									/>
									<div className="flex-1 min-w-0">
										<span className="block font-medium truncate text-zinc-100">
											{nData.senderName ?? "User"}
										</span>
										<span className="block text-xs text-zinc-500 truncate">
											{nData.messageSnippet ?? ""}
										</span>
									</div>
								</Link>
							);
						})
				)}
			</Menu.Section>
		</Menu>
	);
}
