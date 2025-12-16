import { serializeProject } from "@pointwise/lib/api/projectsV2";
import { authOptions } from "@pointwise/lib/auth";
import { DateTimeDefaults } from "@pointwise/lib/datetime";
import prisma from "@pointwise/lib/prisma";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export interface AuthenticatedUser {
	id: string;
	email: string;
	name: string | null;
	preferredLocale: string | null;
	preferredTimeZone: string | null;
}

export interface UserContext extends AuthenticatedUser {
	displayName: string;
	initials: string;
	locale: string;
	timeZone: string;
}

export async function requireAuth(): Promise<AuthenticatedUser> {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		redirect("/");
	}

	const userRecord = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: {
			id: true,
			email: true,
			name: true,
			preferredLocale: true,
			preferredTimeZone: true,
		},
	});

	if (!userRecord || !userRecord.email) {
		redirect("/");
	}

	return {
		id: userRecord.id,
		email: userRecord.email as string,
		name: userRecord.name,
		preferredLocale: userRecord.preferredLocale,
		preferredTimeZone: userRecord.preferredTimeZone,
	} satisfies AuthenticatedUser;
}

export async function getUserContext(): Promise<UserContext> {
	const user = await requireAuth();

	const headerStore = await headers();
	const cookieStore = await cookies();

	const headerLocale = headerStore.get("accept-language")?.split(",")[0]?.trim();
	const cookieLocale = cookieStore.get("pw-locale")?.value;
	const cookieTimeZone = cookieStore.get("pw-timezone")?.value;

	const locale = user.preferredLocale ?? cookieLocale ?? headerLocale ?? DateTimeDefaults.locale;

	const timeZone = user.preferredTimeZone ?? cookieTimeZone ?? DateTimeDefaults.timeZone;

	const displayName = user.name?.split(" ")[0] ?? user.email ?? "Adventurer";

	const initials =
		user.name
			?.split(" ")
			.filter(Boolean)
			.map((part) => part[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() ?? "PW";

	return {
		...user,
		displayName,
		initials,
		locale,
		timeZone,
	};
}

export async function requireProjectAccess(projectId: string, userId: string): Promise<Project> {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
	});

	if (!project) {
		notFound();
	}

	const hasAccess =
		project.visibility === "PUBLIC" ||
		[...project.adminUserIds, ...project.projectUserIds, ...project.viewerUserIds].includes(userId);

	if (!hasAccess) {
		redirect("/dashboard");
	}

	return serializeProject(project, userId);
}

export async function requireProjectPage(projectId: string): Promise<{
	user: UserContext;
	project: Project;
}> {
	const user = await getUserContext();
	const project = await requireProjectAccess(projectId, user.id);
	return { user, project };
}
