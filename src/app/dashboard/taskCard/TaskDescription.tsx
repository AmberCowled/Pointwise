import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import clsx from "clsx";
import Image from "next/image";
import {
	IoAlertCircleOutline,
	IoBulbOutline,
	IoFlameOutline,
	IoInformationCircleOutline,
	IoTriangleOutline,
} from "react-icons/io5";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

interface TaskDescriptionProps {
	description: string | null | undefined;
	className?: string;
	/**
	 * Force single-line display regardless of content length
	 * @default false
	 */
	compact?: boolean;
}

const ALERT_TYPES = {
	NOTE: {
		icon: IoInformationCircleOutline,
		color: "text-blue-400",
		border: "border-blue-500/50",
		bg: "bg-blue-500/5",
		label: "Note",
	},
	TIP: {
		icon: IoBulbOutline,
		color: "text-green-400",
		border: "border-green-500/50",
		bg: "bg-green-500/5",
		label: "Tip",
	},
	IMPORTANT: {
		icon: IoAlertCircleOutline,
		color: "text-indigo-400",
		border: "border-indigo-500/50",
		bg: "bg-indigo-500/5",
		label: "Important",
	},
	WARNING: {
		icon: IoTriangleOutline,
		color: "text-amber-400",
		border: "border-amber-500/50",
		bg: "bg-amber-500/5",
		label: "Warning",
	},
	CAUTION: {
		icon: IoFlameOutline,
		color: "text-rose-400",
		border: "border-rose-500/50",
		bg: "bg-rose-500/5",
		label: "Caution",
	},
};

export default function TaskDescription({
	description,
	className,
	compact = false,
}: TaskDescriptionProps) {
	const markdownComponents: Components = {
		p: ({ children }) => (
			<p
				className={`mb-4 last:mb-0 ${StyleTheme.Text.Body} leading-relaxed wrap-break-words`}
			>
				{children}
			</p>
		),
		ul: ({ children }) => (
			<ul className={`list-disc pl-5 mb-4 space-y-1 ${StyleTheme.Text.Body}`}>
				{children}
			</ul>
		),
		ol: ({ children }) => (
			<ol
				className={`list-decimal pl-5 mb-4 space-y-1 ${StyleTheme.Text.Body}`}
			>
				{children}
			</ol>
		),
		li: ({ children }) => (
			<li className={`${StyleTheme.Text.Body} marker:text-zinc-500`}>
				{children}
			</li>
		),
		// Custom checkbox handling for task lists
		input: ({ type, checked }) => {
			if (type === "checkbox") {
				return (
					<input
						type="checkbox"
						checked={checked}
						readOnly
						className="mr-2 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 disabled:opacity-100"
					/>
				);
			}
			return null;
		},
		code: ({
			inline,
			className,
			children,
		}: {
			inline?: boolean;
			className?: string;
			children?: React.ReactNode;
		}) => {
			const match = /language-(\w+)/.exec(className || "");
			const value = String(children).replace(/\n$/, "");

			if (!inline && match) {
				return <CodeBlock language={match[1]} value={value} />;
			}

			if (!inline) {
				return <CodeBlock language="text" value={value} />;
			}

			return (
				<code
					className={`bg-zinc-800/80 px-1.5 py-0.5 rounded text-[0.85em] font-mono text-indigo-300 border ${StyleTheme.Container.Border.Subtle}`}
				>
					{children}
				</code>
			);
		},
		pre: ({ children }) => <>{children}</>, // Wrapper handled by CodeBlock
		strong: ({ children }) => (
			<strong className="font-bold text-zinc-100">{children}</strong>
		),
		em: ({ children }) => (
			<em className={`italic ${StyleTheme.Text.Tertiary}`}>{children}</em>
		),
		h1: ({ children }) => (
			<h1
				className={`text-xl font-bold mb-4 mt-6 first:mt-0 text-white border-b ${StyleTheme.Container.Border.Dark} pb-2`}
			>
				{children}
			</h1>
		),
		h2: ({ children }) => (
			<h2 className="text-lg font-bold mb-3 mt-5 text-zinc-100 border-b border-zinc-800/50 pb-1">
				{children}
			</h2>
		),
		h3: ({ children }) => (
			<h3 className={`text-base font-bold mb-2 mt-4 ${StyleTheme.Text.Body}`}>
				{children}
			</h3>
		),
		blockquote: ({ children }) => {
			// GitHub Alert Detection
			const content = children?.toString() || "";
			const alertMatch = content.match(
				/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i,
			);

			if (alertMatch) {
				const type = alertMatch[1].toUpperCase() as keyof typeof ALERT_TYPES;
				const config = ALERT_TYPES[type];
				const Icon = config.icon;

				// Remove the [!TYPE] prefix from the first child if it's a string or has a string child
				// This is a bit tricky with React components as children
				// For now, we'll just style the whole block and the user will see the [!TYPE] if they don't hide it
				// But we can try to improve this if needed.

				return (
					<div
						className={clsx(
							"my-4 pl-4 pr-3 py-3 border-l-4 rounded-r-lg flex flex-col gap-1",
							config.border,
							config.bg,
						)}
					>
						<div
							className={clsx(
								"flex items-center gap-2 font-semibold text-sm",
								config.color,
							)}
						>
							<Icon className="w-4 h-4" />
							<span>{config.label}</span>
						</div>
						<div className={`${StyleTheme.Text.Tertiary} text-sm italic`}>
							{children}
						</div>
					</div>
				);
			}

			return (
				<blockquote className="border-l-4 border-zinc-700 pl-4 py-1 italic text-zinc-400 my-4 bg-zinc-900/30 rounded-r">
					{children}
				</blockquote>
			);
		},
		a: ({ children, href }) => (
			<a
				href={href}
				className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400 transition-all font-medium"
				target="_blank"
				rel="noopener noreferrer"
			>
				{children}
			</a>
		),
		img: ({ src, alt, title }) => {
			if (!src || typeof src !== "string" || src.trim() === "") {
				return (
					<span className="inline-block px-2 py-1 text-sm text-zinc-400 bg-zinc-800 rounded border border-zinc-600">
						[Image: {alt || "No alt text"}]
					</span>
				);
			}

			return (
				<span className="block my-6 max-w-full">
					<Image
						src={src}
						alt={alt || ""}
						title={title}
						width={0}
						height={0}
						sizes="100vw"
						style={{ width: "100%", height: "auto" }}
						className={`rounded-lg border ${StyleTheme.Container.Border.Subtle} shadow-lg shadow-black/20`}
						unoptimized
					/>
				</span>
			);
		},
		table: ({ children }) => (
			<div
				className={`my-6 overflow-x-auto rounded-lg border ${StyleTheme.Container.Border.Dark}`}
			>
				<table className="min-w-full divide-y divide-zinc-800 bg-zinc-900/20 text-sm">
					{children}
				</table>
			</div>
		),
		thead: ({ children }) => (
			<thead className="bg-zinc-800/50">{children}</thead>
		),
		th: ({ children }) => (
			<th className="px-4 py-2 text-left font-semibold text-zinc-100">
				{children}
			</th>
		),
		td: ({ children }) => (
			<td
				className={`px-4 py-2 ${StyleTheme.Text.Tertiary} border-t border-zinc-800/50`}
			>
				{children}
			</td>
		),
		hr: () => (
			<hr className={`my-8 border-t-2 ${StyleTheme.Container.Border.Dark}`} />
		),
	};

	if (!description?.trim()) {
		return (
			<TextPreview
				text={null}
				placeholder="No description provided"
				lines={compact ? 1 : 2}
				size="sm"
				className={className}
			/>
		);
	}

	const lineClampClass = compact ? "line-clamp-1" : undefined;

	return (
		<Container
			direction="vertical"
			width="full"
			gap="sm"
			className={clsx(
				className,
				"items-start justify-start pt-3 overflow-hidden",
			)}
		>
			<div
				className={clsx(
					"prose prose-sm prose-invert max-w-none w-full overflow-x-auto",
					lineClampClass,
				)}
			>
				<ReactMarkdown
					remarkPlugins={[remarkGfm, remarkGemoji, remarkBreaks]}
					components={markdownComponents}
				>
					{description}
				</ReactMarkdown>
			</div>
		</Container>
	);
}
