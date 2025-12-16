import BackgroundGlow from "@pointwise/app/components/general/BackgroundGlow";
import { requireProjectPage } from "@pointwise/lib/api/auth-helpersV2";
import { formatDateLabel, startOfDay } from "@pointwise/lib/datetime";
import { notFound } from "next/navigation";
import TestComponent from "./TestComponent";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id: projectId } = await params;
	const { user } = await requireProjectPage(projectId);

	return <TestComponent projectId={projectId} userId={user.id} />;
}
