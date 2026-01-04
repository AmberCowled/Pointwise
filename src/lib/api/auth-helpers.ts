import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

interface AuthenticatedUser {
	id: string;
	email: string;
	name: string | null;
}

interface UserContext extends AuthenticatedUser {
	displayName: string;
	initials: string;
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
		},
	});

	if (!userRecord || !userRecord.email) {
		redirect("/");
	}

	return {
		id: userRecord.id,
		email: userRecord.email as string,
		name: userRecord.name,
	} satisfies AuthenticatedUser;
}

export async function getUserContext(): Promise<UserContext> {
	const user = await requireAuth();

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
	};
}
