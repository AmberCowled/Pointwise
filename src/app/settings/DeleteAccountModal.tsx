"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Input from "@pointwise/app/components/ui/Input";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { Spinner } from "@pointwise/app/components/ui/Spinner";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useGetDeletePreviewQuery } from "@pointwise/generated/api";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";

interface DeleteAccountModalProps {
	onClose: () => void;
}

export default function DeleteAccountModal({
	onClose,
}: DeleteAccountModalProps) {
	const modalId = "delete-account";
	const { data, isLoading } = useGetDeletePreviewQuery();

	useEffect(() => {
		Modal.Manager.open(modalId);
	}, []);
	const { showNotification } = useNotifications();
	const [confirmEmail, setConfirmEmail] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const preview = data?.preview;
	const emailMatches =
		preview?.email &&
		confirmEmail.toLowerCase() === preview.email.toLowerCase();

	const handleDelete = async () => {
		if (!emailMatches) return;
		setIsDeleting(true);

		try {
			const res = await fetch("/api/auth/delete-account", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ confirmEmail }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error ?? "Failed to delete account");
			}

			showNotification({
				message: "Your account has been deleted",
				variant: "success",
			});
			await signOut({ callbackUrl: "/" });
		} catch (err) {
			setIsDeleting(false);
			showNotification({
				message:
					err instanceof Error ? err.message : "Failed to delete account",
				variant: "error",
			});
		}
	};

	const handleClose = () => {
		Modal.Manager.close(modalId);
	};

	return (
		<Modal id={modalId} size="md" onAfterClose={onClose}>
			<Modal.Header
				title="Delete Account"
				showCloseButton
				onClose={handleClose}
			/>
			<Modal.Body>
				<Container direction="vertical" gap="md" className="py-2">
					{isLoading ? (
						<div className="flex justify-center py-4">
							<Spinner size="md" />
						</div>
					) : (
						<>
							<div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
								<IoWarningOutline className="text-red-400 text-xl shrink-0 mt-0.5" />
								<div>
									<p
										className={`text-sm font-medium ${StyleTheme.Text.Primary}`}
									>
										This action is permanent and cannot be undone.
									</p>
									<p className="text-xs text-zinc-400 mt-1">
										All your data will be permanently deleted, including your
										profile, projects, messages, and activity history.
									</p>
								</div>
							</div>

							{preview && preview.soleAdminProjects.length > 0 && (
								<div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
									<p className="text-sm font-medium text-amber-300 mb-2">
										The following projects will be permanently deleted because
										you are the sole admin:
									</p>
									<ul className="space-y-1">
										{preview.soleAdminProjects.map((p) => (
											<li
												key={p.id}
												className="text-xs text-zinc-300 flex items-center gap-2"
											>
												<span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
												<span className="font-medium">{p.name}</span>
												<span className="text-zinc-500">
													· {p.memberCount} member
													{p.memberCount !== 1 ? "s" : ""} · {p.taskCount} task
													{p.taskCount !== 1 ? "s" : ""}
												</span>
											</li>
										))}
									</ul>
									<p className="text-xs text-amber-400/70 mt-2">
										Consider assigning another admin to these projects before
										deleting your account.
									</p>
								</div>
							)}

							<div>
								<p className={`text-sm ${StyleTheme.Text.Secondary} mb-2`}>
									Type your email address{" "}
									<span className="font-mono text-zinc-300">
										{preview?.email}
									</span>{" "}
									to confirm:
								</p>
								<Input
									defaultValue={confirmEmail}
									onChange={setConfirmEmail}
									placeholder="Enter your email"
									variant="danger"
									autoComplete="off"
								/>
							</div>
						</>
					)}
				</Container>
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
					Cancel
				</Button>
				<Button
					variant="danger"
					onClick={handleDelete}
					disabled={!emailMatches || isDeleting}
					loading={isDeleting}
				>
					Delete my account
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
