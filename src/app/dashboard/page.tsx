import { ProjectsOverview } from "@pointwise/app/components/dashboard/ProjectsOverview";
import BackgroundGlow from "@pointwise/app/components/general/BackgroundGlow";
import { authOptions } from "@pointwise/lib/auth";
import { DateTimeDefaults, formatDateLabel, startOfDay } from "@pointwise/lib/datetime";
import prisma from "@pointwise/lib/prisma";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/");
	}

	const displayName = session.user?.name?.split(" ")[0] ?? session.user?.email ?? "Adventurer";

	const userRecord = session.user?.email
		? await prisma.user.findUnique({
				where: { email: session.user.email },
				select: {
					id: true,
					preferredLocale: true,
					preferredTimeZone: true,
				},
			})
		: null;

	if (!userRecord) {
		redirect("/");
	}

	// Get locale and timezone for date formatting
	const headerLocale = (await headers()).get("accept-language")?.split(",")[0]?.trim() ?? undefined;
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("pw-locale")?.value;
	const cookieTimeZone = cookieStore.get("pw-timezone")?.value;

	const locale =
		userRecord.preferredLocale ?? cookieLocale ?? headerLocale ?? DateTimeDefaults.locale;
	const timeZone = userRecord.preferredTimeZone ?? cookieTimeZone ?? DateTimeDefaults.timeZone;

	const now = new Date();
	const todayStart = startOfDay(now, timeZone);
	const today = formatDateLabel(todayStart, locale, timeZone);

	const initials =
		session.user?.name
			?.split(" ")
			.filter(Boolean)
			.map((part) => part[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() ?? "PW";

	return (
		<div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
			<BackgroundGlow />
			<ProjectsOverview userId={userRecord.id} initials={initials} today={today} />
		</div>
	);
}
