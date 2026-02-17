import { getProjectJoinRequests } from "@pointwise/lib/api/joinRequests";
import { endpoint } from "@pointwise/lib/ertk";

export default endpoint.get<
	{
		requests: Array<{
			userId: string;
			name: string | null;
			requestedAt: string;
		}>;
	},
	string
>({
	name: "getProjectJoinRequests",
	tags: { provides: ["JoinRequests"] },
	protected: true,
	query: (projectId) => `/projects/${projectId}/join-requests`,
	handler: async ({ user, params }) => {
		const requests = await getProjectJoinRequests(params.id, user.id);
		return { requests };
	},
});
