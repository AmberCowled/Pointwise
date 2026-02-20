"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { IoChatbubbles } from "react-icons/io5";

export interface NoMessagesViewProps {
	/**
	 * Callback when "New message" button is clicked
	 */
	onNewMessageClick?: () => void;
}

/**
 * NoMessagesView - Empty state component when user has no messages
 *
 * Displays a friendly message encouraging users to start a conversation.
 */
export default function NoMessagesView({
	onNewMessageClick,
}: NoMessagesViewProps) {
	return (
		<div className="text-center py-12">
			<div
				className={`w-16 h-16 mx-auto mb-4 rounded-full ${StyleTheme.Container.BackgroundEmpty} flex items-center justify-center`}
			>
				<IoChatbubbles className="w-8 h-8 text-zinc-600" aria-hidden="true" />
			</div>
			<h3 className="text-lg font-semibold text-zinc-100 mb-2">
				No messages yet
			</h3>
			<p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
				Message a friend or start a new conversation to get started.
			</p>
			<Button
				variant="secondary"
				size="sm"
				className="rounded-full"
				onClick={onNewMessageClick}
			>
				New message
			</Button>
		</div>
	);
}
