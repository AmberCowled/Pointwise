'use client';

import clsx from 'clsx';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Notification } from './Notification';
import type {
  NotificationPosition,
  NotificationVariant,
  NotificationSize,
} from './Notification';

export interface NotificationOptions {
  /**
   * The message to display
   */
  message: string;
  /**
   * Optional title for the notification
   */
  title?: string;
  /**
   * Variant style of the notification
   * @default 'info'
   */
  variant?: NotificationVariant;
  /**
   * Size of the notification
   * @default 'md'
   */
  size?: NotificationSize;
  /**
   * Duration in milliseconds before auto-dismissing. Set to 0 to disable auto-dismiss
   * @default 5000
   */
  duration?: number;
  /**
   * Whether the notification can be manually dismissed
   * @default true
   */
  dismissible?: boolean;
  /**
   * Optional icon to display (overrides default variant icon)
   */
  icon?: React.ReactNode;
  /**
   * Optional action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState extends NotificationOptions {
  id: string;
}

interface NotificationContextValue {
  showNotification: (options: NotificationOptions) => string;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const positionStyles: Record<NotificationPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export interface NotificationProviderProps {
  /**
   * Position where notifications appear
   * @default 'top-right'
   */
  position?: NotificationPosition;
  /**
   * Maximum number of notifications to show at once
   * @default 5
   */
  maxNotifications?: number;
  /**
   * Children to render
   */
  children: React.ReactNode;
}

/**
 * Provider component for managing notifications throughout the app.
 *
 * @example
 * ```tsx
 * <NotificationProvider position="top-right" maxNotifications={5}>
 *   <App />
 * </NotificationProvider>
 * ```
 */
export function NotificationProvider({
  position = 'top-right',
  maxNotifications = 5,
  children,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const showNotification = useCallback(
    (options: NotificationOptions): string => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setNotifications((prev) => {
        const newNotifications = [...prev, { ...options, id }];
        // Limit the number of notifications
        return newNotifications.slice(-maxNotifications);
      });

      return id;
    },
    [maxNotifications],
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextValue = {
    showNotification,
    dismissNotification,
    dismissAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        className={clsx(
          'fixed z-50 pointer-events-none',
          positionStyles[position],
          position.includes('top') || position.includes('bottom')
            ? 'flex flex-col gap-3'
            : '',
        )}
        style={{
          maxWidth: position.includes('center') ? '90vw' : '420px',
          width: position.includes('center') ? 'auto' : '100%',
        }}
      >
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              {...notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification functions.
 *
 * @example
 * ```tsx
 * const { showNotification } = useNotifications();
 *
 * showNotification({
 *   message: 'Task created!',
 *   variant: 'success',
 * });
 * ```
 */
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }

  return context;
}

// Re-export for convenience
export { Notification };
