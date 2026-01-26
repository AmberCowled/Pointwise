import Container from "@pointwise/app/components/ui/Container";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import clsx from "clsx";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface TaskDescriptionProps {
	description: string | null | undefined;
	className?: string;
	/**
	 * Force single-line display regardless of content length
	 * @default false
	 */
	compact?: boolean;
}

export default function TaskDescription({
	description,
	className,
	compact = false,
}: TaskDescriptionProps) {
	const markdownComponents: Components = {
		p: ({ children }) => (
			<p className="mb-2 last:mb-0 text-zinc-200 leading-relaxed">{children}</p>
		),
		ul: ({ children }) => (
			<ul className="list-disc pl-4 mb-2 text-zinc-200">{children}</ul>
		),
		ol: ({ children }) => (
			<ol className="list-decimal pl-4 mb-2 text-zinc-200">{children}</ol>
		),
		li: ({ children }) => <li className="mb-1 text-zinc-200">{children}</li>,
		code: ({ children }) => (
			<code className="bg-zinc-800 px-1 py-0.5 rounded text-sm font-mono text-zinc-100">
				{children}
			</code>
		),
		pre: ({ children }) => (
			<pre className="bg-zinc-800 p-2 rounded overflow-x-auto mb-2 text-zinc-100">
				{children}
			</pre>
		),
		strong: ({ children }) => (
			<strong className="font-semibold text-zinc-100">{children}</strong>
		),
		em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
		h1: ({ children }) => (
			<h1 className="text-lg font-bold mb-2 text-zinc-100">{children}</h1>
		),
		h2: ({ children }) => (
			<h2 className="text-base font-bold mb-2 text-zinc-100">{children}</h2>
		),
		h3: ({ children }) => (
			<h3 className="text-sm font-bold mb-1 text-zinc-100">{children}</h3>
		),
		blockquote: ({ children }) => (
			<blockquote className="border-l-4 border-zinc-600 pl-4 italic text-zinc-300 mb-2">
				{children}
			</blockquote>
		),
		a: ({ children, href }) => (
			<a
				href={href}
				className="text-blue-400 hover:text-blue-300 underline"
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
				<span className="block my-4 max-w-full">
					<Image
						src={src}
						alt={alt || ""}
						title={title}
						width={0}
						height={0}
						sizes="100vw"
						style={{ width: "100%", height: "auto" }}
						className="rounded border border-zinc-600"
						unoptimized={
							src.startsWith("http://localhost") || src.startsWith("/")
						}
					/>
				</span>
			);
		},
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
			className={clsx(className, "items-start justify-start pt-3")}
		>
			<div
				className={clsx(
					"prose prose-sm prose-invert max-w-none",
					lineClampClass,
				)}
			>
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					components={markdownComponents}
				>
					{description}
				</ReactMarkdown>
			</div>
		</Container>
	);
}
