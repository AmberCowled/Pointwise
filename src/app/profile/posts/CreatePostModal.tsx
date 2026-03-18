"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Modal from "@pointwise/app/components/ui/modal";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { TabsV2 } from "@pointwise/app/components/ui/TabsV2";
import { useCreatePostMutation } from "@pointwise/generated/api";
import dynamic from "next/dynamic";
import { useState } from "react";

const TaskDescription = dynamic(
	() => import("@pointwise/app/dashboard/taskCard/TaskDescription"),
	{ ssr: false },
);

const MODAL_ID = "create-post";

const TAB_ITEMS = [
	{ id: "write", label: "Write" },
	{ id: "preview", label: "Preview" },
];

export function openCreatePostModal() {
	Modal.Manager.open(MODAL_ID);
}

export default function CreatePostModal({ userId }: { userId: string }) {
	const [content, setContent] = useState("");
	const [activeTab, setActiveTab] = useState("write");
	const [createPost, { isLoading }] = useCreatePostMutation();

	const handleSubmit = async () => {
		const trimmed = content.trim();
		if (!trimmed || isLoading) return;
		await createPost({ userId, content: trimmed });
		setContent("");
		setActiveTab("write");
		Modal.Manager.close(MODAL_ID);
	};

	const handleClose = () => {
		setContent("");
		setActiveTab("write");
	};

	return (
		<Modal id={MODAL_ID} size="2xl" onAfterClose={handleClose}>
			<Modal.Header title="Create Post" showCloseButton />
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
					onClick={() => Modal.Manager.close(MODAL_ID)}
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
					Post
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
