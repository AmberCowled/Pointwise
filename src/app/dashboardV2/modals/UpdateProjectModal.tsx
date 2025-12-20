"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import {
	useDeleteProjectMutation,
	useUpdateProjectMutation,
} from "@pointwise/lib/redux/services/projectsApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useEffect, useState } from "react";
import ProjectDescription from "./ProjectDescription";
import ProjectName from "./ProjectName";
import VisibilitySelector from "./VisibilitySelector";

export interface UpdateProjectModalProps {
	project: Project;
}

export default function UpdateProjectModal({ project }: UpdateProjectModalProps) {
	const [name, setName] = useState<string>(project.name);
	const [description, setDescription] = useState<string>(project?.description ?? "");
	const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(project.visibility);

	const [updateProject, { isLoading }] = useUpdateProjectMutation();
	const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

	useEffect(() => {
		setName(project.name);
		setDescription(project?.description ?? "");
		setVisibility(project.visibility);
	}, [project.name, project.description, project.visibility]);

	const handleDeleteProject = async () => {
		const confirmed = await ModalV2.Confirm({
			title: "Delete Project",
			message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
			confirmText: "Delete",
			cancelText: "Cancel",
			confirmVariant: "danger",
			cancelVariant: "secondary",
		});

		if (!confirmed) {
			return;
		}

		try {
			await deleteProject(project.id).unwrap();
			ModalV2.Manager.close(`update-project-modal-${project.id}`);
		} catch (error) {
			console.error("Failed to delete project:", error);
			await ModalV2.Alert({
				title: "Error",
				message: "Failed to delete project. Please try again.",
				buttonVariant: "danger",
			});
		}
	};

	const handleUpdateProject = async () => {
		try {
			await updateProject({
				projectId: project.id,
				data: {
					name: name.trim(),
					description: description?.trim() || null,
					visibility,
				},
			}).unwrap();
			ModalV2.Manager.close(`update-project-modal-${project.id}`);
		} catch (error) {
			console.error(error);
		}
	};

	const canSubmit = () => {
		if (!name.trim()) {
			return false;
		}

		const normalizedDescription = description.trim() || null;
		const normalizedProjectDescription = project.description || null;

		const hasChanges =
			name.trim() !== project.name ||
			normalizedDescription !== normalizedProjectDescription ||
			visibility !== project.visibility;

		return hasChanges;
	};

	return (
		<ModalV2 id={`update-project-modal-${project.id}`} size="lg" loading={isLoading || isDeleting}>
			<ModalV2.Header title="Update Project" />
			<ModalV2.Body>
				<Container direction="vertical" gap="md" className="items-stretch">
					<ProjectName defaultValue={project.name} onChange={setName} />
					<ProjectDescription defaultValue={project?.description ?? ""} onChange={setDescription} />
					<VisibilitySelector defaultValue={project.visibility} onChange={setVisibility} />
				</Container>
			</ModalV2.Body>
			<ModalV2.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button variant="danger" onClick={handleDeleteProject}>
					Delete
				</Button>
				<Button onClick={handleUpdateProject} disabled={!canSubmit()}>
					Update
				</Button>
			</ModalV2.Footer>
		</ModalV2>
	);
}
