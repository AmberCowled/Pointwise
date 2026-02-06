"use client";

import { LLMProvider } from "./LLMProvider";

export function LLMProviderWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	return <LLMProvider>{children}</LLMProvider>;
}
