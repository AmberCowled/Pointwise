import {
	handleProtectedRoute,
	handleRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import type { EndpointDefinition } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: route handler accepts any endpoint definition
export function createRouteHandler(def: EndpointDefinition<any, any>) {
	return async (
		req: Request,
		ctx?: { params: Promise<Record<string, string>> },
	) => {
		const params = ctx?.params ? await ctx.params : {};

		const wrappedHandler = async (routeCtx: {
			user?: {
				id: string;
				email: string;
				name: string | null;
				image: string | null;
			};
			body?: unknown;
			query?: unknown;
			req: Request;
		}) => {
			const result = await def.handler({
				user: routeCtx.user ?? { id: "", email: "", name: null, image: null },
				body: routeCtx.body,
				query: routeCtx.query,
				params,
				req: routeCtx.req,
			});
			return jsonResponse(result);
		};

		if (def.protected) {
			return def.request
				? handleProtectedRoute(
						req,
						wrappedHandler as Parameters<typeof handleProtectedRoute>[1],
						def.request,
					)
				: handleProtectedRoute(
						req,
						wrappedHandler as Parameters<typeof handleProtectedRoute>[1],
					);
		}
		return def.request
			? handleRoute(
					req,
					wrappedHandler as Parameters<typeof handleRoute>[1],
					def.request,
				)
			: handleRoute(req, wrappedHandler as Parameters<typeof handleRoute>[1]);
	};
}
