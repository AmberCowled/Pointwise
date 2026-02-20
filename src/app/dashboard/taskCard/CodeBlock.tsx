"use client";

import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useState } from "react";
import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
	language?: string;
	value: string;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<div
			className={`relative group my-4 rounded-lg border ${StyleTheme.Container.Border.Subtle} max-w-full`}
		>
			<div
				className={`flex items-center justify-between px-4 py-1.5 bg-zinc-800/80 border-b ${StyleTheme.Container.Border.Subtle} text-xs text-zinc-400`}
			>
				<span>{language || "text"}</span>
				<button
					type="button"
					onClick={handleCopy}
					className={`flex items-center gap-1 ${StyleTheme.Hover.TextBrighten} transition-colors`}
					title="Copy to clipboard"
				>
					{copied ? (
						<>
							<IoCheckmarkOutline className="w-3.5 h-3.5 text-green-300" />
							<span className="text-green-300">Copied!</span>
						</>
					) : (
						<>
							<IoCopyOutline className="w-3.5 h-3.5" />
							<span>Copy</span>
						</>
					)}
				</button>
			</div>
			<div className="overflow-x-auto">
				<SyntaxHighlighter
					language={language || "text"}
					style={vscDarkPlus}
					customStyle={{
						margin: 0,
						padding: "1rem",
						fontSize: "0.875rem",
						background: "rgb(24 24 27 / 0.5)", // zinc-900/50
					}}
					codeTagProps={{
						style: {
							fontFamily:
								'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
						},
					}}
				>
					{value}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
