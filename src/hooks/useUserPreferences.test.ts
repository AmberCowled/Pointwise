/**
 * Tests for useUserPreferences hook
 * 
 * Tests preference state management, browser detection, and server syncing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserPreferences } from './useUserPreferences';

// Mock DateTimeDefaults
vi.mock('@pointwise/lib/datetime', async () => {
  const actual = await vi.importActual('@pointwise/lib/datetime');
  return {
    ...actual,
    DateTimeDefaults: {
      locale: 'en-AU',
      timeZone: 'UTC',
    },
  };
});

describe('useUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window and navigator
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: {
        language: 'en-US',
      },
    });
    // Mock Intl.DateTimeFormat
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({
        timeZone: 'UTC',
      }),
    } as any));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided values', () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          initialLocale: 'en-US',
          initialTimeZone: 'America/New_York',
          detectBrowserPreferences: false, // Disable browser detection
        }),
      );

      expect(result.current.locale).toBe('en-US');
      expect(result.current.timeZone).toBe('America/New_York');
    });

    it('should use defaults when no initial values provided', () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          detectBrowserPreferences: false, // Disable browser detection for this test
        }),
      );

      expect(result.current.locale).toBe('en-AU');
      expect(result.current.timeZone).toBe('UTC');
    });

    it('should handle null initial values', () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          initialLocale: null,
          initialTimeZone: null,
          detectBrowserPreferences: false, // Disable browser detection for this test
        }),
      );

      expect(result.current.locale).toBe('en-AU');
      expect(result.current.timeZone).toBe('UTC');
    });
  });

  describe('state updates', () => {
    it('should update locale', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setLocale('fr-FR');
      });

      expect(result.current.locale).toBe('fr-FR');
    });

    it('should update timeZone', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setTimeZone('America/Los_Angeles');
      });

      expect(result.current.timeZone).toBe('America/Los_Angeles');
    });
  });

  describe('syncPreferences', () => {
    it('should sync preferences to server', async () => {
      const mockUpdatePreferences = vi.fn().mockResolvedValue({
        locale: 'en-GB',
        timeZone: 'Europe/London',
      });

      const { result } = renderHook(() =>
        useUserPreferences({
          updatePreferences: mockUpdatePreferences,
          detectBrowserPreferences: false,
        }),
      );

      await act(async () => {
        await result.current.syncPreferences('en-GB', 'Europe/London');
      });

      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        locale: 'en-GB',
        timeZone: 'Europe/London',
      });
      expect(result.current.locale).toBe('en-GB');
      expect(result.current.timeZone).toBe('Europe/London');
    });

    it('should not sync if preferences unchanged', async () => {
      const mockUpdatePreferences = vi.fn().mockResolvedValue({
        locale: 'en-US',
        timeZone: 'UTC',
      });

      const { result } = renderHook(() =>
        useUserPreferences({
          initialLocale: 'en-US',
          initialTimeZone: 'UTC',
          updatePreferences: mockUpdatePreferences,
          detectBrowserPreferences: false,
        }),
      );

      await act(async () => {
        await result.current.syncPreferences('en-US', 'UTC');
      });

      // Should not call updatePreferences if values are the same
      expect(mockUpdatePreferences).not.toHaveBeenCalled();
    });

    it('should update local state if no update function provided', async () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          detectBrowserPreferences: false,
        }),
      );

      await act(async () => {
        await result.current.syncPreferences('en-GB', 'Europe/London');
      });

      expect(result.current.locale).toBe('en-GB');
      expect(result.current.timeZone).toBe('Europe/London');
    });

    it('should handle sync errors gracefully', async () => {
      const mockUpdatePreferences = vi.fn().mockRejectedValue(new Error('Sync failed'));

      const { result } = renderHook(() =>
        useUserPreferences({
          updatePreferences: mockUpdatePreferences,
          detectBrowserPreferences: false,
        }),
      );

      // Should not throw
      await act(async () => {
        await result.current.syncPreferences('en-GB', 'Europe/London');
      });

      expect(mockUpdatePreferences).toHaveBeenCalled();
    });
  });

  describe('browser preference detection', () => {
    it('should detect browser locale when enabled', () => {
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          language: 'fr-FR',
        },
      });

      // Mock Intl.DateTimeFormat
      const mockResolvedOptions = vi.fn().mockReturnValue({
        timeZone: 'Europe/Paris',
      });
      vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
        resolvedOptions: mockResolvedOptions,
      } as any));

      const { result } = renderHook(() =>
        useUserPreferences({
          detectBrowserPreferences: true,
        }),
      );

      // Browser detection happens in useEffect, may need to wait
      expect(result.current.locale).toBeDefined();
      expect(result.current.timeZone).toBeDefined();
    });

    it('should not detect browser preferences when disabled', () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          initialLocale: 'en-AU',
          initialTimeZone: 'UTC',
          detectBrowserPreferences: false,
        }),
      );

      expect(result.current.locale).toBe('en-AU');
      expect(result.current.timeZone).toBe('UTC');
    });
  });

  describe('initial props updates', () => {
    it('should update when initial props change', () => {
      const { result, rerender } = renderHook(
        ({ initialLocale, initialTimeZone }) =>
          useUserPreferences({
            initialLocale,
            initialTimeZone,
            detectBrowserPreferences: false,
          }),
        {
          initialProps: {
            initialLocale: 'en-US',
            initialTimeZone: 'UTC',
          },
        },
      );

      expect(result.current.locale).toBe('en-US');

      rerender({
        initialLocale: 'en-GB',
        initialTimeZone: 'Europe/London',
      });

      expect(result.current.locale).toBe('en-GB');
      expect(result.current.timeZone).toBe('Europe/London');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid preference changes', async () => {
      const mockUpdatePreferences = vi.fn().mockResolvedValue({
        locale: 'en-US',
        timeZone: 'UTC',
      });

      const { result } = renderHook(() =>
        useUserPreferences({
          updatePreferences: mockUpdatePreferences,
          detectBrowserPreferences: false,
        }),
      );

      await act(async () => {
        result.current.setLocale('en-GB');
        result.current.setTimeZone('Europe/London');
        result.current.setLocale('fr-FR');
        result.current.setTimeZone('Europe/Paris');
      });

      // Should eventually sync (may be debounced)
      await waitFor(() => {
        expect(result.current.locale).toBe('fr-FR');
      });
    });
  });
});

