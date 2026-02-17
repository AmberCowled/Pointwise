import type { z } from "zod";

export type TagType = string;

export type TagDescription = TagType | { type: TagType; id: string | number };

export interface EndpointDefinition<TResponse = unknown, TArgs = void> {
	name: string;
	method: "get" | "post" | "put" | "patch" | "delete";
	request?: z.ZodSchema;
	tags?: {
		provides?:
			| TagDescription[]
			| ((
					result: TResponse | undefined,
					error: unknown,
					args: TArgs,
			  ) => TagDescription[]);
		invalidates?:
			| TagDescription[]
			| ((
					result: TResponse | undefined,
					error: unknown,
					args: TArgs,
			  ) => TagDescription[]);
	};
	protected: boolean;
	query?: (
		args: TArgs,
	) => string | { url: string; method?: string; body?: unknown };
	optimistic?: SingleOptimistic<TArgs> | MultiOptimistic<TArgs>;
	// biome-ignore lint/suspicious/noExplicitAny: body/query are validated at the route layer
	handler: (ctx: HandlerContext<any, any>) => Promise<unknown>;
}

export interface SingleOptimistic<TArgs> {
	target: string;
	args: (params: TArgs) => unknown;
	update: (draft: unknown, params: TArgs) => void;
}

export interface MultiOptimistic<TArgs> {
	updates: Array<{
		target: string;
		args: (params: TArgs) => unknown;
		update: (draft: unknown, params: TArgs) => void;
		condition?: (params: TArgs) => boolean;
	}>;
}

export interface HandlerContext<TBody = unknown, TQuery = unknown> {
	user: {
		id: string;
		email: string;
		name: string | null;
		image: string | null;
	};
	body: TBody;
	query: TQuery;
	params: Record<string, string>;
	req: Request;
}
