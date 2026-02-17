"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { useUpdateProjectMutation } from "@pointwise/generated/api";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useEffect, useState } from "react";
import DeleteProjectModal from "./DeleteProjectModal";
import ProjectDescription from "./ProjectDescription";
import ProjectGoal from "./ProjectGoal";
import ProjectName from "./ProjectName";
import VisibilitySelector from "./VisibilitySelector";

export interface UpdateProjectModalProps {
	project: Project;
}

export default function UpdateProjectModal({
	project,
}: UpdateProjectModalProps) {
	const [name, setName] = useState<string>(project.name);
	const [description, setDescription] = useState<string>(
		project?.description ?? "",
	);
	const [goal, setGoal] = useState<string>(project?.goal ?? "");
	const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
		project.visibility,
	);

	const [updateProject, { isLoading }] = useUpdateProjectMutation();

	useEffect(() => {
		setName(project.name);
		setDescription(project?.description ?? "");
		setGoal(project?.goal ?? "");
		setVisibility(project.visibility);
	}, [project.name, project.description, project.goal, project.visibility]);

	const handleUpdateProject = async () => {
		try {
			await updateProject({
				projectId: project.id,
				data: {
					name: name.trim(),
					description: description?.trim() || null,
					goal: goal.trim() || null,
					visibility,
				},
			}).unwrap();
			Modal.Manager.close(`update-project-modal-${project.id}`);
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
		const normalizedGoal = goal.trim() || null;
		const normalizedProjectGoal = project.goal || null;

		const hasChanges =
			name.trim() !== project.name ||
			normalizedDescription !== normalizedProjectDescription ||
			normalizedGoal !== normalizedProjectGoal ||
			visibility !== project.visibility;

		return hasChanges;
	};

	return (
		<>
			<DeleteProjectModal project={project} />
			<Modal
				id={`update-project-modal-${project.id}`}
				size="xl"
				loading={isLoading}
			>
				<Modal.Header title="Update Project" />
				<Modal.Body>
					<Container direction="vertical" gap="md" className="items-stretch">
						<ProjectName defaultValue={project.name} onChange={setName} />
						<ProjectDescription
							defaultValue={project?.description ?? ""}
							onChange={setDescription}
						/>
						<ProjectGoal
							defaultValue={project?.goal ?? ""}
							onChange={setGoal}
						/>
						<VisibilitySelector
							defaultValue={project.visibility}
							onChange={setVisibility}
						/>
					</Container>
				</Modal.Body>
				<Modal.Footer align="end">
					<Button variant="secondary">Cancel</Button>
					<Button
						variant="danger"
						onClick={() =>
							Modal.Manager.open(`delete-project-modal-${project.id}`)
						}
					>
						Delete
					</Button>
					<Button onClick={handleUpdateProject} disabled={!canSubmit()}>
						Update
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
