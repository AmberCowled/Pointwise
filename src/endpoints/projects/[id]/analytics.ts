import { getProjectAnalytics } from "@pointwise/lib/api/analytics";
import {
	type GetProjectAnalyticsRequest,
	GetProjectAnalyticsRequestSchema,
	type GetProjectAnalyticsResponse,
} from "@pointwise/lib/validation/analytics-schema";
import { endpoint } from "ertk";

export default endpoint.get<
	GetProjectAnalyticsResponse,
	GetProjectAnalyticsRequest
>({
	name: "getProjectAnalytics",
	request: GetProjectAnalyticsRequestSchema,
	tags: { provides: ["Analytics"] },
	protected: true,
	maxRetries: 2,
	query: ({ projectId, ...rest }) => {
		const params = new URLSearchParams();
		params.set("projectId", projectId);
		if (rest.startDate) params.set("startDate", rest.startDate);
		if (rest.endDate) params.set("endDate", rest.endDate);
		if (rest.category) params.set("category", rest.category);
		if (rest.status) params.set("status", rest.status);
		if (rest.memberId) params.set("memberId", rest.memberId);
		if (rest.granularity) params.set("granularity", rest.granularity);
		return `/projects/${projectId}/analytics?${params.toString()}`;
	},
	handler: async ({ user, params, query }) => {
		const queryData = query as unknown as GetProjectAnalyticsRequest;
		return await getProjectAnalytics(params.id, user.id, queryData);
	},
});
