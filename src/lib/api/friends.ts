import { ApiError } from "@pointwise/lib/api/errors";
import prisma from "@pointwise/lib/prisma";
import type {
	FriendListResponse,
	FriendshipStatusResponse,
	PendingRequestsResponse,
} from "../validation/friends-schema";

/**
 * Send a friend request from one user to another.
 * Handles cases where:
 * 1. Users are already friends.
 * 2. A request already exists in either direction.
 * 3. Self-requests.
 */
export async function sendFriendRequest(
	senderId: string,
	receiverId: string,
): Promise<{ status: "PENDING" | "FRIENDS" }> {
	if (senderId === receiverId) {
		throw new ApiError("You cannot send a friend request to yourself", 400);
	}

	// 1. Check if they are already friends
	const [userAId, userBId] =
		senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];

	const existingFriendship = await prisma.friendship.findUnique({
		where: {
			userAId_userBId: { userAId, userBId },
		},
	});

	if (existingFriendship) {
		throw new ApiError("You are already friends with this user", 400);
	}

	// 2. Check for an existing outgoing request
	const existingOutgoing = await prisma.friendRequest.findUnique({
		where: {
			senderId_receiverId: {
				senderId: senderId,
				receiverId: receiverId,
			},
		},
	});

	if (existingOutgoing) {
		throw new ApiError("Friend request already sent", 400);
	}

	// 3. Check for an existing incoming request
	const existingIncoming = await prisma.friendRequest.findUnique({
		where: {
			senderId_receiverId: {
				senderId: receiverId,
				receiverId: senderId,
			},
		},
	});

	// If there's an incoming request, accept it automatically (mutual friend request)
	if (existingIncoming) {
		await prisma.$transaction([
			// Create the friendship
			prisma.friendship.create({
				data: { userAId, userBId },
			}),
			// Delete the friend request
			prisma.friendRequest.delete({
				where: { id: existingIncoming.id },
			}),
		]);

		return { status: "FRIENDS" };
	}

	// 4. Create the new friend request
	await prisma.friendRequest.create({
		data: {
			senderId,
			receiverId,
		},
	});

	return { status: "PENDING" };
}

/**
 * Accept a friend request.
 */
export async function acceptFriendRequest(
	requestId: string,
	userId: string,
): Promise<{
	senderId: string;
	receiverId: string;
	accepter: { displayName: string | null; image: string | null };
}> {
	const request = await prisma.friendRequest.findUnique({
		where: { id: requestId },
		include: {
			receiver: {
				select: {
					displayName: true,
					image: true,
				},
			},
		},
	});

	if (!request) {
		throw new ApiError("Friend request not found", 404);
	}

	if (request.receiverId !== userId) {
		throw new ApiError("You are not authorized to accept this request", 403);
	}

	const [userAId, userBId] =
		request.senderId < request.receiverId
			? [request.senderId, request.receiverId]
			: [request.receiverId, request.senderId];

	await prisma.$transaction([
		// Create the friendship
		prisma.friendship.create({
			data: { userAId, userBId },
		}),
		// Delete the friend request
		prisma.friendRequest.delete({
			where: { id: requestId },
		}),
	]);

	return {
		senderId: request.senderId,
		receiverId: request.receiverId,
		accepter: request.receiver,
	};
}

/**
 * Decline or cancel a friend request.
 */
export async function declineFriendRequest(
	requestId: string,
	userId: string,
): Promise<{ senderId: string; receiverId: string }> {
	const request = await prisma.friendRequest.findUnique({
		where: { id: requestId },
	});

	if (!request) {
		throw new ApiError("Friend request not found", 404);
	}

	if (request.senderId !== userId && request.receiverId !== userId) {
		throw new ApiError("You are not authorized to decline this request", 403);
	}

	await prisma.friendRequest.delete({
		where: { id: requestId },
	});

	return { senderId: request.senderId, receiverId: request.receiverId };
}

/**
 * Remove a friend.
 */
export async function removeFriend(
	userId: string,
	friendId: string,
): Promise<{ friendId: string }> {
	const [userAId, userBId] =
		userId < friendId ? [userId, friendId] : [friendId, userId];

	const friendship = await prisma.friendship.findUnique({
		where: {
			userAId_userBId: { userAId, userBId },
		},
	});

	if (!friendship) {
		throw new ApiError("Friendship not found", 404);
	}

	await prisma.friendship.delete({
		where: { id: friendship.id },
	});

	return { friendId };
}

/**
 * Get all friends for a user.
 */
export async function getFriends(userId: string): Promise<FriendListResponse> {
	const friendships = await prisma.friendship.findMany({
		where: {
			OR: [{ userAId: userId }, { userBId: userId }],
		},
		include: {
			userA: {
				select: {
					id: true,
					displayName: true,
					image: true,
					xp: true,
				},
			},
			userB: {
				select: {
					id: true,
					displayName: true,
					image: true,
					xp: true,
				},
			},
		},
	});

	const friends = friendships.map((f) =>
		f.userAId === userId ? f.userB : f.userA,
	);

	return { friends };
}

/**
 * Get pending friend requests (both incoming and outgoing).
 */
export async function getPendingRequests(
	userId: string,
): Promise<PendingRequestsResponse> {
	const [incoming, outgoing] = await Promise.all([
		prisma.friendRequest.findMany({
			where: { receiverId: userId },
			include: {
				sender: {
					select: {
						id: true,
						displayName: true,
						image: true,
						xp: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.friendRequest.findMany({
			where: { senderId: userId },
			include: {
				receiver: {
					select: {
						id: true,
						displayName: true,
						image: true,
						xp: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		}),
	]);

	return { incoming, outgoing };
}

/**
 * Get the friendship status between two users.
 */
export async function getFriendshipStatus(
	userId: string,
	targetUserId: string,
): Promise<FriendshipStatusResponse> {
	if (userId === targetUserId) {
		return { status: "NONE" };
	}

	// Check friendship
	const [userAId, userBId] =
		userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];

	const friendship = await prisma.friendship.findUnique({
		where: {
			userAId_userBId: { userAId, userBId },
		},
	});

	if (friendship) {
		return { status: "FRIENDS" };
	}

	// Check for outgoing request
	const outgoing = await prisma.friendRequest.findUnique({
		where: {
			senderId_receiverId: {
				senderId: userId,
				receiverId: targetUserId,
			},
		},
	});

	if (outgoing) {
		return { status: "PENDING_SENT", requestId: outgoing.id };
	}

	// Check for incoming request
	const incoming = await prisma.friendRequest.findUnique({
		where: {
			senderId_receiverId: {
				senderId: targetUserId,
				receiverId: userId,
			},
		},
	});

	if (incoming) {
		return { status: "PENDING_RECEIVED", requestId: incoming.id };
	}

	return { status: "NONE" };
}
