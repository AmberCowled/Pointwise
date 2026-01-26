import Container from "@pointwise/app/components/ui/Container";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import TaskHeader from "./TaskHeader";

export interface TaskCardV2Props {
	task: Task;
	project: Project;
}

export default function TaskCardV2({ task, project }: TaskCardV2Props) {
	return (
		<Container
			width="full"
			gap="none"
			className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700/50 hover:border-white/20"
		>
			<TaskHeader task={task} />
		</Container>
	);
}
