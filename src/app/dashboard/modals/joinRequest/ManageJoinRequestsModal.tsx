"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import Page from "@pointwise/app/components/ui/Page";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import {
	useApproveJoinRequestMutation,
	useGetProjectJoinRequestsQuery,
	useRejectJoinRequestMutation,
} from "@pointwise/lib/redux/services/joinRequestsApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useState } from "react";
import JoinRequestCard from "../../joinRequest/JoinRequestCard";

export interface ManageJoinRequestsModalProps {
	project: Project;
}

export default function ManageJoinRequestsModal({
	project,
}: ManageJoinRequestsModalProps) {
	const { showNotification } = useNotifications();
	const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
	const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);

	const { data, isLoading, isError, error } = useGetProjectJoinRequestsQuery(
		project.id,
		{
			skip: !project.id,
		},
	);

	const [approveJoinRequest] = useApproveJoinRequestMutation();
	const [rejectJoinRequest] = useRejectJoinRequestMutation();

	const handleApproveRequest = async (
		userId: string,
		role: "ADMIN" | "USER" | "VIEWER",
	) => {
		setApprovingUserId(userId);
		try {
			await approveJoinRequest({
				projectId: project.id,
				userId,
				role,
			}).unwrap();
			showNotification({
				message: "Join request approved successfully",
				variant: "success",
			});
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		} finally {
			setApprovingUserId(null);
		}
	};

	const handleRejectRequest = async (userId: string) => {
		setRejectingUserId(userId);
		try {
			await rejectJoinRequest({
				projectId: project.id,
				userId,
			}).unwrap();
			showNotification({
				message: "Join request rejected successfully",
				variant: "success",
			});
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		} finally {
			setRejectingUserId(null);
		}
	};

	const requests = data?.requests || [];
	const hasRequests = requests.length > 0;

	return (
		<Modal
			id={`manage-join-requests-modal-${project.id}`}
			size="fullscreen"
			loading={isLoading && !data}
		>
			<Modal.Header title="Manage Join Requests" className="text-center" />
			<Modal.Body className="p-0!">
				<Page height="auto" backgroundGlow={false}>
					{isError ? (
						<ErrorCard
							display={true}
							message={getErrorMessage(error)}
							onRetry={() => window.location.reload()}
						/>
					) : hasRequests ? (
						<Container direction="vertical" className="p-2">
							{requests.map((request) => (
								<JoinRequestCard
									key={request.userId}
									request={request}
									onApprove={handleApproveRequest}
									onReject={handleRejectRequest}
									isApproving={approvingUserId === request.userId}
									isRejecting={rejectingUserId === request.userId}
								/>
							))}
						</Container>
					) : (
						<Container
							direction="vertical"
							width="full"
							className="items-center justify-center py-12"
						>
							<p className="text-zinc-400 text-sm">No pending join requests</p>
						</Container>
					)}
				</Page>
			</Modal.Body>
			<Modal.Footer align="center" className="p-0!">
				<Button
					variant="secondary"
					className="w-full min-h-[60px] rounded-none border-none border-t border-white/10 m-0"
				>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
