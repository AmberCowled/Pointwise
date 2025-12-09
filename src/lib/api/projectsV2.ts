import prisma from '@pointwise/lib/prisma';
import { Project as PrismaProject } from '@prisma/client';
import type { ProjectRole, Project, ProjectWithRole } from '@pointwise/lib/api/types';

export async function getProjects(userId: string): Promise<PrismaProject[]> {
    const projects = await prisma.project.findMany({
        where: {
            OR: [
                { adminUserIds: { has: userId } },
                { projectUserIds: { has: userId } },
                { viewerUserIds: { has: userId } },
            ],
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
    return projects;
}

export function getUserRoleInProject(project: Project | PrismaProject, userId: string): ProjectRole {
    if (project.adminUserIds.includes(userId)) {
        return 'admin';
    }
    if (project.projectUserIds.includes(userId)) {
        return 'user';
    }
    if (project.viewerUserIds.includes(userId)) {
        return 'viewer';
    }
    return 'none';
}

export function serializeProject(project: PrismaProject): Project {
    return {
        id: project.id,
        name: project.name,
        description: project.description || null,
        visibility: project.visibility,
        adminUserIds: project.adminUserIds || [],
        projectUserIds: project.projectUserIds || [],
        viewerUserIds: project.viewerUserIds || [],
        joinRequestUserIds: project.joinRequestUserIds || [],
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
    };
}

export function serializeProjectWithRole(project: PrismaProject, userId: string): ProjectWithRole {
    return {
        ...serializeProject(project),
        role: getUserRoleInProject(project, userId),
    };
}