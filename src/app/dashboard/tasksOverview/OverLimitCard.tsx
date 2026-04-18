"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Card from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import EditRolesModal from "@pointwise/app/dashboard/modals/project/EditRolesModal";
import LeaveProjectConfirmModal from "@pointwise/app/dashboard/modals/project/LeaveProjectConfirmModal";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useSession } from "next-auth/react";
import { IoLockClosed, IoShield } from "react-icons/io5";

export interface OverLimitCardProps {
	project: Project;
}

export default function OverLimitCard({ project }: OverLimitCardProps) {
	const { data: session } = useSession();
	const currentUserId = session?.user?.id;
	const isAdmin = project.role === "ADMIN";
	const isOwner = project.ownerId === currentUserId;
	const info = project.memberLimitInfo;
	if (!info) return null;

	const excess = info.current - info.limit;

	return (
		<>
			{(isAdmin || isOwner) && <EditRolesModal project={project} />}
			{!isOwner && <LeaveProjectConfirmModal project={project} />}
			<Card variant="danger" className="mb-6 w-full">
				<Container direction="vertical" gap="sm" className="items-center py-4">
					<IoLockClosed className="h-10 w-10 text-amber-400" />
					<h3 className="text-lg font-semibold text-white">
						Project Over {info.ownerTier} Tier Limit
					</h3>
					<p className={`${StyleTheme.Text.Secondary} text-sm text-center`}>
						This project has {info.current} member
						{info.current !== 1 ? "s" : ""} but the {info.ownerTier} tier allows
						only {info.limit}. Please remove {excess} user
						{excess !== 1 ? "s" : ""} to unlock the project.
					</p>
					<div className="flex gap-2 mt-2">
						{isAdmin || isOwner ? (
							<Button
								variant="secondary"
								onClick={() =>
									Modal.Manager.open(`edit-roles-modal-${project.id}`)
								}
							>
								<IoShield className="h-4 w-4 mr-1" />
								Manage Members
							</Button>
						) : (
							<Button
								variant="secondary"
								onClick={() =>
									Modal.Manager.open(`leave-project-modal-${project.id}`)
								}
							>
								Leave Project
							</Button>
						)}
					</div>
				</Container>
			</Card>
		</>
	);
}
