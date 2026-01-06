"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { useUserId } from "@pointwise/hooks/useUserId";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import {
	useCancelRequestToJoinProjectMutation,
	useRequestToJoinProjectMutation,
} from "@pointwise/lib/redux/services/projectsApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useState } from "react";

export interface ProjectCardJoinRequestButtonProps {
	project: Project;
}

export default function ProjectCardJoinRequestButton({
	project,
}: ProjectCardJoinRequestButtonProps) {
	const userId = useUserId();

	const [loading, setLoading] = useState(false);
	const [cancelRequestToJoinProject] = useCancelRequestToJoinProjectMutation();
	const [requestToJoinProject] = useRequestToJoinProjectMutation();
	const { showNotification } = useNotifications();

	const handleCancelRequest = async () => {
		try {
			setLoading(true);
			await cancelRequestToJoinProject({ projectId: project.id }).unwrap();
			setLoading(false);
			showNotification({
				message: "Join request cancelled",
				variant: "success",
			});
		} catch (error) {
			setLoading(false);
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		}
	};

	const handleRequestToJoin = async () => {
		try {
			setLoading(true);
			await requestToJoinProject({ projectId: project.id }).unwrap();
			setLoading(false);
			showNotification({
				message: "Join request sent",
				variant: "success",
			});
		} catch (error) {
			setLoading(false);
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		}
	};
	return (
		<>
			{project.role === "NONE" && (
				<Container width="full" className="justify-end">
					<Button
						variant="primary"
						size="xs"
						loading={loading}
						className="mb-1"
						onClick={() => {
							project.joinRequestUserIds.includes(userId)
								? handleCancelRequest()
								: handleRequestToJoin();
						}}
					>
						{project.joinRequestUserIds.includes(userId)
							? "Cancel Request"
							: "Request to Join"}
					</Button>
				</Container>
			)}
		</>
	);
}
