"use client";

import Input from "@pointwise/app/components/ui/Input";

/**
 * Props for the Search component
 */
export interface SearchProps {
  /**
   * Callback fired when search is submitted (Enter key or search button click)
   * @param query - The current search query text
   */
  onSearch?: (query: string) => void;
}

/**
 * Search - Combined search input and filter dropdown component
 *
 * **Props:**
 * - `onSearch?: (query: string) => void` - Callback fired when search is submitted (Enter key or search button click)
 *
 * @example
 * ```tsx
 * <Search
 *   onSearch={(query) => {
 *     console.log("Searching:", query);
 *     // Perform search logic here
 *   }}
 * />
 * ```
 *
 * @param {SearchProps} props - The props for the Search component.
 * @returns {JSX.Element} The rendered Search component.
 */
export default function Search({ onSearch }: SearchProps) {
  return (
    <Input
      size="sm"
      placeholder="Search..."
      flex="grow"
      showSearchButton
      onSearch={(value: string) => onSearch?.(value)}
    />
  );
}
