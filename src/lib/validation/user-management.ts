/**
 * User Management Validation
 * 
 * Validates user management requests (add/remove/update roles)
 */

import type { ProjectRole } from '../api/types';

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface AddUserRequest {
  userId: string;
  role: ProjectRole;
}

export interface UpdateUserRoleRequest {
  role: ProjectRole;
}

export interface ApproveJoinRequestRequest {
  role: 'user' | 'viewer'; // Cannot approve as admin via join request
}

/**
 * Validate add user request
 */
export function parseAddUserBody(
  body: unknown,
): ValidationResult<AddUserRequest> {
  if (!body || typeof body !== 'object') {
    return {
      success: false,
      error: 'Invalid request body',
      status: 400,
    };
  }

  const data = body as Record<string, unknown>;

  // Validate userId (required)
  if (!data.userId || typeof data.userId !== 'string') {
    return {
      success: false,
      error: 'User ID is required',
      status: 400,
    };
  }

  const userId = data.userId.trim();
  if (userId.length === 0) {
    return {
      success: false,
      error: 'User ID cannot be empty',
      status: 400,
    };
  }

  // Validate role (required)
  if (!data.role || typeof data.role !== 'string') {
    return {
      success: false,
      error: 'Role is required',
      status: 400,
    };
  }

  const validRoles: ProjectRole[] = ['admin', 'user', 'viewer'];
  if (!validRoles.includes(data.role as ProjectRole)) {
    return {
      success: false,
      error: 'Role must be "admin", "user", or "viewer"',
      status: 400,
    };
  }

  return {
    success: true,
    data: {
      userId,
      role: data.role as ProjectRole,
    },
  };
}

/**
 * Validate update user role request
 */
export function parseUpdateUserRoleBody(
  body: unknown,
): ValidationResult<UpdateUserRoleRequest> {
  if (!body || typeof body !== 'object') {
    return {
      success: false,
      error: 'Invalid request body',
      status: 400,
    };
  }

  const data = body as Record<string, unknown>;

  // Validate role (required)
  if (!data.role || typeof data.role !== 'string') {
    return {
      success: false,
      error: 'Role is required',
      status: 400,
    };
  }

  const validRoles: ProjectRole[] = ['admin', 'user', 'viewer'];
  if (!validRoles.includes(data.role as ProjectRole)) {
    return {
      success: false,
      error: 'Role must be "admin", "user", or "viewer"',
      status: 400,
    };
  }

  return {
    success: true,
    data: {
      role: data.role as ProjectRole,
    },
  };
}

/**
 * Validate approve join request
 */
export function parseApproveJoinRequestBody(
  body: unknown,
): ValidationResult<ApproveJoinRequestRequest> {
  if (!body || typeof body !== 'object') {
    return {
      success: false,
      error: 'Invalid request body',
      status: 400,
    };
  }

  const data = body as Record<string, unknown>;

  // Validate role (required)
  if (!data.role || typeof data.role !== 'string') {
    return {
      success: false,
      error: 'Role is required',
      status: 400,
    };
  }

  // Only 'user' and 'viewer' roles allowed for join requests
  if (data.role !== 'user' && data.role !== 'viewer') {
    return {
      success: false,
      error: 'Role must be "user" or "viewer" (cannot approve as admin via join request)',
      status: 400,
    };
  }

  return {
    success: true,
    data: {
      role: data.role as 'user' | 'viewer',
    },
  };
}

