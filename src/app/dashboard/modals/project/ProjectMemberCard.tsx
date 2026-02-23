"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import InputSelect from "@pointwise/app/components/ui/InputSelect";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { Tag } from "@pointwise/app/components/ui/Tag";
import type { ProjectMember } from "@pointwise/lib/validation/projects-schema";
import { useState } from "react";
import { IoClose, IoSwapHorizontal } from "react-icons/io5";
import ProfilePicture from "../../userCard/ProfilePicture";

export interface ProjectMemberCardProps {
	member: ProjectMember;
	isAdmin: boolean;
	isCurrentUser: boolean;
	onRoleChange: (userId: string, role: "ADMIN" | "USER" | "VIEWER") => void;
	onRemove: (userId: string) => void;
	isLoading: boolean;
}

const roleTagVariants: Record<
	"ADMIN" | "USER" | "VIEWER",
	"info" | "success" | "warning"
> = {
	ADMIN: "warning",
	USER: "info",
	VIEWER: "success",
};

const roleLabels: Record<"ADMIN" | "USER" | "VIEWER", string> = {
	ADMIN: "Admin",
	USER: "User",
	VIEWER: "Viewer",
};

const roleOptions = ["Admin", "User", "Viewer"];
const labelToRole: Record<string, "ADMIN" | "USER" | "VIEWER"> = {
	Admin: "ADMIN",
	User: "USER",
	Viewer: "VIEWER",
};

export default function ProjectMemberCard({
	member,
	isAdmin,
	isCurrentUser,
	onRoleChange,
	onRemove,
	isLoading,
}: ProjectMemberCardProps) {
	const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER" | "VIEWER">(
		member.role,
	);

	const canManage = isAdmin && !isCurrentUser && member.role !== "ADMIN";

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
					profilePicture={member.image ?? ""}
					displayName={member.displayName}
					size="xs"
					className="shrink-0"
				/>
				<Container
					direction="horizontal"
					gap="sm"
					width="full"
					className="items-center min-w-0"
				>
					<span
						className={`text-sm font-medium ${StyleTheme.Text.Primary} truncate`}
					>
						{member.displayName}
					</span>
					{isCurrentUser && (
						<Tag variant="info" size="sm">
							You
						</Tag>
					)}
				</Container>
				{canManage ? (
					<Container
						direction="horizontal"
						width="auto"
						gap="sm"
						className="items-center shrink-0"
					>
						<InputSelect
							options={roleOptions}
							defaultValue={roleLabels[member.role]}
							onSelect={(value) => {
								const role = labelToRole[value];
								if (role) setSelectedRole(role);
							}}
							variant="secondary"
							size="xs"
							flex="shrink"
							disabled={isLoading}
						/>
						<Button
							variant="secondary"
							size="xs"
							icon={IoSwapHorizontal}
							onClick={() => onRoleChange(member.userId, selectedRole)}
							disabled={isLoading || selectedRole === member.role}
							loading={isLoading}
							aria-label="Assign role"
						>
							Assign
						</Button>
						<Button
							variant="danger"
							size="xs"
							icon={IoClose}
							onClick={() => onRemove(member.userId)}
							disabled={isLoading}
							aria-label="Remove member"
						>
							Remove
						</Button>
					</Container>
				) : (
					<Container
						direction="horizontal"
						width="auto"
						gap="sm"
						className="items-center shrink-0"
					>
						<Tag variant={roleTagVariants[member.role]} size="sm">
							{roleLabels[member.role]}
						</Tag>
					</Container>
				)}
			</Container>
		</Container>
	);
}
