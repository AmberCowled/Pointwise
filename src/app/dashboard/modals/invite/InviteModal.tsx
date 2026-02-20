"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import Page from "@pointwise/app/components/ui/Page";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	useCanInviteQuery,
	useGetProjectsQuery,
} from "@pointwise/generated/api";
import type { SearchableUser } from "@pointwise/lib/validation/users-schema";
import React from "react";
import { getErrorMessage } from "../../../../lib/api/errors";
import { ErrorCard } from "../../../components/ui/ErrorCard";
import ProjectCard from "../../projectCard/ProjectCard";
import InviteAsRoleModal from "./InviteAsRoleModal";

export interface InviteModalProps {
	inviteUser: SearchableUser; // The user who is being invited
}

// Component to check if a user can be invited to a project
function ProjectInviteChecker({
	projectId,
	inviteeId,
	children,
	onRender,
	onLoading,
}: {
	projectId: string;
	inviteeId: string;
	children: (canInvite: boolean) => React.ReactNode;
	onRender?: (rendered: boolean) => void;
	onLoading?: (loading: boolean) => void;
}) {
	const { data, isLoading, isError } = useCanInviteQuery({
		projectId,
		inviteeId,
		role: "USER",
	});

	// If there's an error (e.g., user already invited), cannot invite
	// If loading, undefined (will be handled)
	// Otherwise, use the success value from data
	const canInvite = isLoading
		? undefined
		: isError
			? false
			: (data?.success ?? false);

	React.useEffect(() => {
		onLoading?.(isLoading);
	}, [isLoading, onLoading]);

	React.useEffect(() => {
		if (!isLoading && canInvite !== undefined) {
			onRender?.(canInvite);
		}
	}, [canInvite, isLoading, onRender]);

	if (isLoading) return null;

	return <>{children(canInvite ?? false)}</>;
}

export default function InviteModal({ inviteUser }: InviteModalProps) {
	const {
		data: projects,
		isError,
		error,
		isLoading: isLoadingProjects,
	} = useGetProjectsQuery();
	const [renderedProjectsCount, setRenderedProjectsCount] = React.useState(0);
	const [projectRenderStates, setProjectRenderStates] = React.useState<
		Map<string, boolean>
	>(new Map());
	const [loadingProjects, setLoadingProjects] = React.useState<Set<string>>(
		new Set(),
	);

	const projectsList = projects?.projects || [];

	// Update rendered count when project render states change
	React.useEffect(() => {
		const renderedCount = Array.from(projectRenderStates.values()).filter(
			Boolean,
		).length;
		setRenderedProjectsCount(renderedCount);
	}, [projectRenderStates]);

	const handleProjectRender = React.useCallback(
		(projectId: string, rendered: boolean) => {
			setProjectRenderStates((prev) => new Map(prev.set(projectId, rendered)));
			setLoadingProjects((prev) => {
				const next = new Set(prev);
				next.delete(projectId);
				return next;
			});
		},
		[],
	);

	const handleProjectLoading = React.useCallback(
		(projectId: string, loading: boolean) => {
			setLoadingProjects((prev) => {
				const next = new Set(prev);
				if (loading) {
					next.add(projectId);
				} else {
					next.delete(projectId);
				}
				return next;
			});
		},
		[],
	);

	const isLoadingAny = isLoadingProjects || loadingProjects.size > 0;

	return (
		<Modal id={`invite-modal-${inviteUser.id}`} size="fullscreen">
			<Modal.Header title="Invite" className="text-center" />
			<Modal.Body className="p-0!">
				<Page height="auto" backgroundGlow={false}>
					{isError ? (
						<ErrorCard
							display={true}
							message={getErrorMessage(error)}
							onRetry={() => window.location.reload()}
						/>
					) : projectsList.length > 0 ? (
						<Container direction="vertical" className="p-2 text-center">
							{projectsList.map((project) => (
								<ProjectInviteChecker
									key={`project-checker-${project.id}`}
									projectId={project.id}
									inviteeId={inviteUser.id}
									onRender={(rendered) =>
										handleProjectRender(project.id, rendered)
									}
									onLoading={(loading) =>
										handleProjectLoading(project.id, loading)
									}
								>
									{(canInvite) =>
										canInvite ? (
											<React.Fragment key={`invite-section-${project.id}`}>
												<InviteAsRoleModal
													key={`invite-as-role-modal-${inviteUser.id}-${project.id}`}
													inviteUser={inviteUser}
													project={project}
												/>
												<ProjectCard
													key={`project-card-${project.id}`}
													project={project}
													disableMenu={true}
													overrideOnClick={() => {
														Modal.Manager.open(
															`invite-as-role-modal-${inviteUser.id}-${project.id}`,
														);
													}}
												/>
											</React.Fragment>
										) : null
									}
								</ProjectInviteChecker>
							))}
							{!isLoadingAny && renderedProjectsCount === 0 && (
								<Container
									direction="vertical"
									width="full"
									className="items-center justify-center py-12"
								>
									<p className={`${StyleTheme.Text.Secondary} text-sm`}>
										No projects available
									</p>
								</Container>
							)}
						</Container>
					) : (
						<Container
							direction="vertical"
							width="full"
							className="items-center justify-center py-12"
						>
							<p className={`${StyleTheme.Text.Secondary} text-sm`}>
								No projects available
							</p>
						</Container>
					)}
				</Page>
			</Modal.Body>
			<Modal.Footer align="center" className="p-0!">
				<Button
					variant="secondary"
					className="w-full min-h-[60px] rounded-none border-none border-t m-0"
				>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
