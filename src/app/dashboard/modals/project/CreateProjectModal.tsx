"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { useCreateProjectMutation } from "@pointwise/lib/redux/services/projectsApi";
import { useState } from "react";
import ProjectDescription from "./ProjectDescription";
import ProjectGoal from "./ProjectGoal";
import ProjectName from "./ProjectName";
import VisibilitySelector from "./VisibilitySelector";

export default function CreateProjectModal() {
	const defaultVisibility = "PRIVATE";
	const CREATE_PROJECT_MODAL_ID = "create-project-modal";

	const [name, setName] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [goal, setGoal] = useState<string>("");
	const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
		defaultVisibility,
	);

	const [createProject, { isLoading }] = useCreateProjectMutation();

	const handleCreateProject = async () => {
		try {
			await createProject({
				name: name.trim(),
				description: description?.trim() || null,
				goal: goal.trim() || null,
				visibility,
			}).unwrap();
			Modal.Manager.close("create-project-modal");
		} catch (error) {
			console.error(error);
		}
	};

	const handleReset = () => {
		setName("");
		setDescription("");
		setGoal("");
		setVisibility(defaultVisibility);
	};

	return (
		<Modal
			id={CREATE_PROJECT_MODAL_ID}
			size="xl"
			loading={isLoading}
			onAfterClose={handleReset}
		>
			<Modal.Header title="Create Project" />
			<Modal.Body>
				<Container direction="vertical" gap="md" className="items-stretch">
					<ProjectName onChange={setName} />
					<ProjectDescription onChange={setDescription} />
					<ProjectGoal onChange={setGoal} />
					<VisibilitySelector
						defaultValue={defaultVisibility}
						onChange={setVisibility}
					/>
				</Container>
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button onClick={handleCreateProject} disabled={!name.trim()}>
					Create
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
