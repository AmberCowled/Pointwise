"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Card from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Modal from "@pointwise/app/components/ui/modal";
import NewMessageModal, {
	NEW_MESSAGE_MODAL_ID,
} from "@pointwise/app/dashboard/modals/message/NewMessageModal";
import { useGetConversationsQuery } from "@pointwise/generated/api";
import { useSession } from "next-auth/react";
import ConversationCard from "./ConversationCard";
import NoMessagesView from "./NoMessagesView";

export default function MessagesOverview() {
	const { data: session } = useSession();
	const userId = session?.user?.id;
	const {
		data: conversations = [],
		isLoading,
		isError,
		refetch,
	} = useGetConversationsQuery(undefined, { skip: !userId });

	const handleNewMessage = () => Modal.Manager.open(NEW_MESSAGE_MODAL_ID);

	const hasConversations =
		!isError && !isLoading && conversations && conversations.length > 0;
	const isEmpty =
		!isError && !isLoading && conversations && conversations.length === 0;

	return (
		<>
			<NewMessageModal />
			<Container direction="vertical" gap="sm" className="pt-3">
				<Card
					title="Messages"
					label="Overview"
					loading={isLoading}
					action={
						<Button variant="secondary" size="sm" onClick={handleNewMessage}>
							New message
						</Button>
					}
				>
					<Container
						direction="vertical"
						gap="sm"
						width="full"
						className="pt-2"
					>
						<ErrorCard
							display={isError}
							message="Conversations could not be loaded"
							onRetry={refetch}
							className="mb-6"
						/>
						{hasConversations ? (
							<Container direction="vertical" gap="xs" width="full">
								{conversations.map((conversation) => (
									<ConversationCard
										key={conversation.id}
										conversation={conversation}
										currentUserId={userId}
									/>
								))}
							</Container>
						) : isEmpty ? (
							<NoMessagesView onNewMessageClick={handleNewMessage} />
						) : null}
					</Container>
				</Card>
			</Container>
		</>
	);
}
