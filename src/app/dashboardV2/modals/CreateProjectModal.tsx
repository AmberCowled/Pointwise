"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import InputAreaV2 from "@pointwise/app/components/ui/InputAreaV2";
import InputV2 from "@pointwise/app/components/ui/InputV2";
import ModalV2 from "@pointwise/app/components/ui/modalV2";

export default function CreateProjectModal() {
	return (
		<ModalV2 id="create-project-modal" size="lg">
			<ModalV2.Header title="Create Project" />
			<ModalV2.Body>
				<Container direction="vertical" gap="md" className="items-stretch">
					<InputV2 label="Project Name" placeholder="My Project" required flex="grow" />
					<InputAreaV2
						label="Project Description"
						placeholder="What is this project about?"
						rows={3}
						required
						flex="grow"
					/>
				</Container>
			</ModalV2.Body>
			<ModalV2.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button>Create Project</Button>
			</ModalV2.Footer>
		</ModalV2>
	);
}
