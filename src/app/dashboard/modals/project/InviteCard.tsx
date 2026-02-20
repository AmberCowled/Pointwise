"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Card from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { Tag } from "@pointwise/app/components/ui/Tag";
import { formatRelativeTime } from "@pointwise/lib/api/date-time";
import { IoClose, IoPerson } from "react-icons/io5";

export interface InviteCardProps {
	invite: {
		id: string;
		inviterId: string;
		invitedUserId: string;
		projectId: string;
		inviteRole: "ADMIN" | "USER" | "VIEWER";
		createdAt: string;
		updatedAt: string;
		inviter: { id: string; name: string | null };
		invitedUser: {
			id: string;
			name: string | null;
		};
	};
	onCancel: (inviteId: string) => void;
	isCanceling?: boolean;
}

const roleTagVariants: Record<
	"ADMIN" | "USER" | "VIEWER",
	"primary" | "info" | "secondary"
> = {
	ADMIN: "primary",
	USER: "info",
	VIEWER: "secondary",
};

const roleLabels: Record<"ADMIN" | "USER" | "VIEWER", string> = {
	ADMIN: "Admin",
	USER: "Member",
	VIEWER: "Viewer",
};

export default function InviteCard({
	invite,
	onCancel,
	isCanceling = false,
}: InviteCardProps) {
	const invitedUserName = invite.invitedUser.name || "Unknown";
	const inviterName = invite.inviter.name || "Unknown";

	return (
		<Card variant="secondary" size="md" flex="default">
			<Container
				direction="horizontal"
				width="full"
				gap="md"
				className="items-center"
			>
				<Container
					direction="vertical"
					width="full"
					gap="xs"
					className="min-w-0"
				>
					<Container
						direction="horizontal"
						width="full"
						gap="sm"
						className="items-center flex-wrap"
					>
						<IoPerson
							className={`size-5 ${StyleTheme.Text.Secondary} shrink-0`}
						/>
						<Container
							direction="vertical"
							width="auto"
							gap="xs"
							className="min-w-0 flex-1"
						>
							<span
								className={`text-sm font-medium ${StyleTheme.Text.Primary} truncate`}
							>
								{invitedUserName}
							</span>
						</Container>
						<Tag variant={roleTagVariants[invite.inviteRole]} size="sm">
							{roleLabels[invite.inviteRole]}
						</Tag>
					</Container>
					<Container
						direction="horizontal"
						width="full"
						gap="xs"
						className={`items-center text-xs ${StyleTheme.Text.Muted}`}
					>
						<span>Invited by {inviterName}</span>
						<span>•</span>
						<span title={new Date(invite.createdAt).toLocaleString()}>
							{formatRelativeTime(invite.createdAt)}
						</span>
					</Container>
				</Container>
				<Button
					variant="ghost"
					size="xs"
					icon={IoClose}
					onClick={() => onCancel(invite.id)}
					disabled={isCanceling}
					className="shrink-0"
					aria-label="Cancel invite"
				/>
			</Container>
		</Card>
	);
}
