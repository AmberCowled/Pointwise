"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { useLeaveProjectMutation } from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";

export interface LeaveProjectConfirmModalProps {
	project: Project;
}

export default function LeaveProjectConfirmModal({
	project,
}: LeaveProjectConfirmModalProps) {
	const router = useRouter();
	const { showNotification } = useNotifications();
	const [leaveProject, { isLoading }] = useLeaveProjectMutation();

	const handleLeaveProject = async () => {
		try {
			await leaveProject({ projectId: project.id }).unwrap();
			Modal.Manager.close(`leave-project-modal-${project.id}`);
			showNotification({
				message: "Project left successfully",
				variant: "success",
			});
			router.push("/dashboard");
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		}
	};

	return (
		<Modal
			id={`leave-project-modal-${project.id}`}
			size="lg"
			loading={isLoading}
		>
			<Modal.Header title="Leave Project" />
			<Modal.Body>
				<Container direction="vertical" gap="sm" className="items-stretch">
					<div className="px-4 py-3 bg-rose-500/10 border border-rose-400/20 rounded-lg">
						<p className="text-rose-400 text-sm font-medium mb-2">
							You will lose access to this project
						</p>
						<p className="text-zinc-400 text-sm">
							Leaving is reversible only by requesting to join again.
							<br />
							Are you sure you want to leave?
						</p>
					</div>
				</Container>
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button
					type="button"
					variant="danger"
					onClick={handleLeaveProject}
					disabled={isLoading}
				>
					Leave Project
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
