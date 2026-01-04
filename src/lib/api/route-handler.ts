/**
 * Route handler utility for consistent error handling across API routes
 */

import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type * as z from "zod";

/**
 * Options for route handler
 */
export interface RouteHandlerOptions {
	/**
	 * Middleware-style error handlers
	 * Processed in sequence until one returns a response
	 * If all handlers return null, default error handling is used
	 */
	errorHandlers?: Array<(error: unknown) => NextResponse | null>;
}

/**
 * Handle API route with consistent error handling and optional validation
 *
 * @example
 * ```typescript
 * // Without validation
 * export async function GET(req: Request) {
 *   return handleRoute(req, async ({ req }) => {
 *     const data = await getSomeData();
 *     return jsonResponse({ data });
 *   });
 * }
 *
 * // With validation
 * export async function POST(req: Request) {
 *   return handleRoute(req, async ({ body }) => {
 *     // body is typed and validated (required, not optional)
 *     return jsonResponse({ result: body });
 *   }, CreateItemSchema);
 * }
 * ```
 */

// Overload 1: No schema - body and query are optional
export async function handleRoute<TResponse = unknown>(
	req: Request,
	handler: (
		context: RouteContext<undefined, undefined>,
	) => Promise<NextResponse<TResponse>>,
): Promise<NextResponse>;

// Overload 2: Body schema provided - body is required
export async function handleRoute<TBody, TResponse = unknown>(
	req: Request,
	handler: (
		context: RouteContext<TBody, undefined>,
	) => Promise<NextResponse<TResponse>>,
	schema: z.ZodSchema<TBody>,
	options?: RouteHandlerOptions,
): Promise<NextResponse>;

// Overload 3: Query schema provided - query is required
export async function handleRoute<TQuery, TResponse = unknown>(
	req: Request,
	handler: (
		context: RouteContext<undefined, TQuery>,
	) => Promise<NextResponse<TResponse>>,
	schema: z.ZodSchema<TQuery>,
	options?: RouteHandlerOptions,
): Promise<NextResponse>;

// Implementation
export async function handleRoute<
	TBody = unknown,
	TQuery = unknown,
	TResponse = unknown,
>(
	req: Request,
	handler: (
		context: RouteContext<TBody, TQuery>,
	) => Promise<NextResponse<TResponse>>,
	schema?: z.ZodSchema<TBody | TQuery>,
	options: RouteHandlerOptions = {},
): Promise<NextResponse> {
	try {
		// Parse and validate request if schema provided
		const { body, query } = await parseAndValidateRequest(req, schema);

		// Call handler with context
		// When schema is provided, body or query is guaranteed to be present
		// The overloads ensure type safety at the call site
		return await handler({
			body: body as TBody extends undefined ? undefined : TBody,
			query: query as TQuery extends undefined ? undefined : TQuery,
			req,
		} as RouteContext<TBody, TQuery>);
	} catch (error) {
		// Process error handlers in sequence (middleware-style)
		if (options.errorHandlers) {
			for (const errorHandler of options.errorHandlers) {
				const response = errorHandler(error);
				if (response) {
					return response;
				}
			}
		}

		// Handle Prisma errors
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error("Prisma Error:", {
				code: error.code,
				meta: error.meta,
				message: error.message,
			});

			// Handle unique constraint violations
			if (error.code === "P2002") {
				const field = (error.meta?.target as string[])?.[0] ?? "field";
				return NextResponse.json(
					{ error: `${field} already exists` },
					{ status: 409 },
				);
			}

			// Handle record not found
			if (error.code === "P2025") {
				return NextResponse.json(
					{ error: "Record not found" },
					{ status: 404 },
				);
			}

			// Generic Prisma error
			return NextResponse.json(
				{ error: "Database operation failed" },
				{ status: 500 },
			);
		}

		// Handle Prisma validation errors
		if (error instanceof Prisma.PrismaClientValidationError) {
			console.error("Prisma Validation Error:", error.message);
			return NextResponse.json(
				{ error: "Invalid data provided" },
				{ status: 400 },
			);
		}

		// Handle Zod validation errors
		if (error instanceof ValidationError) {
			if (error.zodError) {
				// Format Zod errors for client
				const formattedErrors = error.zodError.issues.map(
					(err: z.ZodIssue) => ({
						path: err.path.join("."),
						message: err.message,
					}),
				);

				console.error("Validation Error:", formattedErrors);

				return NextResponse.json(
					{
						error: "Validation failed",
						details: formattedErrors,
					},
					{ status: 400 },
				);
			}

			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		// Handle generic errors
		if (error instanceof Error) {
			console.error("API Route Error:", {
				message: error.message,
				stack: error.stack,
			});

			// Check if error has a status code (custom error)
			if ("status" in error && typeof error.status === "number") {
				return NextResponse.json(
					{ error: error.message || "An error occurred" },
					{ status: error.status },
				);
			}

			return NextResponse.json(
				{ error: "An unexpected error occurred" },
				{ status: 500 },
			);
		}

		// Unknown error type
		console.error("Unknown API Route Error:", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 },
		);
	}
}

/**
 * Helper to create JSON response with consistent format
 */
export function jsonResponse<T>(
	data: T,
	status: number = 200,
): NextResponse<T> {
	return NextResponse.json(data, { status });
}

/**
 * Helper to create error response
 */
export function errorResponse(
	message: string,
	status: number = 400,
): NextResponse {
	return NextResponse.json({ error: message }, { status });
}

/**
 * HTTP methods that use query parameters
 */
const QUERY_METHODS = ["GET", "DELETE", "HEAD", "OPTIONS"] as const;

/**
 * Parse and validate request data based on HTTP method
 * When schema is provided, the corresponding body or query is guaranteed to be returned
 */
async function parseAndValidateRequest<T>(
	req: Request,
	schema?: z.ZodSchema<T>,
): Promise<{ body?: T; query?: T }> {
	const method = req.method.toUpperCase() as Uppercase<string>;

	// Determine if we should parse query or body
	const isQueryMethod = QUERY_METHODS.includes(
		method as (typeof QUERY_METHODS)[number],
	);

	if (isQueryMethod) {
		// Parse query parameters
		if (!schema) {
			return { query: undefined };
		}

		const url = new URL(req.url);
		const params: Record<string, string | number> = {};

		url.searchParams.forEach((value, key) => {
			// Attempt to parse numbers
			const numValue = Number(value);
			params[key] = Number.isNaN(numValue) ? value : numValue;
		});

		const result = schema.safeParse(params);
		if (!result.success) {
			throw new ValidationError(result.error);
		}

		// When schema is provided, query is guaranteed to be present
		return { query: result.data };
	} else {
		// Parse request body
		if (!schema) {
			return { body: undefined };
		}

		let body: unknown;
		try {
			body = await req.json();
		} catch (_error) {
			throw new ValidationError("Invalid JSON in request body");
		}

		const result = schema.safeParse(body);
		if (!result.success) {
			throw new ValidationError(result.error);
		}

		// When schema is provided, body is guaranteed to be present
		return { body: result.data };
	}
}

/**
 * Custom validation error class
 */
class ValidationError extends Error {
	public zodError?: z.ZodError;

	constructor(error: string | z.ZodError) {
		if (typeof error === "string") {
			super(error);
		} else {
			super("Validation failed");
			this.zodError = error;
		}
		this.name = "ValidationError";
	}
}

/**
 * Base context passed to route handlers
 * When TBody or TQuery is not undefined, the corresponding property is required (non-nullable)
 * When undefined, the property is also undefined (but still present)
 * Using a helper type to ensure required properties are never undefined
 */
type RequiredIfDefined<T> = T extends undefined
	? undefined
	: Exclude<T, undefined>;

export interface RouteContext<TBody = unknown, TQuery = unknown> {
	body: RequiredIfDefined<TBody>;
	query: RequiredIfDefined<TQuery>;
	req: Request;
}

/**
 * Authenticated user context passed to protected route handlers
 */
export interface AuthContext<TBody = unknown, TQuery = unknown>
	extends RouteContext<TBody, TQuery> {
	user: {
		id: string;
		email: string;
		name: string | null;
	};
}

/**
 * Handle API route that requires authentication with optional validation
 *
 * Automatically handles:
 * - Session verification
 * - User lookup from database
 * - Request validation (if schema provided)
 * - Returns 401 if not authenticated
 * - Returns 404 if user not found
 * - Returns 400 if validation fails
 *
 * @example
 * ```typescript
 * // Without validation
 * export async function GET(req: Request) {
 *   return handleProtectedRoute(req, async ({ user }) => {
 *     const xp = await getXP(user.id);
 *     return jsonResponse({ xp });
 *   });
 * }
 *
 * // With validation
 * export async function PATCH(req: Request) {
 *   return handleProtectedRoute(req, async ({ user, body }) => {
 *     // body is typed and validated (required, not optional)
 *     const xp = await updateXP(user.id, body.delta);
 *     return jsonResponse({ xp });
 *   }, UpdateXPRequestSchema);
 * }
 * ```
 */

// Overload 1: No schema - body and query are optional
export async function handleProtectedRoute<TResponse = unknown>(
	req: Request,
	handler: (
		context: AuthContext<undefined, undefined>,
	) => Promise<NextResponse<TResponse>>,
): Promise<NextResponse>;

// Overload 2: Body schema provided - body is required
export async function handleProtectedRoute<TBody, TResponse = unknown>(
	req: Request,
	handler: (
		context: AuthContext<TBody, undefined>,
	) => Promise<NextResponse<TResponse>>,
	schema: z.ZodSchema<TBody>,
	options?: RouteHandlerOptions,
): Promise<NextResponse>;

// Overload 3: Query schema provided - query is required
export async function handleProtectedRoute<TQuery, TResponse = unknown>(
	req: Request,
	handler: (
		context: AuthContext<undefined, TQuery>,
	) => Promise<NextResponse<TResponse>>,
	schema: z.ZodSchema<TQuery>,
	options?: RouteHandlerOptions,
): Promise<NextResponse>;

// Implementation
export async function handleProtectedRoute<
	TBody = unknown,
	TQuery = unknown,
	TResponse = unknown,
>(
	req: Request,
	handler: (
		context: AuthContext<TBody, TQuery>,
	) => Promise<NextResponse<TResponse>>,
	schema?: z.ZodSchema<TBody | TQuery>,
	options: RouteHandlerOptions = {},
): Promise<NextResponse> {
	// Call handleRoute implementation with proper typing
	// We need to use the implementation signature which accepts optional schema
	const handleRouteImpl = handleRoute as <
		TBodyImpl = unknown,
		TQueryImpl = unknown,
		TResponseImpl = unknown,
	>(
		req: Request,
		handler: (
			context: RouteContext<TBodyImpl, TQueryImpl>,
		) => Promise<NextResponse<TResponseImpl>>,
		schema?: z.ZodSchema<TBodyImpl | TQueryImpl>,
		options?: RouteHandlerOptions,
	) => Promise<NextResponse>;

	return handleRouteImpl<TBody, TQuery, TResponse>(
		req,
		async ({
			body,
			query,
			req: request,
		}: RouteContext<TBody, TQuery>): Promise<NextResponse<TResponse>> => {
			// 1. Get session
			const session = await getServerSession(authOptions);
			const email = session?.user?.email;

			if (!email) {
				return errorResponse("Unauthorized", 401) as NextResponse<TResponse>;
			}

			// 2. Get user from database
			const user = await prisma.user.findUnique({
				where: { email },
				select: {
					id: true,
					email: true,
					name: true,
				},
			});

			if (!user || !user.email) {
				return errorResponse("User not found", 404) as NextResponse<TResponse>;
			}

			// 3. Call handler with authenticated user context and validated data
			// Type assertion: we know email is string because we checked above
			return handler({
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
				},
				body: body as RequiredIfDefined<TBody>,
				query: query as RequiredIfDefined<TQuery>,
				req: request,
			} as AuthContext<TBody, TQuery>);
		},
		schema,
		options,
	);
}
