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
	 * Custom error handler function
	 * If provided, this will be called before the default error handling
	 */
	onError?: (error: unknown) => NextResponse | null;
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
 *     // body is typed and validated
 *     return jsonResponse({ result: body });
 *   }, CreateItemSchema);
 * }
 * ```
 */
export async function handleRoute<TBody = unknown, TQuery = unknown, TResponse = unknown>(
	req: Request,
	handler: (context: RouteContext<TBody, TQuery>) => Promise<NextResponse<TResponse>>,
	schema?: z.ZodSchema<TBody | TQuery>,
	options: RouteHandlerOptions = {},
): Promise<NextResponse> {
	try {
		// Parse and validate request if schema provided
		const { body, query } = await parseAndValidateRequest(req, schema);

		// Call handler with context
		return await handler({
			body: body as TBody,
			query: query as TQuery,
			req,
		});
	} catch (error) {
		// Allow custom error handler to override
		if (options.onError) {
			const customResponse = options.onError(error);
			if (customResponse) {
				return customResponse;
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
				return NextResponse.json({ error: `${field} already exists` }, { status: 409 });
			}

			// Handle record not found
			if (error.code === "P2025") {
				return NextResponse.json({ error: "Record not found" }, { status: 404 });
			}

			// Generic Prisma error
			return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
		}

		// Handle Prisma validation errors
		if (error instanceof Prisma.PrismaClientValidationError) {
			console.error("Prisma Validation Error:", error.message);
			return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
		}

		// Handle Zod validation errors
		if (error instanceof ValidationError) {
			if (error.zodError) {
				// Format Zod errors for client
				const formattedErrors = error.zodError.issues.map((err: z.ZodIssue) => ({
					path: err.path.join("."),
					message: err.message,
				}));

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

			return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
		}

		// Unknown error type
		console.error("Unknown API Route Error:", error);
		return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
	}
}

/**
 * Helper to create JSON response with consistent format
 */
export function jsonResponse<T>(data: T, status: number = 200): NextResponse<T> {
	return NextResponse.json(data, { status });
}

/**
 * Helper to create error response
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
	return NextResponse.json({ error: message }, { status });
}

/**
 * HTTP methods that use query parameters
 */
const QUERY_METHODS = ["GET", "DELETE", "HEAD", "OPTIONS"] as const;

/**
 * HTTP methods that use request body
 */
const BODY_METHODS = ["POST", "PATCH", "PUT"] as const;

/**
 * Parse and validate request data based on HTTP method
 */
async function parseAndValidateRequest<T>(
	req: Request,
	schema?: z.ZodSchema<T>,
): Promise<{ body?: T; query?: T }> {
	const method = req.method.toUpperCase();

	// Determine if we should parse query or body
	const isQueryMethod = QUERY_METHODS.includes(method as any);

	if (isQueryMethod) {
		// Parse query parameters
		if (!schema) {
			return { query: {} as T };
		}

		const url = new URL(req.url);
		const params: Record<string, any> = {};

		url.searchParams.forEach((value, key) => {
			// Attempt to parse numbers
			const numValue = Number(value);
			params[key] = isNaN(numValue) ? value : numValue;
		});

		const result = schema.safeParse(params);
		if (!result.success) {
			throw new ValidationError(result.error);
		}

		return { query: result.data };
	} else {
		// Parse request body
		if (!schema) {
			return { body: {} as T };
		}

		let body: unknown;
		try {
			body = await req.json();
		} catch (error) {
			throw new ValidationError("Invalid JSON in request body");
		}

		const result = schema.safeParse(body);
		if (!result.success) {
			throw new ValidationError(result.error);
		}

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
 */
export interface RouteContext<TBody = unknown, TQuery = unknown> {
	body?: TBody;
	query?: TQuery;
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
 *     // body is typed and validated
 *     const xp = await updateXP(user.id, body.delta);
 *     return jsonResponse({ xp });
 *   }, UpdateXPRequestSchema);
 * }
 * ```
 */
export async function handleProtectedRoute<TBody = unknown, TQuery = unknown, TResponse = unknown>(
	req: Request,
	handler: (context: AuthContext<TBody, TQuery>) => Promise<NextResponse<TResponse>>,
	schema?: z.ZodSchema<TBody | TQuery>,
): Promise<NextResponse> {
	return handleRoute(
		req,
		async ({ body, query, req: request }) => {
			// 1. Get session
			const session = await getServerSession(authOptions);
			const email = session?.user?.email;

			if (!email) {
				return errorResponse("Unauthorized", 401);
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
				return errorResponse("User not found", 404);
			}

			// 3. Call handler with authenticated user context and validated data
			// Type assertion: we know email is string because we checked above
			return handler({
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
				},
				body: body as TBody,
				query: query as TQuery,
				req: request,
			});
		},
		schema,
	);
}
