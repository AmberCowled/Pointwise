import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { searchUsers } from "@pointwise/lib/api/users";
import { SearchUsersRequestSchema } from "@pointwise/lib/validation/users-schema";
import type { z } from "zod";

type SearchUsersQuery = z.infer<typeof SearchUsersRequestSchema>;

export async function GET(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ query }) => {
			// query is guaranteed to be present when schema is provided (SearchUsersRequestSchema)
			// Type assertion needed due to TypeScript overload resolution limitations
			const queryData = query as unknown as SearchUsersQuery;
			const searchQuery = queryData.query;
			const limit = queryData.limit ?? 50;
			const offset = queryData.offset ?? 0;

			const { users, total } = await searchUsers(searchQuery, limit, offset);

			return jsonResponse({
				users,
				pagination: {
					total,
					limit,
					offset,
					hasMore: offset + limit < total,
				},
			});
		},
		SearchUsersRequestSchema,
	);
}
