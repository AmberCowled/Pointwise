"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Modal from "@pointwise/app/components/ui/modal";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	useCreateConversationMutation,
	useGetFriendsQuery,
} from "@pointwise/generated/api";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import ProfilePicture from "../../userCard/ProfilePicture";

export const NEW_MESSAGE_MODAL_ID = "new-message-modal";

export default function NewMessageModal() {
	const router = useRouter();
	const [createConversation, { isLoading: isCreating }] =
		useCreateConversationMutation();
	const { data: friendsData, isLoading: friendsLoading } = useGetFriendsQuery();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const friends = friendsData?.friends ?? [];
	const sortedFriends = useMemo(
		() =>
			[...friends].sort((a, b) =>
				a.displayName.localeCompare(b.displayName, undefined, {
					sensitivity: "base",
				}),
			),
		[friends],
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

	const handleCreate = useCallback(async () => {
		const participantIds = Array.from(selectedIds);
		if (participantIds.length === 0) return;
		try {
			const conversation = await createConversation({
				participantIds,
			}).unwrap();
			Modal.Manager.close(NEW_MESSAGE_MODAL_ID);
			router.push(`/messages/${conversation.id}`);
		} catch (err) {
			console.error("Failed to create conversation:", err);
		}
	}, [selectedIds, createConversation, router]);

	const canCreate = selectedIds.size > 0 && !isCreating;

	const handleAfterClose = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	return (
		<Modal
			id={NEW_MESSAGE_MODAL_ID}
			size="fullscreen"
			onAfterClose={handleAfterClose}
		>
			<Modal.Header title="New message" className="text-center" />
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
							No friends yet. Add friends to start a conversation.
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
					onClick={handleCreate}
					disabled={!canCreate}
					loading={isCreating}
				>
					Create
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
