"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Menu from "@pointwise/app/components/ui/menu";
import Modal from "@pointwise/app/components/ui/modal";
import AddUsersToConversationModal, {
	getAddUsersToConversationModalId,
} from "@pointwise/app/dashboard/modals/message/AddUsersToConversationModal";
import { useSubscribeConversation } from "@pointwise/lib/realtime";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import {
	useArchiveConversationMutation,
	useGetConversationQuery,
	useMarkConversationReadMutation,
} from "@pointwise/lib/redux/services/conversationsApi";
import {
	messagesApi,
	useGetMessagesQuery,
	useSendMessageMutation,
} from "@pointwise/lib/redux/services/messagesApi";
import { notificationsApi } from "@pointwise/lib/redux/services/notificationsApi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	IoArchiveOutline,
	IoChevronBack,
	IoEllipsisHorizontal,
	IoPersonAdd,
	IoSend,
} from "react-icons/io5";
import Message from "./Message";

export default function Conversation() {
	const params = useParams<{ conversationId: string }>();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const conversationId = params?.conversationId;
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const [archiveConversation, { isLoading: isArchiving }] =
		useArchiveConversationMutation();
	const [markConversationRead] = useMarkConversationReadMutation();
	const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { data: conversation } = useGetConversationQuery(conversationId ?? "", {
		skip: !conversationId,
	});
	const canSend = conversation?.canSend ?? true;

	const {
		data: messagesData,
		isLoading,
		isError,
		refetch,
	} = useGetMessagesQuery(
		{ conversationId: conversationId ?? "" },
		{ skip: !conversationId },
	);

	const messages = messagesData?.messages ?? [];

	// Mark this conversation as read when viewing it (removes from message notifications)
	useEffect(() => {
		if (!conversationId) return;
		markConversationRead(conversationId).catch((err) => {
			console.warn("Failed to mark conversation read on mount", err);
		});
	}, [conversationId, markConversationRead]);

	const handleNewMessage = useCallback(() => {
		if (!conversationId) return;
		dispatch(
			messagesApi.util.invalidateTags([
				{ type: "Messages", id: conversationId },
			]),
		);
		setTimeout(() => {
			markConversationRead(conversationId)
				.then(() => {
					dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
				})
				.catch((err) => {
					console.warn(
						"Failed to mark conversation read after new message",
						err,
					);
				});
		}, 400);
	}, [conversationId, dispatch, markConversationRead]);

	useSubscribeConversation(conversationId, {
		onNewMessage: handleNewMessage,
	});

	useEffect(() => {
		if (conversationId && messages.length > 0) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [conversationId, messages.length]);

	if (!conversationId) {
		return (
			<div className="py-8 text-center text-sm text-zinc-500">
				Conversation not found
			</div>
		);
	}

	if (isError) {
		return (
			<Container direction="vertical" gap="sm" width="full" className="pt-3">
				<ErrorCard
					display
					message="Messages could not be loaded"
					onRetry={refetch}
				/>
			</Container>
		);
	}

	if (isLoading) {
		return (
			<div className="py-8 text-center text-sm text-zinc-500">
				Loading messages…
			</div>
		);
	}

	const handleArchive = async () => {
		try {
			await archiveConversation(conversationId).unwrap();
			router.push("/messages");
		} catch (_err) {
			// Error handled by mutation / could show toast
		}
	};

	const handleAddUsers = () => {
		if (conversationId) {
			Modal.Manager.open(getAddUsersToConversationModalId(conversationId));
		}
	};

	const handleSend = async () => {
		if (!canSend) return;
		const content = input.trim();
		if (!content || !conversationId) return;
		try {
			await sendMessage({
				conversationId,
				body: { content },
			}).unwrap();
			setInput("");
		} catch (err) {
			console.error("Failed to send message", err);
		}
	};

	return (
		<>
			<AddUsersToConversationModal conversationId={conversationId} />
			<Container direction="vertical" gap="none" className="min-h-0 flex-1 p-3">
				<Container
					direction="vertical"
					gap="none"
					width="full"
					className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-zinc-600/50 bg-zinc-900/50"
				>
					<Container
						direction="horizontal"
						gap="sm"
						width="full"
						className="shrink-0 justify-between border-b border-zinc-600/50 p-3"
					>
						<Link
							href="/messages"
							className="flex items-center gap-1 text-sm text-zinc-300 transition-colors hover:text-zinc-100"
						>
							<IoChevronBack className="h-5 w-5 shrink-0" aria-hidden />
							<span>Messages Overview</span>
						</Link>
						<Menu
							trigger={
								<Button
									variant="ghost"
									size="sm"
									icon={IoEllipsisHorizontal}
									className="text-zinc-400 hover:text-zinc-100"
									title="Conversation options"
									aria-label="Conversation options"
								/>
							}
						>
							<Menu.Section title="Actions">
								<Menu.Option
									label="Add Users"
									icon={<IoPersonAdd className="h-4 w-4" />}
									onClick={handleAddUsers}
								/>
								<Menu.Option
									label="Archive"
									icon={<IoArchiveOutline className="h-4 w-4" />}
									onClick={handleArchive}
									disabled={isArchiving}
								/>
							</Menu.Section>
						</Menu>
					</Container>
					<Container
						direction="vertical"
						gap="sm"
						width="full"
						className="min-h-0 flex-1 overflow-y-auto py-3 px-5"
					>
						{messages.map((message) => (
							<Message
								key={message.id}
								message={message}
								currentUserId={userId}
							/>
						))}
						<div ref={messagesEndRef} />
					</Container>
					<Container
						direction="horizontal"
						gap="sm"
						width="full"
						className="shrink-0 items-center border-t border-white/10 p-3"
					>
						<textarea
							id={`conversation-message-input-${conversationId}`}
							name={`conversation-message-input-${conversationId}`}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									void handleSend();
								}
							}}
							placeholder={
								canSend
									? "Type a message..."
									: "You must be friends to send a message"
							}
							rows={1}
							disabled={!canSend}
							title={
								!canSend
									? "You must be friends with at least one participant to send a message"
									: undefined
							}
							className="h-10 min-h-10 min-w-0 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[16px] text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
							aria-label="Message"
						/>
						<Button
							onClick={() => void handleSend()}
							disabled={!canSend || sending || !input.trim()}
							loading={sending}
							hideChildrenWhenLoading
							title={
								canSend
									? "Send message"
									: "You must be friends with at least one participant to send a message"
							}
							aria-label="Send message"
							size="sm"
							className="h-10 shrink-0 px-3"
						>
							<IoSend className="h-5 w-5 shrink-0" aria-hidden />
						</Button>
					</Container>
				</Container>
			</Container>
		</>
	);
}
