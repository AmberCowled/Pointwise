import TestComponent from "./TestComponent";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id: projectId } = await params;

	return <TestComponent projectId={projectId}/>;
}
