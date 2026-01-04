import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Input from "@pointwise/app/components/ui/Input";
import Modal from "@pointwise/app/components/ui/modal";
import { useDeleteProjectMutation } from "@pointwise/lib/redux/services/projectsApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useState } from "react";

export default function DeleteProjectModal({ project }: { project: Project }) {
	const [deleteString, setDeleteString] = useState<string>("");

	const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

	const handleDeleteProject = async () => {
		try {
			await deleteProject(project.id).unwrap();
			Modal.Manager.close(`delete-project-modal-${project.id}`);
		} catch (error) {
			console.error(error);
		}
	};

	const handleReset = () => {
		setDeleteString("");
	};

	return (
		<Modal
			id={`delete-project-modal-${project.id}`}
			size="lg"
			loading={isDeleting}
			onAfterClose={handleReset}
		>
			<Modal.Header title="Delete Project" />
			<Modal.Body>
				<Container direction="vertical" gap="sm" className="items-stretch">
					<div className="px-4 py-3 bg-rose-500/10 border border-rose-400/20 rounded-lg">
						<p className="text-rose-400 text-sm font-medium mb-2">
							This action cannot be undone
						</p>
						<p className="text-zinc-400 text-sm">
							This will permanently delete the project and all associated tasks.
							All members will lose access to this project.
						</p>
					</div>
					<span className="text-sm font-medium text-zinc-300 pl-4 pt-2">
						Enter the project name to delete: {project.name}
					</span>
					<Input
						placeholder={project.name}
						defaultValue={""}
						onChange={setDeleteString}
						flex="grow"
					/>
				</Container>
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button
					variant="danger"
					disabled={deleteString !== project.name}
					onClick={handleDeleteProject}
				>
					Delete
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
