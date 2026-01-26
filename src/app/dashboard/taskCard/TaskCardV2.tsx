import Container from "@pointwise/app/components/ui/Container";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { useState } from "react";
import TaskDescription from "./TaskDescription";
import TaskHeader from "./TaskHeader";

export interface TaskCardV2Props {
	task: Task;
	project: Project;
}

export default function TaskCardV2({ task }: TaskCardV2Props) {
	const [compact, setCompact] = useState(true);

	const handleCompactToggle = () => {
		setCompact(!compact);
	};

	return (
		<Container
			direction="vertical"
			width="full"
			gap="none"
			className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700/50 hover:border-white/20"
		>
			<TaskHeader task={task} onChange={handleCompactToggle} />
			{task.description && (
				<TaskDescription description={task.description} compact={compact} />
			)}
		</Container>
	);
}
