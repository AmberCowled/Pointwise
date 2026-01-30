"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import {
	useGetPendingRequestsQuery,
	useHandleFriendRequestMutation,
	friendsApi,
} from "@pointwise/lib/redux/services/friendsApi";
import { IoCheckmark, IoClose, IoPersonAdd } from "react-icons/io5";
import ProfilePicture from "../userCard/ProfilePicture";
import { useEffect } from "react";
import { getAblyClient } from "@pointwise/lib/ably/client";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import { useSession } from "next-auth/react";

export default function FriendRequestsMenu() {
	const dispatch = useAppDispatch();
	const { data: session } = useSession();
	const userId = session?.user?.id;
	const { data, isLoading } = useGetPendingRequestsQuery();
	const [handleRequest, { isLoading: isHandling }] =
		useHandleFriendRequestMutation();

	const incomingRequests = data?.incoming ?? [];
	const hasRequests = incomingRequests.length > 0;

	const onAccept = async (requestId: string) => {
		try {
			await handleRequest({ requestId, action: "ACCEPT" }).unwrap();
		} catch (err) {
			console.error("Failed to accept friend request:", err);
		}
	};

	const onDecline = async (requestId: string) => {
		try {
			await handleRequest({ requestId, action: "DECLINE" }).unwrap();
		} catch (err) {
			console.error("Failed to decline friend request:", err);
		}
	};

	useEffect(() => {
		if (!userId) {
			return;
		}
		let channel: ReturnType<Awaited<ReturnType<typeof getAblyClient>>["channels"]["get"]> | null =
			null;
		let isActive = true;

		const handleMessage = (message: any) => {
			// Invalidate friend-related tags for any relevant Ably message
			// This handles legacy events and the new unified notification event
			dispatch(
				friendsApi.util.invalidateTags(["FriendRequests", "FriendshipStatus"]),
			);
		};

		const subscribe = async () => {
			try {
				const client = await getAblyClient();
				if (!isActive) {
					return;
				}
				const channelName = `user:${userId}:friend-requests`;
				channel = client.channels.get(channelName);
				channel.subscribe(handleMessage);
			} catch (error) {
				console.warn("Failed to subscribe to friend request updates", error);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			if (channel) {
				channel.unsubscribe(handleMessage);
			}
		};
	}, [dispatch, userId]);

	return (
		<Menu
			trigger={
				<Button
					icon={IoPersonAdd}
					badgeCount={incomingRequests.length}
					title="Friend Requests"
					aria-label={`Friend requests (${incomingRequests.length})`}
				/>
			}
		>
			<Menu.Section title="Friend Requests">
				{isLoading ? (
					<Menu.Option label="Loading requests..." disabled />
				) : !hasRequests ? (
					<Menu.Option label="No friend requests yet" disabled />
				) : (
					incomingRequests.map((request) => (
						<div
							key={request.id}
							className="flex items-center gap-3 px-3 py-2 min-w-[280px]"
						>
							<ProfilePicture
								profilePicture={request.sender?.image ?? ""}
								displayName={request.sender?.displayName ?? "User"}
								size="xs"
							/>
							<div className="flex-1 min-w-0">
								<span className="block font-medium truncate text-zinc-100">
									{request.sender?.displayName}
								</span>
								<span className="block text-[10px] text-zinc-500 uppercase tracking-wider">
									Sent a friend request
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<button
									type="button"
									onClick={() => onAccept(request.id)}
									disabled={isHandling}
									className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50"
									title="Accept"
								>
									<IoCheckmark className="h-4 w-4" />
								</button>
								<button
									type="button"
									onClick={() => onDecline(request.id)}
									disabled={isHandling}
									className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-50"
									title="Decline"
								>
									<IoClose className="h-4 w-4" />
								</button>
							</div>
						</div>
					))
				)}
			</Menu.Section>
		</Menu>
	);
}
