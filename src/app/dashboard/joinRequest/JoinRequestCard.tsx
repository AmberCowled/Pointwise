"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { formatRelativeTime } from "@pointwise/lib/api/date-time";
import { useState } from "react";
import { IoCheckmark, IoClose, IoPersonCircle } from "react-icons/io5";
import RoleSelector from "../userCard/RoleSelector";

export interface JoinRequestCardProps {
	request: {
		userId: string;
		name: string | null;
		requestedAt: string;
	};
	onApprove: (userId: string, role: "ADMIN" | "USER" | "VIEWER") => void;
	onReject: (userId: string) => void;
	isApproving?: boolean;
	isRejecting?: boolean;
}

export default function JoinRequestCard({
	request,
	onApprove,
	onReject,
	isApproving = false,
	isRejecting = false,
}: JoinRequestCardProps) {
	const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER" | "VIEWER">(
		"USER",
	);
	const userName = request.name || "Unknown";

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
				<IoPersonCircle className="size-10 text-zinc-200 shrink-0" />
				<Container
					direction="vertical"
					gap="none"
					width="full"
					className="items-start"
				>
					<span className="text-sm font-medium text-zinc-100 truncate">
						{userName}
					</span>
					<span
						className="text-xs font-extralight text-zinc-400"
						title={new Date(request.requestedAt).toLocaleString()}
					>
						Requested {formatRelativeTime(request.requestedAt)}
					</span>
				</Container>
			</Container>

			<Container width="full" gap="none" className="px-3 py-2 bg-zinc-900/50">
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
							disabled={isApproving || isRejecting}
						/>
					</Container>
				</Container>
				<Container
					direction="vertical"
					width="full"
					gap="sm"
					className="items-end"
				>
					<Container width="auto" className="text-center">
						<span className="text-xs font-extralight text-zinc-400">
							Deny / Approve
						</span>
					</Container>
					<Container width="auto" gap="xs">
						<Button
							variant="danger"
							size="xs"
							onClick={() => onReject(request.userId)}
							disabled={isApproving || isRejecting}
							loading={isRejecting}
							aria-label="Reject request"
							className="max-h-6 flex items-center justify-center min-w-10"
						>
							<IoClose className="size-4 text-red-400 shrink-0" />
						</Button>

						<Button
							variant="secondary"
							size="xs"
							onClick={() => onApprove(request.userId, selectedRole)}
							disabled={isApproving || isRejecting}
							loading={isApproving}
							aria-label="Approve request"
							className="max-h-6 flex items-center justify-center min-w-10"
						>
							<IoCheckmark className="size-4 text-green-400 shrink-0" />
						</Button>
					</Container>
				</Container>
			</Container>
		</Container>
	);
}
