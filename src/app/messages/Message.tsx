"use client";

import Container from "@pointwise/app/components/ui/Container";
import ProfilePicture from "@pointwise/app/dashboard/userCard/ProfilePicture";
import type { Message as MessageType } from "@pointwise/lib/validation/message-schema";

export interface MessageProps {
	message: MessageType;
	currentUserId: string | undefined;
}

export default function Message({ message, currentUserId }: MessageProps) {
	const isOwn = message.senderId === currentUserId;
	const displayName = message.sender?.displayName ?? "Deleted";
	const image = message.sender?.image ?? "";

	return (
		<Container
			direction="horizontal"
			gap="sm"
			width="full"
			className={isOwn ? "flex-row-reverse justify-start" : "justify-start"}
		>
			<ProfilePicture
				profilePicture={image}
				displayName={displayName}
				size="sm"
			/>
			<Container
				direction="vertical"
				gap="xs"
				width="auto"
				className={`max-w-[75%] shrink-0 rounded-lg px-3 py-2 text-left text-sm items-start ${
					isOwn ? "bg-indigo-600/50 text-white" : "bg-zinc-700/50 text-zinc-100"
				}`}
			>
				<span className="block text-xs font-medium text-zinc-300">
					{displayName} –{" "}
					{new Date(message.createdAt).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
				<p className="block wrap-break-word">{message.content}</p>
			</Container>
		</Container>
	);
}
