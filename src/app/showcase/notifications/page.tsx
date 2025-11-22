'use client';

import {
  NotificationProvider,
  useNotifications,
} from '@pointwise/app/components/ui/NotificationProvider';
import { Button } from '@pointwise/app/components/ui/Button';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';

function NotificationShowcaseContent() {
  const { showNotification, dismissAll } = useNotifications();

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Notification Component Showcase
          </h1>
          <p className="text-sm text-zinc-400">
            Comprehensive display of notification variants, sizes, and features
          </p>
        </div>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
          <p className="text-xs text-zinc-500">
            Different notification types for different contexts
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'Task created successfully!',
                  variant: 'success',
                })
              }
            >
              Success
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'Failed to create task. Please try again.',
                  variant: 'error',
                })
              }
            >
              Error
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'Your session will expire in 5 minutes.',
                  variant: 'warning',
                })
              }
            >
              Warning
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'New features are available. Check them out!',
                  variant: 'info',
                })
              }
            >
              Info
            </Button>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
          <p className="text-xs text-zinc-500">
            Size variants matching other component system
          </p>
          <div className="flex flex-wrap gap-3">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <Button
                key={size}
                variant="primary"
                size="md"
                onClick={() =>
                  showNotification({
                    message: `This is a ${size} notification`,
                    variant: 'info',
                    size,
                  })
                }
              >
                {size.toUpperCase()}
              </Button>
            ))}
          </div>
        </section>

        {/* With Title */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">With Title</h2>
          <p className="text-xs text-zinc-500">
            Notifications can include an optional title
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                showNotification({
                  title: 'Task Completed',
                  message: 'You earned 50 XP for completing this task!',
                  variant: 'success',
                })
              }
            >
              Success with Title
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() =>
                showNotification({
                  title: 'Error',
                  message:
                    'Unable to connect to the server. Please check your connection.',
                  variant: 'error',
                })
              }
            >
              Error with Title
            </Button>
          </div>
        </section>

        {/* With Action */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            With Action Button
          </h2>
          <p className="text-xs text-zinc-500">
            Notifications can include action buttons for user interaction
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                showNotification({
                  title: 'Update Available',
                  message: 'A new version of the app is available.',
                  variant: 'info',
                  action: {
                    label: 'Update Now',
                    onClick: () => {
                      showNotification({
                        message: 'Updating...',
                        variant: 'info',
                      });
                    },
                  },
                })
              }
            >
              With Action
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                showNotification({
                  title: 'Task Deleted',
                  message: 'The task has been permanently deleted.',
                  variant: 'warning',
                  action: {
                    label: 'Undo',
                    onClick: () => {
                      showNotification({
                        message: 'Task restored',
                        variant: 'success',
                      });
                    },
                  },
                })
              }
            >
              Undo Action
            </Button>
          </div>
        </section>

        {/* Custom Duration */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Custom Duration
          </h2>
          <p className="text-xs text-zinc-500">
            Control how long notifications stay visible
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'This notification stays for 2 seconds',
                  variant: 'info',
                  duration: 2000,
                })
              }
            >
              2 Seconds
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'This notification stays for 10 seconds',
                  variant: 'info',
                  duration: 10000,
                })
              }
            >
              10 Seconds
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'This notification will not auto-dismiss',
                  variant: 'warning',
                  duration: 0,
                })
              }
            >
              No Auto-Dismiss
            </Button>
          </div>
        </section>

        {/* Non-Dismissible */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Non-Dismissible
          </h2>
          <p className="text-xs text-zinc-500">
            Notifications that cannot be manually dismissed
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'This notification cannot be dismissed manually',
                  variant: 'warning',
                  dismissible: false,
                  duration: 5000,
                })
              }
            >
              Non-Dismissible
            </Button>
          </div>
        </section>

        {/* Custom Icon */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Custom Icon</h2>
          <p className="text-xs text-zinc-500">
            Override the default variant icon with a custom one
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                showNotification({
                  message: 'Custom icon notification',
                  variant: 'info',
                  icon: <span className="text-2xl">🎉</span>,
                })
              }
            >
              Custom Icon
            </Button>
          </div>
        </section>

        {/* Multiple Notifications */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Multiple Notifications
          </h2>
          <p className="text-xs text-zinc-500">
            Show multiple notifications at once (stacked)
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                showNotification({
                  message: 'First notification',
                  variant: 'success',
                });
                setTimeout(() => {
                  showNotification({
                    message: 'Second notification',
                    variant: 'info',
                  });
                }, 300);
                setTimeout(() => {
                  showNotification({
                    message: 'Third notification',
                    variant: 'warning',
                  });
                }, 600);
              }}
            >
              Show Multiple
            </Button>
            <Button variant="secondary" size="md" onClick={() => dismissAll()}>
              Dismiss All
            </Button>
          </div>
        </section>

        {/* Real-World Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Real-World Examples
          </h2>
          <p className="text-xs text-zinc-500">
            Common use cases for notifications
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() =>
                showNotification({
                  title: 'Task Created',
                  message: 'Your new task has been added to your list.',
                  variant: 'success',
                })
              }
            >
              Task Created Success
            </Button>
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={() =>
                showNotification({
                  title: 'Task Creation Failed',
                  message:
                    'Unable to create task. Please check your connection and try again.',
                  variant: 'error',
                  action: {
                    label: 'Retry',
                    onClick: () => {
                      showNotification({
                        message: 'Retrying...',
                        variant: 'info',
                      });
                    },
                  },
                })
              }
            >
              Task Creation Error
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() =>
                showNotification({
                  title: 'XP Earned',
                  message:
                    'You earned 50 XP for completing "Review project proposal"',
                  variant: 'success',
                  action: {
                    label: 'View Profile',
                    onClick: () => {
                      showNotification({
                        message: 'Redirecting to profile...',
                        variant: 'info',
                      });
                    },
                  },
                })
              }
            >
              XP Reward Notification
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() =>
                showNotification({
                  title: 'Session Expiring',
                  message:
                    'Your session will expire in 5 minutes. Save your work.',
                  variant: 'warning',
                  duration: 0, // Don't auto-dismiss important warnings
                })
              }
            >
              Session Warning
            </Button>
          </div>
        </section>

        {/* Variant × Size Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Variant × Size Matrix
          </h2>
          <p className="text-xs text-zinc-500">
            All combinations of variants and sizes
          </p>
          <div className="space-y-6">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={size} className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-300 capitalize">
                  Size: {size}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      showNotification({
                        message: `Success ${size}`,
                        variant: 'success',
                        size,
                      })
                    }
                  >
                    Success
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      showNotification({
                        message: `Error ${size}`,
                        variant: 'error',
                        size,
                      })
                    }
                  >
                    Error
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      showNotification({
                        message: `Warning ${size}`,
                        variant: 'warning',
                        size,
                      })
                    }
                  >
                    Warning
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      showNotification({
                        message: `Info ${size}`,
                        variant: 'info',
                        size,
                      })
                    }
                  >
                    Info
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function NotificationShowcasePage() {
  return (
    <NotificationProvider position="top-right" maxNotifications={5}>
      <NotificationShowcaseContent />
    </NotificationProvider>
  );
}
