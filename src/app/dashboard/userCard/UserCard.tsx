import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import InviteModal from "@pointwise/app/dashboard/modals/invite/InviteModal";
import {
	useCancelFriendRequestMutation,
	useCreateConversationMutation,
	useGetConversationsQuery,
	useGetFriendshipStatusQuery,
	useHandleFriendRequestMutation,
	useRemoveFriendMutation,
	useSendFriendRequestMutation,
} from "@pointwise/generated/api";
import type { SearchableUser } from "@pointwise/lib/validation/users-schema";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	IoChatbubble,
	IoCheckmark,
	IoFolder,
	IoPersonAdd,
	IoPersonRemove,
} from "react-icons/io5";
import DisplayName from "./DisplayName";
import ProfilePicture from "./ProfilePicture";
import UserCardButton from "./UserCardButton";
import UserLevelStats from "./UserLevelStats";

export default function UserCard({ user }: { user: SearchableUser }) {
	const router = useRouter();
	const profilePicture = user.image ?? "";
	const displayName = user.displayName;
	const { data: session } = useSession();
	const { data: conversations = [] } = useGetConversationsQuery(undefined, {
		skip: !session?.user?.id,
	});
	const [createConversation, { isLoading: isCreatingConversation }] =
		useCreateConversationMutation();

	const { data: friendship, isLoading } = useGetFriendshipStatusQuery(user.id);
	const [sendRequest, { isLoading: isSending }] =
		useSendFriendRequestMutation();
	const [handleRequest, { isLoading: isHandling }] =
		useHandleFriendRequestMutation();
	const [cancelRequest, { isLoading: isCancelling }] =
		useCancelFriendRequestMutation();
	const [removeFriend, { isLoading: isRemoving }] = useRemoveFriendMutation();

	const isFriend = friendship?.status === "FRIENDS";
	const isPendingSent = friendship?.status === "PENDING_SENT";
	const isPendingReceived = friendship?.status === "PENDING_RECEIVED";

	const handleAddFriend = async () => {
		try {
			await sendRequest({ receiverId: user.id }).unwrap();
		} catch (err) {
			console.error("Failed to send friend request:", err);
		}
	};

	const handleAcceptRequest = async () => {
		if (!friendship?.requestId) return;
		try {
			await handleRequest({
				requestId: friendship.requestId,
				action: "ACCEPT",
			}).unwrap();
		} catch (err) {
			console.error("Failed to accept friend request:", err);
		}
	};

	const handleCancelRequest = async () => {
		if (!friendship?.requestId) return;
		try {
			await cancelRequest(friendship.requestId).unwrap();
		} catch (err) {
			console.error("Failed to cancel friend request:", err);
		}
	};

	const handleRemoveFriend = async () => {
		try {
			await removeFriend(user.id).unwrap();
		} catch (err) {
			console.error("Failed to remove friend:", err);
		}
	};

	const handleMessage = async () => {
		const currentUserId = session?.user?.id;
		if (!isFriend || !currentUserId) return;
		const existingOneToOne = conversations.find((c) => {
			const participantIds = c.participants?.map((p) => p.userId) ?? [];
			return (
				participantIds.length === 2 &&
				participantIds.includes(currentUserId) &&
				participantIds.includes(user.id)
			);
		});
		if (existingOneToOne) {
			router.push(`/messages/${existingOneToOne.id}`);
		} else {
			try {
				const conversation = await createConversation({
					participantIds: [user.id],
				}).unwrap();
				router.push(`/messages/${conversation.id}`);
			} catch (err) {
				console.error("Failed to create conversation:", err);
			}
		}
	};

	const renderFriendButton = () => {
		if (isLoading) {
			return (
				<UserCardButton
					icon={<IoPersonAdd className="size-4 animate-pulse" />}
					label="..."
					color="#3f3f46"
					disabled
				/>
			);
		}

		if (isFriend) {
			return (
				<UserCardButton
					icon={<IoPersonRemove className="size-4" />}
					label="Remove"
					color="#ef4444"
					onClick={handleRemoveFriend}
					disabled={isRemoving}
				/>
			);
		}

		if (isPendingSent) {
			return (
				<UserCardButton
					icon={<IoPersonAdd className="size-4" />}
					label="Cancel"
					color="#5f5f5f"
					onClick={handleCancelRequest}
					disabled={isCancelling}
				/>
			);
		}

		if (isPendingReceived) {
			return (
				<UserCardButton
					icon={<IoCheckmark className="size-4" />}
					label="Accept"
					color="#189d4d"
					onClick={handleAcceptRequest}
					disabled={isHandling}
				/>
			);
		}

		return (
			<UserCardButton
				icon={<IoPersonAdd className="size-4" />}
				label="Add"
				color="#189d4d"
				onClick={handleAddFriend}
				disabled={isSending}
			/>
		);
	};

	return (
		<>
			<InviteModal inviteUser={user} />
			<Container
				direction="vertical"
				width="full"
				gap="none"
				className={`bg-zinc-900/50 border ${StyleTheme.Container.Border.Dark} rounded-sm p-2 pb-0`}
			>
				<Container
					width="full"
					className={`border-b ${StyleTheme.Container.Border.Subtle} pb-2`}
				>
					<Container width="auto">
						<ProfilePicture
							profilePicture={profilePicture}
							displayName={displayName}
							href={`/profile/${user.id}`}
						/>
					</Container>
					<Container
						direction="vertical"
						width="full"
						gap="xs"
						className="items-start"
					>
						<Container width="auto">
							<DisplayName
								displayName={displayName}
								href={`/profile/${user.id}`}
							/>
						</Container>
						<Container
							width="full"
							gap="xs"
							className="text-yellow-500 bg-black/25 rounded-xl p-1"
						>
							<UserLevelStats xp={user.xp ?? 0} />
						</Container>
					</Container>
				</Container>

				<Container width="full" gap="sm" className="rounded-xs my-2">
					{renderFriendButton()}
					<UserCardButton
						icon={<IoChatbubble className="size-4" />}
						label="Message"
						color="#1271ff"
						tooltip={
							!isFriend
								? "Add this user as a friend to send messages"
								: undefined
						}
						disabled={!isFriend || isCreatingConversation}
						onClick={() => void handleMessage()}
					/>
					<UserCardButton
						icon={<IoFolder className="size-4" />}
						label="Invite"
						color="#fda438"
						onClick={() => {
							Modal.Manager.open(`invite-modal-${user.id}`);
						}}
					/>
				</Container>
			</Container>
		</>
	);
}
