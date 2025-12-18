"use client";

import InputSelectV2 from "@pointwise/app/components/ui/InputSelectV2";
import InputV2 from "@pointwise/app/components/ui/InputV2";
import { useState } from "react";

/**
 * Props for the Search component
 */
export interface SearchProps {
	/**
	 * Callback fired when search is submitted (Enter key or search button click)
	 * @param query - The current search query text
	 * @param filter - The currently selected filter option
	 */
	onSearch?: (query: string, filter: string) => void;
}

/**
 * Search - Combined search input and filter dropdown component
 *
 * **Props:**
 * - `onSearch?: (query: string, filter: string) => void` - Callback fired when search is submitted (Enter key or search button click)
 *
 * The component manages its own state for both the search query and filter selection.
 * The search input includes a search button that appears on the right side.
 * The filter dropdown automatically selects the first option ("Projects") on mount.
 *
 * @example
 * ```tsx
 * <Search
 *   onSearch={(query, filter) => {
 *     console.log("Searching:", query, "Filter:", filter);
 *     // Perform search logic here
 *   }}
 * />
 * ```
 *
 * @param {SearchProps} props - The props for the Search component.
 * @returns {JSX.Element} The rendered Search component.
 */
export default function Search({ onSearch }: SearchProps) {
	const [searchFilter, setSearchFilter] = useState("Projects");

	return (
		<>
			<InputV2
				size="sm"
				placeholder="Search..."
				flex="grow"
				showSearchButton
				onSearch={(value: string) => onSearch?.(value, searchFilter)}
			/>
			<InputSelectV2
				size="sm"
				options={["Projects", "Tasks", "People"]}
				flex="shrink"
				onSelect={(value: string) => setSearchFilter(value)}
			/>
		</>
	);
}
