/**
 * Tests for useSignup hook
 * 
 * Tests signup form logic, error handling, and auto-login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock next-auth - must be hoisted
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock NotificationProvider - must be hoisted
vi.mock('@pointwise/app/components/ui/NotificationProvider', () => ({
  useNotifications: () => ({
    showNotification: vi.fn(),
  }),
}));

// Mock useApi - must be hoisted
vi.mock('@pointwise/lib/api', () => ({
  useApi: vi.fn(),
}));

import { useSignup } from './useSignup';
import { signIn } from 'next-auth/react';
import { useApi } from '@pointwise/lib/api';

describe('useSignup', () => {
  const mockSignIn = vi.mocked(signIn);
  const mockUseApi = vi.mocked(useApi);
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ ok: true } as any);
    mockUseApi.mockReturnValue({
      auth: {
        signup: mockSignup,
      },
      tasks: {} as any,
      user: {} as any,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSignup());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state during signup', async () => {
    mockSignup.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const { result } = renderHook(() => useSignup());

    act(() => {
      result.current.signup({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should call signup API and auto-login on success', async () => {
    mockSignup.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSignup());

    await act(async () => {
      await result.current.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });

    expect(mockSignup).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
      redirect: true,
      callbackUrl: '/dashboard',
    });
  });

  it('should handle signup without name', async () => {
    mockSignup.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSignup());

    await act(async () => {
      await result.current.signup({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockSignup).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should set error state on signup failure', async () => {
    const errorMessage = 'Email already exists';
    mockSignup.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useSignup());

    await act(async () => {
      await result.current.signup({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should handle non-Error exceptions', async () => {
    mockSignup.mockRejectedValue('String error');

    const { result } = renderHook(() => useSignup());

    await act(async () => {
      await result.current.signup({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(result.current.error).toBe('Something went wrong');
    expect(result.current.loading).toBe(false);
  });

  it('should clear error on new signup attempt', async () => {
    mockSignup
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSignup());

    // First attempt - fails
    await act(async () => {
      await result.current.signup({
        email: 'test@example.com',
        password: 'wrong',
      });
    });

    expect(result.current.error).toBe('First error');

    // Second attempt - succeeds
    await act(async () => {
      await result.current.signup({
        email: 'test@example.com',
        password: 'correct',
      });
    });

    expect(result.current.error).toBeNull();
  });

  it('should return signIn result', async () => {
    const mockResult = { ok: true, url: '/dashboard' };
    mockSignup.mockResolvedValue(undefined);
    mockSignIn.mockResolvedValue(mockResult as any);

    const { result } = renderHook(() => useSignup());

    let signupResult: any;
    await act(async () => {
      signupResult = await result.current.signup({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(signupResult).toEqual(mockResult);
  });
});
