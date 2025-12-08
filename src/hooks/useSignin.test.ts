/**
 * Tests for useSignin hook
 * 
 * Tests signin form logic, error handling, and redirect
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock next-auth - must be hoisted
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

import { useSignin } from './useSignin';
import { signIn } from 'next-auth/react';

// Mock window.location
const originalLocation = window.location;

describe('useSignin', () => {
  const mockSignIn = vi.mocked(signIn);
  let mockLocationHref: string;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationHref = '';
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        get href() {
          return mockLocationHref;
        },
        set href(value: string) {
          mockLocationHref = value;
        },
      },
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSignin());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state during signin', async () => {
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true } as any), 100)),
    );

    const { result } = renderHook(() => useSignin());

    act(() => {
      result.current.signin('test@example.com', 'password123', false);
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should call signIn with correct parameters', async () => {
    mockSignIn.mockResolvedValue({ ok: true, url: '/dashboard' } as any);

    const { result } = renderHook(() => useSignin());

    await act(async () => {
      await result.current.signin('test@example.com', 'password123', true);
    });

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
      redirect: false,
      callbackUrl: '/dashboard',
      remember: true,
    });
  });

  it('should handle remember parameter', async () => {
    mockSignIn.mockResolvedValue({ ok: true, url: '/dashboard' } as any);

    const { result } = renderHook(() => useSignin());

    await act(async () => {
      await result.current.signin('test@example.com', 'password123', false);
    });

    expect(mockSignIn).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({
        remember: false,
      }),
    );
  });

  it('should redirect on successful signin', async () => {
    const dashboardUrl = '/dashboard';
    mockSignIn.mockResolvedValue({ ok: true, url: dashboardUrl } as any);

    const { result } = renderHook(() => useSignin());

    await act(async () => {
      await result.current.signin('test@example.com', 'password123', false);
    });

    expect(window.location.href).toBe(dashboardUrl);
  });

  it('should use default redirect if no URL provided', async () => {
    mockSignIn.mockResolvedValue({ ok: true, url: null } as any);

    const { result } = renderHook(() => useSignin());

    await act(async () => {
      await result.current.signin('test@example.com', 'password123', false);
    });

    expect(window.location.href).toBe('/dashboard');
  });

  it('should set error on signin failure', async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' } as any);

    const { result } = renderHook(() => useSignin());

    await act(async () => {
      await result.current.signin('test@example.com', 'wrongpassword', false);
    });

    expect(result.current.error).toBe('Invalid email or password');
    expect(result.current.loading).toBe(false);
    expect(window.location.href).toBe(''); // Should not redirect
  });

  it('should clear error on new signin attempt', async () => {
    mockSignIn
      .mockResolvedValueOnce({ ok: false, error: 'Invalid credentials' } as any)
      .mockResolvedValueOnce({ ok: true, url: '/dashboard' } as any);

    const { result } = renderHook(() => useSignin());

    // First attempt - fails
    await act(async () => {
      await result.current.signin('test@example.com', 'wrong', false);
    });

    expect(result.current.error).toBe('Invalid email or password');

    // Second attempt - succeeds
    await act(async () => {
      await result.current.signin('test@example.com', 'correct', false);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle signIn errors gracefully', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSignin());

    // The hook doesn't catch signIn errors, so the error will propagate
    await expect(
      act(async () => {
        await result.current.signin('test@example.com', 'password123', false);
      }),
    ).rejects.toThrow('Network error');

    // Loading should be false after error
    expect(result.current.loading).toBe(false);
  });
});
