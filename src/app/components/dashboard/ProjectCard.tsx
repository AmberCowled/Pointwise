/**
 * Project Card Component
 *
 * Card displaying project info with click to enter
 */

"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Link from "next/link";

interface ProjectCardProps {
	project: {
		id: string;
		name: string;
		description?: string;
		visibility: "PRIVATE" | "PUBLIC";
		adminUserIds: string[];
		projectUserIds: string[];
		viewerUserIds: string[];
	};
	userId: string;
	taskCount?: number;
	onSettingsClick?: (projectId: string) => void;
}

export function ProjectCard({ project, userId, taskCount = 0, onSettingsClick }: ProjectCardProps) {
	const isAdmin = project.adminUserIds.includes(userId);
	const isUser = project.projectUserIds.includes(userId) && !isAdmin;
	const isViewer = project.viewerUserIds.includes(userId);

	const roleLabel = isAdmin ? "Admin" : isUser ? "Member" : isViewer ? "Viewer" : "Guest";
	const roleColor = isAdmin
		? "text-purple-400 bg-purple-500/10 border-purple-500/20"
		: isUser
			? "text-blue-400 bg-blue-500/10 border-blue-500/20"
			: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";

	const handleSettingsClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onSettingsClick?.(project.id);
	};

	return (
		<Link href={`/dashboard/projects/${project.id}`} className="block group">
			<div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80">
				{/* Gradient overlay on hover */}
				<div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity group-hover:opacity-10" />

				<div className="relative p-6">
					{/* Header */}
					<div className="flex items-start justify-between mb-3">
						<div className="flex-1 min-w-0">
							<h3 className="text-lg font-semibold text-zinc-100 truncate group-hover:text-blue-400 transition-colors">
								{project.name}
							</h3>
							{project.description && (
								<p className="text-sm text-zinc-400 mt-1 line-clamp-2">{project.description}</p>
							)}
						</div>

						{/* Visibility badge & Settings button */}
						<div className="ml-3 shrink-0 flex items-center gap-2">
							{/* Visibility badge */}
							{project.visibility === "PUBLIC" ? (
								<div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 rounded-md">
									<svg
										className="w-3.5 h-3.5 text-zinc-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<span className="text-xs text-zinc-400">Public</span>
								</div>
							) : (
								<div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 rounded-md">
									<svg
										className="w-3.5 h-3.5 text-zinc-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
									<span className="text-xs text-zinc-400">Private</span>
								</div>
							)}

							{/* Settings button - only for admins */}
							{isAdmin && onSettingsClick && (
								<Button
									onClick={handleSettingsClick}
									variant="ghost"
									size="sm"
									className="text-zinc-400 hover:text-zinc-300"
									aria-label="Project settings"
									title="Project settings"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</Button>
							)}
						</div>
					</div>

					{/* Stats */}
					<div className="flex items-center gap-4 mb-4">
						<div className="flex items-center gap-2 text-sm text-zinc-400">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							<span>
								{taskCount} {taskCount === 1 ? "task" : "tasks"}
							</span>
						</div>

						<div className="flex items-center gap-2 text-sm text-zinc-400">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
							<span>
								{project.projectUserIds.length}{" "}
								{project.projectUserIds.length === 1 ? "member" : "members"}
							</span>
						</div>
					</div>

					{/* Role badge */}
					<div className="flex items-center justify-between">
						<span
							className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${roleColor}`}
						>
							{roleLabel}
						</span>

						{/* Arrow icon */}
						<svg
							className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</div>
		</Link>
	);
}
