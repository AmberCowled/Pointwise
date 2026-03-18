"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Modal from "@pointwise/app/components/ui/modal";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { TabsV2 } from "@pointwise/app/components/ui/TabsV2";
import { useEditPostMutation } from "@pointwise/generated/api";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const TaskDescription = dynamic(
	() => import("@pointwise/app/dashboard/taskCard/TaskDescription"),
	{ ssr: false },
);

const TAB_ITEMS = [
	{ id: "write", label: "Write" },
	{ id: "preview", label: "Preview" },
];

interface EditPostModalProps {
	postId: string;
	userId: string;
	initialContent: string;
	open: boolean;
	onClose: () => void;
}

export default function EditPostModal({
	postId,
	userId,
	initialContent,
	open,
	onClose,
}: EditPostModalProps) {
	const modalId = `edit-post-${postId}`;
	const [content, setContent] = useState(initialContent);
	const [activeTab, setActiveTab] = useState("write");
	const [editPost, { isLoading }] = useEditPostMutation();

	useEffect(() => {
		if (open) {
			setContent(initialContent);
			setActiveTab("write");
			Modal.Manager.open(modalId);
		}
	}, [open, initialContent, modalId]);

	const handleSubmit = async () => {
		const trimmed = content.trim();
		if (!trimmed || isLoading) return;
		await editPost({ userId, postId, content: trimmed });
		Modal.Manager.close(modalId);
		onClose();
	};

	const handleClose = () => {
		setActiveTab("write");
		onClose();
	};

	return (
		<Modal id={modalId} size="2xl" onAfterClose={handleClose}>
			<Modal.Header title="Edit Post" showCloseButton />
			<Modal.Body padding="none">
				<TabsV2
					items={TAB_ITEMS}
					value={activeTab}
					onChange={setActiveTab}
					size="sm"
				/>
				<div className="p-4">
					{activeTab === "write" && (
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="What's on your mind?"
							rows={8}
							maxLength={5000}
							className={`block w-full h-[208px] resize-none rounded-lg border ${StyleTheme.Container.Border.Subtle} ${StyleTheme.Container.BackgroundMuted} px-3 py-2 text-[16px] ${StyleTheme.Text.Body} placeholder-zinc-500 focus:border-zinc-500 focus:outline-none`}
						/>
					)}
					{activeTab === "preview" && (
						<div
							className={`h-[208px] overflow-y-auto rounded-lg border ${StyleTheme.Container.Border.Subtle} ${StyleTheme.Container.BackgroundMuted} px-3 py-2`}
						>
							{content.trim() ? (
								<TaskDescription description={content} />
							) : (
								<p className="text-[16px] text-zinc-500 italic">
									Nothing to preview
								</p>
							)}
						</div>
					)}
				</div>
			</Modal.Body>
			<Modal.Footer align="end">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						Modal.Manager.close(modalId);
						onClose();
					}}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="sm"
					onClick={handleSubmit}
					disabled={!content.trim() || isLoading}
					loading={isLoading}
				>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
