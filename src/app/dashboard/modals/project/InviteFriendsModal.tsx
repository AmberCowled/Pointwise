"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	useGetFriendsQuery,
	useGetProjectInvitesQuery,
	useInviteUsersToProjectMutation,
	useRejectInviteMutation,
} from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useMemo, useState } from "react";
import FriendInviteCard from "./FriendInviteCard";

export interface InviteFriendsModalProps {
	project: Project;
}

export default function InviteFriendsModal({
	project,
}: InviteFriendsModalProps) {
	const { showNotification } = useNotifications();
	const [loadingFriendId, setLoadingFriendId] = useState<string | null>(null);

	const {
		data: friendsData,
		isLoading: friendsLoading,
		isError: friendsError,
		error: friendsErr,
	} = useGetFriendsQuery();

	const {
		data: invitesData,
		isLoading: invitesLoading,
		isError: invitesError,
		error: invitesErr,
	} = useGetProjectInvitesQuery(project.id, {
		skip: !project.id,
	});

	const [inviteUsersToProject] = useInviteUsersToProjectMutation();
	const [rejectInvite] = useRejectInviteMutation();

	// Build sets for filtering
	const memberSet = useMemo(() => {
		const set = new Set<string>();
		for (const id of project.adminUserIds ?? []) set.add(id);
		for (const id of project.projectUserIds ?? []) set.add(id);
		for (const id of project.viewerUserIds ?? []) set.add(id);
		return set;
	}, [project.adminUserIds, project.projectUserIds, project.viewerUserIds]);

	const joinRequestSet = useMemo(
		() => new Set(project.joinRequestUserIds ?? []),
		[project.joinRequestUserIds],
	);

	const inviteMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const invite of invitesData?.invites ?? []) {
			map.set(invite.invitedUserId, invite.id);
		}
		return map;
	}, [invitesData]);

	// Filter friends: exclude members and join requesters
	const eligibleFriends = useMemo(() => {
		const friends = friendsData?.friends ?? [];
		return friends.filter(
			(f) => !memberSet.has(f.id) && !joinRequestSet.has(f.id),
		);
	}, [friendsData, memberSet, joinRequestSet]);

	const handleInvite = async (
		userId: string,
		role: "ADMIN" | "USER" | "VIEWER",
	) => {
		setLoadingFriendId(userId);
		try {
			await inviteUsersToProject({
				projectId: project.id,
				data: { invites: [{ userId, role }] },
			}).unwrap();
			showNotification({
				message: "Invite sent successfully",
				variant: "success",
			});
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		} finally {
			setLoadingFriendId(null);
		}
	};

	const handleCancel = async (inviteId: string) => {
		setLoadingFriendId(inviteId);
		try {
			await rejectInvite(inviteId).unwrap();
			showNotification({
				message: "Invite canceled successfully",
				variant: "success",
			});
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		} finally {
			setLoadingFriendId(null);
		}
	};

	const isLoading = friendsLoading || invitesLoading;
	const isError = friendsError || invitesError;
	const errorMessage = friendsErr
		? getErrorMessage(friendsErr)
		: invitesErr
			? getErrorMessage(invitesErr)
			: "An error occurred";

	return (
		<Modal
			id={`invite-friends-modal-${project.id}`}
			size="xl"
			loading={isLoading && !friendsData && !invitesData}
		>
			<Modal.Header title="Invite Members" />
			<Modal.Body>
				{isError ? (
					<ErrorCard
						display={true}
						message={errorMessage}
						onRetry={() => window.location.reload()}
					/>
				) : eligibleFriends.length > 0 ? (
					<Container
						direction="vertical"
						width="full"
						className="items-stretch"
					>
						{eligibleFriends.map((friend) => {
							const inviteId = inviteMap.get(friend.id);
							const isInvited = inviteMap.has(friend.id);
							return (
								<FriendInviteCard
									key={friend.id}
									friend={friend}
									isInvited={isInvited}
									inviteId={inviteId}
									onInvite={handleInvite}
									onCancel={handleCancel}
									isLoading={
										loadingFriendId === friend.id ||
										loadingFriendId === inviteId
									}
								/>
							);
						})}
					</Container>
				) : (
					<Container
						direction="vertical"
						gap="md"
						width="full"
						className="items-center justify-center py-12"
					>
						<p className={`${StyleTheme.Text.Secondary} text-sm`}>
							No friends available to invite
						</p>
					</Container>
				)}
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Close</Button>
			</Modal.Footer>
		</Modal>
	);
}
