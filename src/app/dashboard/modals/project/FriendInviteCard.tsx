"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { Tag } from "@pointwise/app/components/ui/Tag";
import { useState } from "react";
import { IoClose, IoPersonAdd } from "react-icons/io5";
import ProfilePicture from "../../userCard/ProfilePicture";
import RoleSelector from "../../userCard/RoleSelector";

export interface FriendInviteCardProps {
	friend: {
		id: string;
		displayName: string;
		image: string | null;
	};
	isInvited: boolean;
	inviteId?: string;
	onInvite: (userId: string, role: "ADMIN" | "USER" | "VIEWER") => void;
	onCancel: (inviteId: string) => void;
	isLoading: boolean;
}

export default function FriendInviteCard({
	friend,
	isInvited,
	inviteId,
	onInvite,
	onCancel,
	isLoading,
}: FriendInviteCardProps) {
	const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER" | "VIEWER">(
		"USER",
	);

	return (
		<Container
			direction="vertical"
			width="full"
			gap="none"
			className="bg-zinc-700/50 rounded-lg border border-zinc-700/80"
		>
			<Container
				width="full"
				direction="horizontal"
				className="p-3 items-center"
			>
				<ProfilePicture
					profilePicture={friend.image ?? ""}
					displayName={friend.displayName}
					size="xs"
					className="shrink-0"
				/>
				<Container
					direction="vertical"
					gap="none"
					width="full"
					className="items-start min-w-0"
				>
					<span
						className={`text-sm font-medium ${StyleTheme.Text.Primary} truncate`}
					>
						{friend.displayName}
					</span>
				</Container>
				{isInvited ? (
					<Container
						direction="horizontal"
						width="auto"
						gap="sm"
						className="items-center shrink-0"
					>
						<Tag variant="info" size="sm">
							Invited
						</Tag>
						<Button
							variant="danger"
							size="xs"
							icon={IoClose}
							onClick={() => inviteId && onCancel(inviteId)}
							disabled={isLoading}
							loading={isLoading}
							aria-label="Cancel invite"
						>
							Cancel
						</Button>
					</Container>
				) : (
					<Container
						direction="horizontal"
						width="auto"
						gap="sm"
						className="items-center shrink-0"
					>
						<RoleSelector
							onRoleChange={setSelectedRole}
							defaultValue={selectedRole}
							disabled={isLoading}
						/>
						<Button
							variant="secondary"
							size="xs"
							icon={IoPersonAdd}
							onClick={() => onInvite(friend.id, selectedRole)}
							disabled={isLoading}
							loading={isLoading}
							aria-label="Invite friend"
						>
							Invite
						</Button>
					</Container>
				)}
			</Container>
		</Container>
	);
}
