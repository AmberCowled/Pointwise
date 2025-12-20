"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { Card } from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import { useGetProjectQuery } from "@pointwise/lib/redux/services/projectsApi";
import { useGetTasksQuery } from "@pointwise/lib/redux/services/tasksApi";
import { useParams } from "next/navigation";
import NoTasksView from "./NoTasksView";

export default function TasksOverview() {
	const { id: projectId } = useParams<{ id: string }>();
	const {
		data: project,
		isLoading: isProjectLoading,
		isError: isProjectError,
		refetch: refetchProject,
	} = useGetProjectQuery(projectId);
	const {
		data: tasks,
		isLoading: isTasksLoading,
		isError: isTasksError,
		refetch: refetchTasks,
	} = useGetTasksQuery({ projectId });

	const hasWriteAccess = project?.project.role === "ADMIN" || project?.project.role === "USER";
	const hasTasks = !isTasksLoading && !isTasksError && tasks && tasks?.tasks.length > 0;
	const isEmpty = !isTasksLoading && !isTasksError && tasks && tasks?.tasks.length === 0;
	const isLoading = isProjectLoading || isTasksLoading;
	const isError = isProjectError || isTasksError;

	return (
		<Container direction="vertical" gap="sm" className="pt-3">
			<Container>
				<Card
					title="Tasks"
					label="Overview"
					loading={isLoading}
					className="flex-1"
					action={hasWriteAccess ? <Button variant="secondary">Create Task</Button> : null}
				>
					<ErrorCard
						display={isError}
						message={isProjectError ? "Project could not be loaded" : "Tasks could not be loaded"}
						onRetry={isProjectError ? refetchProject : refetchTasks}
						className="mb-6"
					/>
					{hasTasks ? (
						tasks.tasks.map((task) => <div key={task.id}>{task.title}</div>)
					) : isEmpty ? (
						<NoTasksView hasWriteAccess={hasWriteAccess} />
					) : null}
				</Card>
			</Container>
		</Container>
	);
}
