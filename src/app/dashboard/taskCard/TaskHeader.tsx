import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import TaskCardCategory from "./TaskCardCategory";
import TaskCardXP from "./TaskCardXP";

export interface TaskHeaderProps {
	task: Task;
	open: boolean;
	onChange?: (open: boolean) => void;
}

export default function TaskHeader({ task, open, onChange }: TaskHeaderProps) {
	const handleExpandToggle = () => {
		onChange?.(!open);
	};

	return (
		<Container
			direction="vertical"
			width="full"
			gap="none"
			className="pb-2 border-b border-zinc-700/50"
		>
			{/* Title and expand button */}
			<Container
				width="full"
				gap="none"
				className="justify-between items-center cursor-pointer"
				onClick={handleExpandToggle}
			>
				<h3 className="font-bold text-lg">{task.title}</h3>
				<Button
					variant="ghost"
					onClick={(e) => {
						e.stopPropagation();
						handleExpandToggle();
					}}
				>
					{open ? (
						<IoChevronUp className="size-5" />
					) : (
						<IoChevronDown className="size-5" />
					)}
				</Button>
			</Container>

			{/* Category and XP award */}
			<Container width="full" gap="sm">
				<TaskCardCategory category={task.category} />
				<TaskCardXP xp={task.xpAward} />
			</Container>
		</Container>
	);
}
