import Link from "next/link";

/**
 * Parameters for determining link vs button props
 */
interface LinkPropsParams {
	href?: string;
	onClick?: () => void;
}

/**
 * Determines whether to render as a Link or button and returns appropriate props
 *
 * - If `href` is provided, returns Next.js Link props
 * - Otherwise, returns button props with onClick handler
 *
 * @param params - Object with href and onClick
 * @returns Props object for either Link or button component
 */
export function getLinkProps({
	href,
	onClick,
}: LinkPropsParams):
	| { as: typeof Link; href: string }
	| { as: "button"; onClick?: () => void } {
	if (href) {
		return {
			as: Link,
			href,
		};
	}
	return {
		as: "button" as const,
		onClick,
	};
}

/**
 * Type guard to check if props are for a Link component
 * @param props - Props returned from getLinkProps
 * @returns True if props are for a Link
 */
export function isLinkProps(
	props: ReturnType<typeof getLinkProps>,
): props is { as: typeof Link; href: string } {
	return "href" in props && props.as === Link;
}

/**
 * Type guard to check if props are for a button element
 * @param props - Props returned from getLinkProps
 * @returns True if props are for a button
 */
export function isButtonProps(
	props: ReturnType<typeof getLinkProps>,
): props is { as: "button"; onClick?: () => void } {
	return props.as === "button";
}
