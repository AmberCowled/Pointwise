import { getReceivedInvites } from "@pointwise/lib/api/invites";
import { endpoint } from "@pointwise/lib/ertk";

export default endpoint.get<
	{
		invites: Array<{
			id: string;
			inviterId: string;
			invitedUserId: string;
			projectId: string;
			inviteRole: "ADMIN" | "USER" | "VIEWER";
			createdAt: string;
			updatedAt: string;
			inviter: { id: string; name: string | null };
			project: {
				id: string;
				name: string;
				description: string | null;
				visibility: "PUBLIC" | "PRIVATE";
			};
		}>;
	},
	void
>({
	name: "getReceivedInvites",
	tags: { provides: ["Invites"] },
	protected: true,
	query: () => "/invites",
	handler: async ({ user }) => {
		const invites = await getReceivedInvites(user.id);
		return { invites };
	},
});
