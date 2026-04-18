"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Modal from "@pointwise/app/components/ui/modal";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { Tag } from "@pointwise/app/components/ui/Tag";
import { useGetProjectMembersQuery } from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useSession } from "next-auth/react";
import ProfilePicture from "../../userCard/ProfilePicture";

export interface ViewMembersModalProps {
	project: Project;
}

const roleTagVariants: Record<string, "info" | "success" | "warning"> = {
	ADMIN: "warning",
	USER: "info",
	VIEWER: "success",
};

const roleLabels: Record<string, string> = {
	ADMIN: "Admin",
	USER: "User",
	VIEWER: "Viewer",
};

export default function ViewMembersModal({ project }: ViewMembersModalProps) {
	const { data: session } = useSession();
	const currentUserId = session?.user?.id;

	const {
		data: membersData,
		isLoading,
		isError,
		error,
	} = useGetProjectMembersQuery(project.id, {
		skip: !project.id,
	});

	const members = membersData?.members ?? [];

	return (
		<Modal
			id={`view-members-modal-${project.id}`}
			size="xl"
			loading={isLoading && !membersData}
		>
			<Modal.Header title="Project Members" />
			<Modal.Body>
				{isError ? (
					<ErrorCard
						display={true}
						message={getErrorMessage(error)}
						onRetry={() => window.location.reload()}
					/>
				) : members.length > 0 ? (
					<Container
						direction="vertical"
						width="full"
						className="items-stretch"
					>
						{members.map((member) => (
							<Container
								key={member.userId}
								direction="horizontal"
								width="full"
								className="p-3 items-center rounded-lg bg-zinc-700/50 border border-zinc-700/80"
							>
								<ProfilePicture
									profilePicture={member.image ?? ""}
									displayName={member.displayName}
									userId={member.userId}
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
									{member.userId === currentUserId && (
										<Tag variant="info" size="sm">
											You
										</Tag>
									)}
								</Container>
								<Container
									direction="horizontal"
									width="auto"
									className="items-center shrink-0"
								>
									<Tag
										variant={roleTagVariants[member.role] ?? "info"}
										size="sm"
									>
										{roleLabels[member.role] ?? member.role}
									</Tag>
								</Container>
							</Container>
						))}
					</Container>
				) : (
					<Container
						direction="vertical"
						gap="md"
						width="full"
						className="items-center justify-center py-12"
					>
						<p className={`${StyleTheme.Text.Secondary} text-sm`}>
							No members found
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
