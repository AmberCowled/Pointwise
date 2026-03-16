"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import { useGetNotificationsQuery } from "@pointwise/generated/api";
import {
	extractActor,
	getNotificationMenu,
} from "@pointwise/lib/realtime/registry";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { IoMail } from "react-icons/io5";
import ProfilePicture from "../userCard/ProfilePicture";

export default function MessagesMenu() {
	const { data, isLoading: notificationsLoading } = useGetNotificationsQuery(
		{},
	);
	const notifications = data?.notifications ?? [];

	// When user is on a conversation page, don't show that conversation in unread list/badge
	const pathname = usePathname();
	const currentConversationId =
		pathname?.match(/^\/messages\/([^/]+)$/)?.[1] ?? null;

	const messageNotificationsForMenu = useMemo(() => {
		const unread = notifications.filter(
			(n) => getNotificationMenu(n.type) === "messages" && !n.read,
		);
		// One entry per conversation: keep only the most recent notification per conversation
		const byConversation = new Map<string, (typeof unread)[0]>();
		for (const n of unread) {
			const cid = (n.data as { conversationId?: string })?.conversationId;
			if (!cid) continue;
			const existing = byConversation.get(cid);
			const created = new Date(n.createdAt).getTime();
			if (!existing || created > new Date(existing.createdAt).getTime()) {
				byConversation.set(cid, n);
			}
		}
		const deduped = Array.from(byConversation.values());
		return currentConversationId
			? deduped.filter(
					(n) =>
						(n.data as { conversationId?: string }).conversationId !==
						currentConversationId,
				)
			: deduped;
	}, [notifications, currentConversationId]);
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
							const actor = extractActor(n.data as Record<string, unknown>);
							const conversationId = (n.data as { conversationId: string })
								.conversationId;
							const snippet =
								(n.data as { messageSnippet?: string }).messageSnippet ?? "";
							return (
								<Link
									key={n.id}
									href={`/messages/${conversationId}`}
									className="flex w-full items-center gap-3 px-3 py-2 min-w-[280px] text-left hover:bg-white/5 rounded-lg transition-colors"
								>
									<ProfilePicture
										profilePicture={actor.image ?? ""}
										displayName={actor.name}
										size="xs"
									/>
									<div className="flex-1 min-w-0">
										<span className="block font-medium truncate text-zinc-100">
											{actor.name}
										</span>
										<span className="block text-xs text-zinc-500 truncate">
											{snippet}
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
