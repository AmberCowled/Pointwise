"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import InputAreaV2 from "@pointwise/app/components/ui/InputAreaV2";
import InputV2 from "@pointwise/app/components/ui/InputV2";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import Selector from "@pointwise/app/components/ui/Selector";
import { useCreateProjectMutation } from "@pointwise/lib/redux/services/projectsApi";
import { useState } from "react";
import { IoGlobe, IoLockClosed } from "react-icons/io5";

export default function CreateProjectModal() {
	const [name, setName] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

	const [createProject, { isLoading }] = useCreateProjectMutation();

	const handleCreateProject = async () => {
		try {
			await createProject({
				name: name.trim(),
				description: description.trim() || undefined,
				visibility,
			}).unwrap();
			ModalV2.Manager.close("create-project-modal");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<ModalV2 id="create-project-modal" size="lg">
			<ModalV2.Header title="Create Project" />
			<ModalV2.Body>
				<Container direction="vertical" gap="md" className="items-stretch">
					<InputV2
						label="Project Name"
						placeholder="My Project"
						required
						flex="grow"
						onChange={setName}
					/>
					<InputAreaV2
						label="Description"
						placeholder="What is this project about?"
						rows={3}
						flex="grow"
						onChange={setDescription}
					/>
					<Selector
						label="Visibility"
						defaultValue="PRIVATE"
						gap="md"
						flex="grow"
						onChange={(value) => setVisibility(value as "PUBLIC" | "PRIVATE")}
					>
						<Selector.Option
							icon={IoLockClosed}
							description="Only you can access"
							value="PRIVATE"
							label="Private"
						/>
						<Selector.Option
							icon={IoGlobe}
							description="Anyone can access"
							value="PUBLIC"
							label="Public"
						/>
					</Selector>
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
