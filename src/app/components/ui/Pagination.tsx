'use client';

import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from './Button';
import { InputSelect } from './InputSelect';

export type PaginationVariant = 'primary' | 'secondary';
export type PaginationSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PaginationProps = {
  /**
   * Current page number (1-indexed). Must be >= 1.
   * The component will auto-correct if out of bounds.
   */
  currentPage: number;
  /**
   * Number of items per page. Must be >= 1.
   * The component will auto-correct if invalid.
   */
  pageSize: number;
  /**
   * Total number of items across all pages. Must be >= 0.
   * The component will auto-correct if negative.
   */
  totalItems: number;
  /**
   * Callback fired when the page changes.
   * @param page - The new page number (1-indexed)
   */
  onPageChange: (page: number) => void;
  /**
   * Callback fired when the page size changes.
   * @param size - The new page size (number of items per page)
   */
  onPageSizeChange?: (size: number) => void;
  /**
   * Whether to show the item count text (e.g., "1-10 of 100")
   * @default true
   */
  showItemCount?: boolean;
  /**
   * Whether to show the page size selector dropdown
   * @default true
   */
  showPageSizeSelector?: boolean;
  /**
   * Page size options with custom labels.
   * @default [{ value: 10, label: '10' }, { value: 20, label: '20' }, { value: 50, label: '50' }, { value: 100, label: '100' }]
   * @example
   * pageSizeOptions={[
   *   { value: 10, label: '10' },
   *   { value: 20, label: '20' },
   *   { value: totalItems, label: 'All' }
   * ]}
   */
  pageSizeOptions?: Array<{ value: number; label: string }>;
  /**
   * Visual variant of the pagination component
   * - `primary`: Indigo accent colors
   * - `secondary`: Fuchsia accent colors
   * @default 'primary'
   */
  variant?: PaginationVariant;
  /**
   * Size of the pagination component
   * Affects button sizes, text sizes, and spacing
   * @default 'md'
   */
  size?: PaginationSize;
  /**
   * Whether the pagination is in a loading state
   * When true, controls are disabled and a loading indicator may be shown
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether to hide the pagination component when there are no items
   * @default false
   */
  hideWhenEmpty?: boolean;
  /**
   * Enable smooth transitions when changing pages
   * @default false
   */
  enableTransitions?: boolean;
  /**
   * Custom className for the root container (`<nav>` element)
   * @example
   * className="my-custom-pagination"
   */
  className?: string;
};

const DEFAULT_PAGE_SIZE_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
];

// Base styles - Mobile first: tighter spacing on mobile
const baseContainerStyle =
  'flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center';

const basePageButtonStyle =
  'flex items-center justify-center rounded-lg border font-medium transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

// Variant styles for page buttons
const variantPageButtonStyles: Record<PaginationVariant, string> = {
  primary:
    'border-white/10 bg-white/5 text-zinc-200 hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white',
  secondary:
    'border-white/10 bg-zinc-900/80 text-zinc-200 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 hover:text-white',
};

const variantActivePageStyles: Record<PaginationVariant, string> = {
  primary:
    'border-indigo-400/60 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20',
  secondary:
    'border-fuchsia-500/60 bg-fuchsia-500/20 text-white shadow-lg shadow-fuchsia-500/20',
};

// Size styles for text and spacing
const sizeTextStyles: Record<PaginationSize, string> = {
  xs: 'text-xs',
  sm: 'text-xs sm:text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const sizePageButtonStyles: Record<PaginationSize, string> = {
  // Mobile: Minimum 44x44px touch target (WCAG recommendation), Desktop: Compact
  xs: 'min-w-[2.75rem] h-11 text-xs px-2 sm:min-w-[1.75rem] sm:h-7',
  sm: 'min-w-[2.75rem] h-11 text-xs px-2 sm:min-w-[2rem] sm:h-8',
  md: 'min-w-[2.75rem] h-11 text-xs px-2 sm:min-w-[2.25rem] sm:h-9 sm:text-sm sm:px-2.5',
  lg: 'min-w-[2.75rem] h-11 text-sm px-2.5 sm:min-w-[2.5rem] sm:h-10 sm:text-base sm:px-3',
  xl: 'min-w-[2.75rem] h-11 text-base px-3 sm:min-w-[3rem] sm:h-12 sm:text-lg sm:px-4',
};

const sizeGapStyles: Record<PaginationSize, string> = {
  // Mobile: Larger gaps for easier tapping, Desktop: Tighter spacing
  xs: 'gap-2 sm:gap-1.5',
  sm: 'gap-2.5 sm:gap-2',
  md: 'gap-2.5 sm:gap-2.5',
  lg: 'gap-3 sm:gap-3',
  xl: 'gap-3.5 sm:gap-4',
};

// Helper function to generate page numbers with ellipsis for desktop
function generateDesktopPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | 'ellipsis'> = [];
  const halfVisible = Math.floor(maxVisible / 2);

  if (currentPage <= halfVisible + 1) {
    // Near the start
    const pagesBeforeEllipsis = Math.min(4, maxVisible - 2);
    for (let i = 1; i <= pagesBeforeEllipsis; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
    pages.push(totalPages);
  } else if (currentPage >= totalPages - halfVisible) {
    // Near the end
    pages.push(1);
    pages.push('ellipsis');
    const pagesAfterEllipsis = Math.min(4, maxVisible - 2);
    for (let i = totalPages - (pagesAfterEllipsis - 1); i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // In the middle
    pages.push(1);
    pages.push('ellipsis');
    const pagesAroundCurrent = Math.min(3, maxVisible - 5);
    const startPage = Math.max(
      2,
      currentPage - Math.floor((pagesAroundCurrent - 1) / 2),
    );
    const endPage = Math.min(
      totalPages - 1,
      startPage + pagesAroundCurrent - 1,
    );
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages;
}

// Helper function to generate sliding window of page numbers for mobile (no ellipsis)
// Shifts window appropriately when near start/end
function generateMobilePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number,
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Calculate window bounds
  // Try to center current page, but shift when near start/end
  const halfWindow = Math.floor(maxVisible / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  // If we're near the end, shift window left
  if (endPage === totalPages) {
    startPage = Math.max(1, totalPages - maxVisible + 1);
    endPage = totalPages;
  }

  // If we're near the start, shift window right
  if (startPage === 1) {
    startPage = 1;
    endPage = Math.min(totalPages, maxVisible);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );
}

/**
 * Pagination component for navigating through paginated data.
 *
 * Features:
 * - Mobile-first responsive design with touch-friendly targets
 * - Accessible with ARIA attributes and screen reader support
 * - Customizable variants and sizes
 * - Loading states and empty state handling
 * - Smooth transitions
 * - Flexible page size options with custom labels
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   pageSize={10}
 *   totalItems={100}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 *
 * @example
 * Minimalist configuration:
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   pageSize={pageSize}
 *   totalItems={totalItems}
 *   onPageChange={setCurrentPage}
 *   onPageSizeChange={setPageSize}
 *   showItemCount={false}
 *   size="sm"
 *   variant="secondary"
 * />
 * ```
 *
 * @example
 * With loading state:
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   pageSize={pageSize}
 *   totalItems={totalItems}
 *   onPageChange={setCurrentPage}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showItemCount = true,
  showPageSizeSelector = true,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  hideWhenEmpty = false,
  enableTransitions = false,
  className,
}: PaginationProps) {
  // Input validation & edge case handling
  // Auto-correct invalid values to prevent bugs
  const validatedPageSize = Math.max(1, pageSize);
  const validatedTotalItems = Math.max(0, totalItems);
  const validatedTotalPages = Math.max(
    1,
    Math.ceil(validatedTotalItems / validatedPageSize),
  );
  const validatedCurrentPage = Math.max(
    1,
    Math.min(currentPage, validatedTotalPages),
  );

  // Accessibility: Track previous page for aria-live announcements
  const previousPageRef = useRef(validatedCurrentPage);
  const navigationRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for dynamic width calculation on mobile
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Measure available width for dynamic page calculation
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      setAvailableWidth(width);
      // Consider mobile if width < 640px (sm breakpoint)
      setIsMobile(width < 640);
    };

    // Initial measurement
    updateWidth();

    // Use ResizeObserver for efficient width tracking
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(containerRef.current);

    // Fallback: also listen to window resize for orientation changes
    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Announce page changes to screen readers
  useEffect(() => {
    if (previousPageRef.current !== validatedCurrentPage) {
      previousPageRef.current = validatedCurrentPage;
    }
  }, [validatedCurrentPage]);

  // Hide component when empty if requested
  if (hideWhenEmpty && validatedTotalItems === 0) {
    return null;
  }

  const canGoPrevious = validatedCurrentPage > 1 && !isLoading;
  const canGoNext = validatedCurrentPage < validatedTotalPages && !isLoading;

  const handlePrevious = () => {
    if (canGoPrevious && !isLoading) {
      onPageChange(validatedCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext && !isLoading) {
      onPageChange(validatedCurrentPage + 1);
    }
  };

  const handlePageSizeChange = (value: number) => {
    if (isLoading) return;
    const validatedValue = Math.max(1, value);
    onPageSizeChange?.(validatedValue);
    // Reset to page 1 when page size changes
    onPageChange(1);
  };

  const startItem =
    validatedTotalItems === 0
      ? 0
      : (validatedCurrentPage - 1) * validatedPageSize + 1;
  const endItem = Math.min(
    validatedCurrentPage * validatedPageSize,
    validatedTotalItems,
  );

  // Map pagination variant to button/input variant
  const buttonVariant = variant === 'primary' ? 'secondary' : 'secondary';
  const inputSelectVariant = variant;

  // Calculate max pages that fit based on available width (works for both mobile and desktop)
  // Button width estimates (min-width from styles) + gaps
  const getMaxPages = (): number => {
    if (!availableWidth) {
      // Fallback when width isn't calculated yet (only during initial render)
      // Use minimum values that match our enforced minimums below
      return isMobile ? 3 : 5;
    }

    // Estimate button width based on size
    // Mobile: min-w-[2.75rem] = 44px, Desktop: varies by size (sm: 32px, md: 36px, etc.)
    // Use average accounting for multi-digit numbers
    const avgButtonWidth = isMobile ? 55 : 45; // pixels (desktop buttons are more compact)
    const gapWidth = isMobile ? 10 : 4; // pixels (mobile: gap-2.5 = 10px, desktop: gap-1 = 4px)
    const prevNextWidth = isMobile ? 100 : 80; // pixels (approximate for both prev/next buttons + gaps)

    // Account for ellipsis on desktop (each ellipsis takes ~30px)
    // We'll estimate 1-2 ellipsis might appear
    const ellipsisWidth = isMobile ? 0 : 60; // pixels (2 ellipsis max)

    const availableForPages = availableWidth - prevNextWidth - ellipsisWidth;
    const maxPages = Math.floor(
      availableForPages / (avgButtonWidth + gapWidth),
    );

    // Ensure minimum and maximum reasonable limits
    if (isMobile) {
      return Math.max(3, Math.min(maxPages, 9));
    } else {
      // Desktop: allow more pages since we have more space
      return Math.max(5, Math.min(maxPages, 15));
    }
  };

  // Generate page numbers: mobile uses sliding window, desktop uses ellipsis
  // Both now dynamically calculate max pages based on available width
  const pageNumbers = isMobile
    ? generateMobilePageNumbers(
        validatedCurrentPage,
        validatedTotalPages,
        getMaxPages(),
      )
    : generateDesktopPageNumbers(
        validatedCurrentPage,
        validatedTotalPages,
        getMaxPages(),
      );

  // Determine if we should use the three-section layout (left info, center nav, right selector)
  // This layout is used when either showItemCount or showPageSizeSelector is true
  const useThreeSectionLayout =
    showItemCount || (showPageSizeSelector && onPageSizeChange);

  return (
    <nav
      aria-label="Pagination Navigation"
      className={clsx(
        baseContainerStyle,
        useThreeSectionLayout ? 'justify-between' : 'justify-center',
        enableTransitions && 'transition-all duration-200 ease-in-out',
        className,
      )}
    >
      {/* Screen reader announcement for page changes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {validatedTotalItems > 0 && (
          <span>
            Page {validatedCurrentPage} of {validatedTotalPages}, showing{' '}
            {startItem} to {endItem} of {validatedTotalItems} items
          </span>
        )}
      </div>

      {/* Left section: Item count (hidden on mobile) */}
      {useThreeSectionLayout && (
        <div className="hidden sm:flex items-center shrink-0">
          {showItemCount ? (
            <div className={clsx(sizeTextStyles[size], 'text-zinc-500')}>
              <span className="text-zinc-400">
                {startItem}–{endItem}
              </span>{' '}
              <span className="text-zinc-500">of</span>{' '}
              <span className="text-zinc-300">{validatedTotalItems}</span>
            </div>
          ) : (
            // Invisible placeholder to maintain centered navigation on desktop
            <div className="invisible" aria-hidden="true">
              <div className={clsx(sizeTextStyles[size], 'text-zinc-500')}>
                <span className="text-zinc-400">0–0</span>{' '}
                <span className="text-zinc-500">of</span>{' '}
                <span className="text-zinc-300">0</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Center section: Navigation controls */}
      {/* On mobile: full width, on desktop: flex-1 when using three-section layout */}
      <div
        ref={containerRef}
        className={clsx(
          'flex items-center',
          isMobile || !useThreeSectionLayout
            ? 'w-full justify-center flex-wrap'
            : 'flex-1 justify-center flex-wrap sm:flex-nowrap',
        )}
      >
        <div
          ref={navigationRef}
          role="group"
          aria-label="Page navigation"
          className={clsx(
            'flex items-center w-full sm:w-auto',
            'justify-center flex-wrap sm:flex-nowrap',
          )}
        >
          {/* Navigation controls wrapper - keeps buttons together */}
          <div
            className={clsx(
              'flex items-center flex-wrap',
              sizeGapStyles[size],
              'justify-center',
              'sm:flex-nowrap',
            )}
          >
            {/* Previous button */}
            <Button
              type="button"
              variant={buttonVariant}
              size={size}
              onClick={handlePrevious}
              disabled={!canGoPrevious || isLoading}
              className="rounded-lg shrink-0"
              aria-label={`Go to previous page (page ${validatedCurrentPage - 1} of ${validatedTotalPages})`}
            >
              ‹
            </Button>

            {/* Page numbers */}
            {pageNumbers.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1 min-w-0 flex-1 sm:flex-initial">
                {/* Mobile: Fill available space, Desktop: Normal spacing */}
                <div className="flex items-center gap-1 sm:gap-1 flex-wrap sm:flex-nowrap justify-center w-full sm:w-auto">
                  {pageNumbers.map((page, index) => {
                    // Hide ellipsis on mobile
                    if (page === 'ellipsis') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className={clsx(
                            sizePageButtonStyles[size],
                            'hidden sm:flex items-center justify-center text-zinc-500 shrink-0',
                          )}
                        >
                          …
                        </span>
                      );
                    }

                    const isActive = page === validatedCurrentPage;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => !isLoading && onPageChange(page)}
                        disabled={isLoading}
                        className={clsx(
                          basePageButtonStyle,
                          sizePageButtonStyles[size],
                          isActive
                            ? variantActivePageStyles[variant]
                            : variantPageButtonStyles[variant],
                          'shrink-0',
                          // Ensure buttons don't get too small on mobile
                          'touch-manipulation',
                          // Smooth transitions for page changes
                          enableTransitions &&
                            'transition-all duration-150 ease-in-out',
                          // On mobile, allow buttons to grow to fill space evenly
                          isMobile && 'flex-1 sm:flex-initial',
                        )}
                        aria-label={`Page ${page}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next button */}
            <Button
              type="button"
              variant={buttonVariant}
              size={size}
              onClick={handleNext}
              disabled={!canGoNext || isLoading}
              className="rounded-lg shrink-0"
              aria-label={`Go to next page (page ${validatedCurrentPage + 1} of ${validatedTotalPages})`}
            >
              ›
            </Button>
          </div>
        </div>
      </div>

      {/* Right section: Page size selector (hidden on mobile) */}
      {useThreeSectionLayout && (
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {showPageSizeSelector && onPageSizeChange ? (
            <>
              <span className={clsx(sizeTextStyles[size], 'text-zinc-400')}>
                Show:
              </span>
              <InputSelect
                value={validatedPageSize}
                onChange={handlePageSizeChange}
                options={pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS}
                variant={inputSelectVariant}
                size={size}
                className="w-16"
                disabled={isLoading}
              />
            </>
          ) : (
            // Invisible placeholder to maintain centered navigation on desktop
            <div className="invisible" aria-hidden="true">
              <span className={clsx(sizeTextStyles[size], 'text-zinc-400')}>
                Show:
              </span>
              <div className="w-20 h-8" />
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
