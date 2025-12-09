/**
 * Route handler utility for consistent error handling across API routes
 */

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';

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
 * Handle API route with consistent error handling
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   return handleRoute(async () => {
 *     const data = await req.json();
 *     // ... route logic ...
 *     return NextResponse.json({ result: data });
 *   });
 * }
 * ```
 */
export async function handleRoute<T>(
  handler: () => Promise<NextResponse<T>>,
  options: RouteHandlerOptions = {},
): Promise<NextResponse> {
  try {
    return await handler();
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
      console.error('Prisma Error:', {
        code: error.code,
        meta: error.meta,
        message: error.message,
      });

      // Handle unique constraint violations
      if (error.code === 'P2002') {
        const field = (error.meta?.target as string[])?.[0] ?? 'field';
        return NextResponse.json(
          { error: `${field} already exists` },
          { status: 409 },
        );
      }

      // Handle record not found
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 },
        );
      }

      // Generic Prisma error
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 },
      );
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('Prisma Validation Error:', error.message);
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 },
      );
    }

    // Handle generic errors
    if (error instanceof Error) {
      console.error('API Route Error:', {
        message: error.message,
        stack: error.stack,
      });

      // Check if error has a status code (custom error)
      if ('status' in error && typeof error.status === 'number') {
        return NextResponse.json(
          { error: error.message || 'An error occurred' },
          { status: error.status },
        );
      }

      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 },
      );
    }

    // Unknown error type
    console.error('Unknown API Route Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
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
 * Authenticated user context passed to protected route handlers
 */
export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Handle API route that requires authentication
 * 
 * Automatically handles:
 * - Session verification
 * - User lookup from database
 * - Returns 401 if not authenticated
 * - Returns 404 if user not found
 * 
 * @example
 * ```typescript
 * export async function GET() {
 *   return handleProtectedRoute(async ({ user }) => {
 *     // user is guaranteed to exist here with id, email, and name
 *     const projects = await prisma.project.findMany({
 *       where: { adminUserIds: { has: user.id } }
 *     });
 *     return jsonResponse({ projects });
 *   });
 * }
 * ```
 */
export async function handleProtectedRoute<T>(
  handler: (context: AuthContext) => Promise<NextResponse<T>>,
): Promise<NextResponse> {
  return handleRoute(async () => {
    // 1. Get session
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return errorResponse('Unauthorized', 401);
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
      return errorResponse('User not found', 404);
    }

    // 3. Call handler with authenticated user context
    // Type assertion: we know email is string because we checked above
    return handler({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  });
}
