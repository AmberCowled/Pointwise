"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import { useUpdateProjectMutation } from "@pointwise/lib/redux/services/projectsApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useEffect, useState } from "react";
import DeleteProjectModal from "./DeleteProjectModal";
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

	useEffect(() => {
		setName(project.name);
		setDescription(project?.description ?? "");
		setVisibility(project.visibility);
	}, [project.name, project.description, project.visibility]);

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
		<>
			<DeleteProjectModal project={project} />
			<ModalV2 id={`update-project-modal-${project.id}`} size="xl" loading={isLoading}>
				<ModalV2.Header title="Update Project" />
				<ModalV2.Body>
					<Container direction="vertical" gap="md" className="items-stretch">
						<ProjectName defaultValue={project.name} onChange={setName} />
						<ProjectDescription
							defaultValue={project?.description ?? ""}
							onChange={setDescription}
						/>
						<VisibilitySelector defaultValue={project.visibility} onChange={setVisibility} />
					</Container>
				</ModalV2.Body>
				<ModalV2.Footer align="end">
					<Button variant="secondary">Cancel</Button>
					<Button
						variant="danger"
						onClick={() => ModalV2.Manager.open(`delete-project-modal-${project.id}`)}
					>
						Delete
					</Button>
					<Button onClick={handleUpdateProject} disabled={!canSubmit()}>
						Update
					</Button>
				</ModalV2.Footer>
			</ModalV2>
		</>
	);
}
