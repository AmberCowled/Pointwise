"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { toTitleCase } from "@pointwise/lib/text";
import type { SearchableUser } from "@pointwise/lib/validation/users-schema";
import { useState } from "react";
import { IoMail } from "react-icons/io5";
import ProfilePicture from "../../userCard/ProfilePicture";
import RoleSelector from "../../userCard/RoleSelector";

export interface InviteRequestCardProps {
	invitee: SearchableUser;
	projectName: string;
	onInvite: (userId: string, role: "ADMIN" | "USER" | "VIEWER") => void;
	isInviting?: boolean;
}

export default function InviteRequestCard({
	invitee,
	projectName,
	onInvite,
	isInviting = false,
}: InviteRequestCardProps) {
	const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER" | "VIEWER">(
		"USER",
	);
	const userName = invitee.displayName || "Unknown";

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
				className="p-3 border-b border-zinc-700/80"
			>
				<ProfilePicture
					profilePicture={invitee.image ?? ""}
					displayName={userName}
					href="#"
					disabled
				/>
				<Container
					direction="vertical"
					gap="none"
					width="full"
					className="items-start"
				>
					<span className="text-sm font-medium text-zinc-100 truncate">
						{userName}
					</span>
					<span className="text-xs font-extralight text-zinc-400">
						Inviting to {projectName}
					</span>
				</Container>
			</Container>

			<Container width="full" gap="none" className="px-2 py-2 bg-zinc-900/50">
				<Container
					direction="vertical"
					width="full"
					gap="sm"
					className="items-start"
				>
					<Container width="full">
						<span className="text-xs font-extralight text-zinc-400 truncate">
							Select Role:
						</span>
					</Container>
					<Container width="full">
						<RoleSelector
							onRoleChange={setSelectedRole}
							defaultValue={selectedRole}
							disabled={isInviting}
						/>
					</Container>
				</Container>
				<Container
					direction="vertical"
					width="full"
					gap="sm"
					className="items-end"
				>
					<Container width="auto" gap="none">
						<Button
							variant="secondary"
							size="xs"
							onClick={() => onInvite(invitee.id, selectedRole)}
							disabled={isInviting}
							loading={isInviting}
							aria-label="Send invite"
							className="min-h-12 flex items-center justify-center min-w-34"
						>
							<IoMail className="size-5 shrink-0" />
							<span className="title-case">
								Invite as {toTitleCase(selectedRole)}
							</span>
						</Button>
					</Container>
				</Container>
			</Container>
		</Container>
	);
}
