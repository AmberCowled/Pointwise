import { removeUserFromTaskAssignments } from "@pointwise/lib/api/tasks";
import { utapi } from "@pointwise/lib/api/utapi";
import prisma from "@pointwise/lib/prisma";

/**
 * Fully deletes a user account and cleans up all associated data.
 *
 * Deletion order:
 * 1. Delete projects where user is the sole admin (cascades tasks, invites)
 * 2. Remove user from shared projects (role arrays + task assignments)
 * 3. Delete profile picture from UploadThing
 * 4. Delete user record (cascades most relations via onDelete: Cascade)
 */
export async function deleteUserAccount(userId: string): Promise<void> {
	// 1. Find all projects where user is an admin
	const adminProjects = await prisma.project.findMany({
		where: { adminUserIds: { has: userId } },
		select: {
			id: true,
			adminUserIds: true,
			projectUserIds: true,
			viewerUserIds: true,
		},
	});

	const soleAdminProjectIds: string[] = [];
	const sharedProjectIds: string[] = [];

	for (const project of adminProjects) {
		if (project.adminUserIds.length === 1) {
			soleAdminProjectIds.push(project.id);
		} else {
			sharedProjectIds.push(project.id);
		}
	}

	// Also find projects where user is a member or viewer (not admin)
	const memberProjects = await prisma.project.findMany({
		where: {
			OR: [
				{ projectUserIds: { has: userId } },
				{ viewerUserIds: { has: userId } },
				{ joinRequestUserIds: { has: userId } },
			],
		},
		select: { id: true },
	});

	for (const project of memberProjects) {
		if (
			!soleAdminProjectIds.includes(project.id) &&
			!sharedProjectIds.includes(project.id)
		) {
			sharedProjectIds.push(project.id);
		}
	}

	// 2. Delete sole-admin projects (cascade handles tasks, invites)
	if (soleAdminProjectIds.length > 0) {
		await prisma.project.deleteMany({
			where: { id: { in: soleAdminProjectIds } },
		});
	}

	// 3. Remove user from shared projects
	for (const projectId of sharedProjectIds) {
		const project = await prisma.project.findUnique({
			where: { id: projectId },
			select: {
				adminUserIds: true,
				projectUserIds: true,
				viewerUserIds: true,
				joinRequestUserIds: true,
			},
		});

		if (!project) continue;

		await prisma.project.update({
			where: { id: projectId },
			data: {
				adminUserIds: {
					set: project.adminUserIds.filter((id) => id !== userId),
				},
				projectUserIds: {
					set: project.projectUserIds.filter((id) => id !== userId),
				},
				viewerUserIds: {
					set: project.viewerUserIds.filter((id) => id !== userId),
				},
				joinRequestUserIds: {
					set: project.joinRequestUserIds.filter((id) => id !== userId),
				},
			},
		});

		await removeUserFromTaskAssignments(projectId, userId);
	}

	// 4. Delete profile picture from UploadThing
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { image: true },
	});

	if (user?.image) {
		const imageUrl = user.image;
		if (imageUrl.includes("utfs.io") || imageUrl.includes("ufs.sh")) {
			const fileKey = imageUrl.split("/f/")[1]?.split("?")[0];
			if (fileKey) {
				try {
					await utapi.deleteFiles(fileKey);
				} catch (error) {
					console.error("Failed to delete profile picture:", error);
				}
			}
		}
	}

	// 5. Delete user — cascades: Account, Session, DeviceSession,
	// WebAuthnCredential, FriendRequest, Friendship, Notification,
	// ConversationParticipant, Message, XPEvent, TaskLike,
	// Comment, CommentLike, Invite
	await prisma.user.delete({ where: { id: userId } });
}
