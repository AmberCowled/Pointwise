/**
 * Project Context
 *
 * Manages the currently selected project and provides project-related operations
 */

"use client";

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface Project {
  id: string;
  name: string;
  description?: string;
  visibility: "PRIVATE" | "PUBLIC";
  adminUserIds: string[];
  projectUserIds: string[];
  viewerUserIds: string[];
  joinRequestUserIds?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRole {
  isAdmin: boolean;
  isUser: boolean;
  isViewer: boolean;
  canEdit: boolean; // admins and users can edit
}

interface ProjectContextValue {
  // Current project
  currentProject: Project | null;
  currentProjectId: string | null;

  // Project list
  projects: Project[];

  // User's role in current project
  userRole: ProjectRole | null;

  // Operations
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  selectProjectById: (projectId: string) => void;

  // Helper methods
  getUserRole: (project: Project, userId: string) => ProjectRole;
  canUserEditTasks: (project: Project, userId: string) => boolean;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined,
);

interface ProjectProviderProps {
  children: ReactNode;
  initialProject?: Project | null;
  initialProjects?: Project[];
  userId: string;
}

export function ProjectProvider({
  children,
  initialProject = null,
  initialProjects = [],
  userId,
}: ProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<Project | null>(
    initialProject,
  );
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  // Get user's role in a project
  const getUserRole = useCallback(
    (project: Project, uid: string): ProjectRole => {
      const isAdmin = project.adminUserIds.includes(uid);
      const isUser = project.projectUserIds.includes(uid) && !isAdmin;
      const isViewer = project.viewerUserIds.includes(uid);
      const canEdit = isAdmin || isUser;

      return { isAdmin, isUser, isViewer, canEdit };
    },
    [],
  );

  // Check if user can edit tasks in a project
  const canUserEditTasks = useCallback(
    (project: Project, uid: string): boolean => {
      const role = getUserRole(project, uid);
      return role.canEdit;
    },
    [getUserRole],
  );

  // Get user's role in current project
  const userRole = useMemo(() => {
    if (!currentProject) return null;
    return getUserRole(currentProject, userId);
  }, [currentProject, userId, getUserRole]);

  // Select project by ID
  const selectProjectById = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setCurrentProject(project);
      }
    },
    [projects],
  );

  const value: ProjectContextValue = {
    currentProject,
    currentProjectId: currentProject?.id ?? null,
    projects,
    userRole,
    setCurrentProject,
    setProjects,
    selectProjectById,
    getUserRole,
    canUserEditTasks,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
