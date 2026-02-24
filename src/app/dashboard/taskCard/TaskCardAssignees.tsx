"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useGetProjectMembersQuery } from "@pointwise/generated/api";
import ProfilePicture from "../userCard/ProfilePicture";

export interface TaskCardAssigneesProps {
	assignedUserIds: string[];
	projectId: string;
}

const MAX_VISIBLE = 3;

export default function TaskCardAssignees({
	assignedUserIds,
	projectId,
}: TaskCardAssigneesProps) {
	const { data: membersData } = useGetProjectMembersQuery(projectId, {
		skip: !projectId,
	});

	if (assignedUserIds.length === 0) return null;

	const members = membersData?.members ?? [];
	const assignedMembers = assignedUserIds
		.map((id) => members.find((m) => m.userId === id))
		.filter(Boolean) as typeof members;

	if (assignedMembers.length === 0) return null;

	const visible = assignedMembers.slice(0, MAX_VISIBLE);
	const remaining = assignedMembers.slice(MAX_VISIBLE);

	return (
		<Container width="full" gap="xs" className="items-center justify-start">
			<span className={`text-xs ${StyleTheme.Text.Secondary}`}>Assigned:</span>
			<Container width="auto" gap="none" className="items-center -space-x-1">
				{visible.map((member) => (
					<Container key={member.userId} width="auto" gap="none">
						<div title={member.displayName}>
							<ProfilePicture
								profilePicture={member.image ?? ""}
								displayName={member.displayName}
								size="xs"
								className="w-6! h-6! mr-2 shrink-0"
							/>
						</div>
					</Container>
				))}
			</Container>
			{remaining.length > 0 && (
				<span
					className={`text-xs ${StyleTheme.Text.Secondary}`}
					title={remaining.map((m) => m.displayName).join(", ")}
				>
					and {remaining.length} {remaining.length === 1 ? "other" : "others"}
				</span>
			)}
		</Container>
	);
}
