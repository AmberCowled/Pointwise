"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import ProfilePicture from "@pointwise/app/dashboard/userCard/ProfilePicture";
import { useArchiveConversationMutation } from "@pointwise/lib/redux/services/conversationsApi";
import type { ConversationListItem } from "@pointwise/lib/validation/conversation-schema";
import Link from "next/link";
import { IoArchiveOutline } from "react-icons/io5";

export interface ConversationCardProps {
	conversation: ConversationListItem;
	currentUserId: string | undefined;
}

function getConversationTitle(
	conv: ConversationListItem,
	currentUserId: string | undefined,
): string {
	if (conv.name) return conv.name;
	const others = conv.participants?.filter((p) => p.userId !== currentUserId);
	return (
		others
			?.map((p) => (p as { user?: { displayName?: string } }).user?.displayName)
			.filter(Boolean)
			.join(", ") ?? "Conversation"
	);
}

export default function ConversationCard({
	conversation,
	currentUserId,
}: ConversationCardProps) {
	const [archiveConversation, { isLoading: isArchiving }] =
		useArchiveConversationMutation();
	const title = getConversationTitle(conversation, currentUserId);
	const otherParticipant = conversation.participants?.find(
		(p) => p.userId !== currentUserId,
	);
	const image =
		(otherParticipant as { user?: { image?: string | null } } | undefined)?.user
			?.image ?? "";

	const lastMsg = conversation.lastMessage;
	const lastMessageSender = lastMsg
		? conversation.participants?.find((p) => p.userId === lastMsg.senderId)
		: undefined;
	const lastMessageSenderName =
		(lastMessageSender as { user?: { displayName?: string } } | undefined)?.user
			?.displayName ?? "Deleted";
	const lastMessagePreview = lastMsg
		? `${lastMessageSenderName}: ${lastMsg.content}`
		: null;

	const handleArchive = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		archiveConversation(conversation.id);
	};

	return (
		<Container
			direction="horizontal"
			gap="sm"
			width="full"
			className="rounded-lg border border-white/10 bg-zinc-900/50 transition-colors hover:border-zinc-600 pr-2"
		>
			<Link
				href={`/messages/${conversation.id}`}
				className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
			>
				<ProfilePicture profilePicture={image} displayName={title} size="sm" />
				<Container
					direction="vertical"
					gap="none"
					width="auto"
					className="items-start text-left"
				>
					<span className="block w-full truncate font-medium text-zinc-100">
						{title}
					</span>
					{lastMessagePreview && (
						<TextPreview
							text={lastMessagePreview}
							lines={1}
							size="sm"
							className="text-xs text-zinc-300"
						/>
					)}
				</Container>
			</Link>
			<Button
				variant="ghost"
				size="xs"
				icon={IoArchiveOutline}
				title="Archive"
				aria-label="Archive conversation"
				onClick={handleArchive}
				disabled={isArchiving}
				loading={isArchiving}
				className="shrink-0 px-2 text-zinc-400 hover:text-zinc-100"
			/>
		</Container>
	);
}
