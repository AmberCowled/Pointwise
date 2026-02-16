import { searchUsers } from "@pointwise/lib/api/users";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	SearchUsersRequest,
	SearchUsersResponse,
} from "@pointwise/lib/validation/users-schema";
import { SearchUsersRequestSchema } from "@pointwise/lib/validation/users-schema";

export default endpoint.get<SearchUsersResponse, SearchUsersRequest>({
	name: "searchUsers",
	request: SearchUsersRequestSchema,
	tags: { provides: ["Users"] },
	protected: true,
	query: (params) =>
		`/users/search?query=${encodeURIComponent(params.query ?? "")}&limit=${params.limit ?? 50}&offset=${params.offset ?? 0}`,
	handler: async ({ user, query }) => {
		const q = query as SearchUsersRequest;
		const searchQuery = q?.query ?? "";
		const limit = q?.limit ?? 50;
		const offset = q?.offset ?? 0;
		const { users, total } = await searchUsers(
			searchQuery,
			limit,
			offset,
			user.id,
		);
		return {
			users,
			pagination: { total, limit, offset, hasMore: offset + limit < total },
		};
	},
});
