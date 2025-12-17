import { authOptions } from "@pointwise/lib/auth";
import { DateTimeDefaults } from "@pointwise/lib/datetime";
import prisma from "@pointwise/lib/prisma";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

interface AuthenticatedUser {
	id: string;
	email: string;
	name: string | null;
	preferredLocale: string | null;
	preferredTimeZone: string | null;
}

interface UserContext extends AuthenticatedUser {
	displayName: string;
	initials: string;
	locale: string;
	timeZone: string;
}

async function requireAuth(): Promise<AuthenticatedUser> {
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
