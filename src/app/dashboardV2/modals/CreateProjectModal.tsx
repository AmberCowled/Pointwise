"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import { useCreateProjectMutation } from "@pointwise/lib/redux/services/projectsApi";
import { useState } from "react";
import ProjectDescription from "./ProjectDescription";
import ProjectName from "./ProjectName";
import VisibilitySelector from "./VisibilitySelector";

export default function CreateProjectModal() {
	const defaultVisibility = "PRIVATE";

	const [name, setName] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(defaultVisibility);

	const [createProject, { isLoading }] = useCreateProjectMutation();

	const handleCreateProject = async () => {
		try {
			await createProject({
				name: name.trim(),
				description: description?.trim() || null,
				visibility,
			}).unwrap();
			ModalV2.Manager.close("create-project-modal");
		} catch (error) {
			console.error(error);
		}
	};

	const handleReset = () => {
		setName("");
		setDescription("");
		setVisibility(defaultVisibility);
	};

	return (
		<ModalV2 id="create-project-modal" size="lg" onAfterClose={handleReset}>
			<ModalV2.Header title="Create Project" />
			<ModalV2.Body>
				<Container direction="vertical" gap="md" className="items-stretch">
					<ProjectName onChange={setName} />
					<ProjectDescription onChange={setDescription} />
					<VisibilitySelector defaultValue={defaultVisibility} onChange={setVisibility} />
				</Container>
			</ModalV2.Body>
			<ModalV2.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button onClick={handleCreateProject} disabled={isLoading || !name.trim()}>
					Create Project
				</Button>
			</ModalV2.Footer>
		</ModalV2>
	);
}
