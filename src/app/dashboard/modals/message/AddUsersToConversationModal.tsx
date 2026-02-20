"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Modal from "@pointwise/app/components/ui/modal";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	useGetConversationQuery,
	useGetFriendsQuery,
	useUpdateConversationMutation,
} from "@pointwise/generated/api";
import { useCallback, useMemo, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import ProfilePicture from "../../userCard/ProfilePicture";

export function getAddUsersToConversationModalId(conversationId: string) {
	return `add-users-to-conversation-${conversationId}`;
}

export interface AddUsersToConversationModalProps {
	conversationId: string;
}

export default function AddUsersToConversationModal({
	conversationId,
}: AddUsersToConversationModalProps) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const { data: conversation } = useGetConversationQuery(conversationId, {
		skip: !conversationId,
	});
	const { data: friendsData, isLoading: friendsLoading } = useGetFriendsQuery();
	const [updateConversation, { isLoading: isAdding }] =
		useUpdateConversationMutation();

	const participantIds = useMemo(
		() => new Set(conversation?.participants?.map((p) => p.userId) ?? []),
		[conversation?.participants],
	);

	const friends = friendsData?.friends ?? [];
	const addableFriends = useMemo(
		() => friends.filter((f) => !participantIds.has(f.id)),
		[friends, participantIds],
	);

	const sortedFriends = useMemo(
		() =>
			[...addableFriends].sort((a, b) =>
				a.displayName.localeCompare(b.displayName, undefined, {
					sensitivity: "base",
				}),
			),
		[addableFriends],
	);

	const toggleFriend = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const handleAdd = useCallback(async () => {
		const ids = Array.from(selectedIds);
		if (ids.length === 0) return;
		try {
			await updateConversation({
				id: conversationId,
				body: { addParticipantIds: ids },
			}).unwrap();
			Modal.Manager.close(getAddUsersToConversationModalId(conversationId));
		} catch (err) {
			console.error("Failed to add users to conversation", err);
		}
	}, [conversationId, selectedIds, updateConversation]);

	const handleAfterClose = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	const canAdd = selectedIds.size > 0 && !isAdding;
	const modalId = getAddUsersToConversationModalId(conversationId);

	return (
		<Modal id={modalId} size="fullscreen" onAfterClose={handleAfterClose}>
			<Modal.Header title="Add users to conversation" className="text-center" />
			<Modal.Body className="p-0!">
				<div className="flex flex-col overflow-auto p-4">
					{friendsLoading ? (
						<p
							className={`py-8 text-center text-sm ${StyleTheme.Text.Secondary}`}
						>
							Loading friends…
						</p>
					) : sortedFriends.length === 0 ? (
						<p
							className={`py-8 text-center text-sm ${StyleTheme.Text.Secondary}`}
						>
							All your friends are already in this conversation.
						</p>
					) : (
						<ul className="flex flex-col gap-0">
							{sortedFriends.map((friend) => {
								const isSelected = selectedIds.has(friend.id);
								return (
									<li key={friend.id}>
										<button
											type="button"
											onClick={() => toggleFriend(friend.id)}
											className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-white/5"
										>
											<ProfilePicture
												profilePicture={friend.image ?? ""}
												displayName={friend.displayName}
												size="sm"
											/>
											<span
												className={`min-w-0 flex-1 truncate font-medium ${StyleTheme.Text.Primary}`}
											>
												{friend.displayName}
											</span>
											<span
												className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
													isSelected
														? "border-zinc-100 bg-zinc-100 text-zinc-900"
														: "border-zinc-500 bg-transparent"
												}`}
												aria-hidden
											>
												{isSelected ? (
													<IoCheckmark className="h-4 w-4" />
												) : null}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</Modal.Body>
			<Modal.Footer align="center" className="p-0!">
				<Button
					variant="secondary"
					className="min-h-[60px] flex-1 rounded-none border-0 border-t"
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					className={`min-h-[60px] flex-1 rounded-none border-0 border-t border-l ${StyleTheme.Divider.Subtle}`}
					onClick={handleAdd}
					disabled={!canAdd}
					loading={isAdding}
				>
					Add
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
