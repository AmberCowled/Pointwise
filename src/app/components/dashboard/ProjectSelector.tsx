/**
 * Project Selector Component
 *
 * Dropdown to select current project in the dashboard
 */

"use client";

import { useProject } from "@pointwise/contexts/ProjectContext";
import { useState } from "react";

interface ProjectSelectorProps {
  className?: string;
}

export function ProjectSelector({ className = "" }: ProjectSelectorProps) {
  const { currentProject, projects, selectProjectById } = useProject();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (projectId: string) => {
    selectProjectById(projectId);
    setIsOpen(false);
  };

  if (projects.length === 0) {
    return (
      <div className={`text-zinc-400 text-sm ${className}`}>
        No projects available
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors"
      >
        <svg
          className="w-4 h-4 text-zinc-400"
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
        <span className="text-sm font-medium text-zinc-100">
          {currentProject?.name || "Select Project"}
        </span>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-800 rounded-lg border border-zinc-700/50 shadow-xl z-20 overflow-hidden">
            <div className="py-1 max-h-64 overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelect(project.id)}
                  className={`w-full px-4 py-2 text-left hover:bg-zinc-700/50 transition-colors ${
                    currentProject?.id === project.id
                      ? "bg-zinc-700/30 text-blue-400"
                      : "text-zinc-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-xs text-zinc-400 truncate mt-0.5">
                          {project.description}
                        </div>
                      )}
                    </div>
                    {project.visibility === "PUBLIC" && (
                      <svg
                        className="w-4 h-4 text-zinc-500 ml-2 flex-shrink-0"
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
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-700/50" />

            {/* Create New Project Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Open create project modal
              }}
              className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
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
                <span>Create New Project</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
