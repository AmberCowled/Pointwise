/**
 * Projects Overview Dashboard
 *
 * Main dashboard showing all projects user has access to
 */

"use client";

import Navbar from "@pointwise/app/components/dashboard/navbar/Navbar";
import { Button } from "@pointwise/app/components/ui/Button";
import { Card } from "@pointwise/app/components/ui/Card";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import { useGetProjectsQuery } from "@pointwise/lib/redux/services/projectsApi";
import { useGetXPQuery } from "@pointwise/lib/redux/services/xpApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectManagementModal } from "./ProjectManagementModal";
import { ProjectSettingsModal } from "./ProjectSettingsModal";

interface ProjectsOverviewProps {
	userId: string;
	initials: string;
	today: string;
}

export function ProjectsOverview({ userId, initials, today }: ProjectsOverviewProps) {
	const router = useRouter();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

	// Fetch XP from RTK Query - cache handles everything
	const { error: xpError, refetch: refetchXP } = useGetXPQuery();
	const {
		data: projectsData,
		isLoading: projectsLoading,
		error: projectsError,
		refetch: refetchProjects,
	} = useGetProjectsQuery();
	const projects = projectsData?.projects ?? [];

	const handleProjectCreated = (projectId: string) => {
		refetchProjects();
		router.push(`/dashboard/projects/${projectId}`);
	};

	const handleSettingsClick = (projectId: string) => {
		refetchProjects();
		setSelectedProjectId(projectId);
		setIsSettingsModalOpen(true);
	};

	const handleProjectUpdated = () => {
		refetchProjects();
		setIsSettingsModalOpen(false);
		setSelectedProjectId(null);
	};

	const handleProjectDeleted = () => {
		refetchProjects();
		setIsSettingsModalOpen(false);
		setSelectedProjectId(null);
	};

	return (
		<>
			{/* Use existing Navbar component */}
			<Navbar initials={initials} xpError={xpError} onRetryXP={refetchXP} />

			{/* Main Content */}
			<div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
				{/* Page Header - Consistent with Dashboard */}
				<header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-1">
						<p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{today}</p>
						<h1 className="text-xl font-semibold tracking-tight text-zinc-100">
							Projects Overview
						</h1>
					</div>
				</header>

				<main className="flex-1 space-y-6">
					{/* Projects Card - Similar to TaskBoard */}
					<section className="space-y-6 outline-none">
						<Card
							as="section"
							variant="secondary"
							title="Projects"
							label="Overview"
							action={
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={() => setIsCreateModalOpen(true)}
									className="rounded-full"
								>
									Create Project
								</Button>
							}
							loading={projectsLoading}
							loadingMessage="Loading projects..."
						>
							<ErrorCard
								display={Boolean(projectsError)}
								message="Failed to load projects"
								onRetry={refetchProjects}
							/>
							{projects.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{projects.map((project) => (
										<ProjectCard
											key={project.id}
											project={{
												...project,
												description: project.description ?? undefined,
											}}
											userId={userId}
											taskCount={0}
											onSettingsClick={handleSettingsClick}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
										<svg
											className="w-8 h-8 text-zinc-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
											/>
										</svg>
									</div>
									<h3 className="text-lg font-semibold text-zinc-100 mb-2">No projects yet</h3>
									<p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
										Create your first project to start organizing your tasks and collaborating with
										your team.
									</p>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => setIsCreateModalOpen(true)}
										className="rounded-full"
									>
										<svg
											className="w-4 h-4 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 4v16m8-8H4"
											/>
										</svg>
										Create Your First Project
									</Button>
								</div>
							)}
						</Card>
					</section>
				</main>
			</div>

			{/* Create Project Modal */}
			<ProjectManagementModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				mode="create"
				onProjectCreated={handleProjectCreated}
			/>

			{/* Project Settings Modal */}
			<ProjectSettingsModal
				isOpen={isSettingsModalOpen}
				onClose={() => {
					setIsSettingsModalOpen(false);
					setSelectedProjectId(null);
				}}
				projectId={selectedProjectId}
				onProjectUpdated={handleProjectUpdated}
				onProjectDeleted={handleProjectDeleted}
			/>
		</>
	);
}
