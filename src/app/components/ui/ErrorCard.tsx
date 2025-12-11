'use client';

import { IoWarning } from 'react-icons/io5';
import { Card } from './Card';
import { Button } from './Button';

export interface ErrorCardProps {
  /**
   * Whether to display the error card
   */
  display: boolean;
  /**
   * Error message to display
   */
  message: string;
  /**
   * Callback function when retry button is clicked
   */
  onRetry: () => void;
}

/**
 * ErrorCard Component
 *
 * Displays an error message with a retry button in a danger-styled card.
 * Uses Card component with danger variant, yellow warning icon, and white text.
 */
export function ErrorCard({ display, message, onRetry }: ErrorCardProps) {
  if (!display) return null;

  return (
    <Card variant="danger" className="mb-6">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <IoWarning className="h-6 w-6 text-yellow-400 flex-shrink-0" />
          <p className="text-sm font-medium text-white">{message}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex-shrink-0"
        >
          Retry
        </Button>
      </div>
    </Card>
  );
}
