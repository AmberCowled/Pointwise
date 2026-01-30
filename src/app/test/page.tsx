"use client";

import Container from "@pointwise/app/components/ui/Container";
import Page from "@pointwise/app/components/ui/Page";
import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect, useRef, useState } from "react";

type RealtimeMessage = {
	id: string;
	text: string;
	sentAt: string;
	sender?: string;
};
type AblyChannel = ReturnType<
	Awaited<ReturnType<typeof getAblyClient>>["channels"]["get"]
>;

const CHANNEL_NAME = "test:realtime";

export default function TestRealtimePage() {
	const [messages, setMessages] = useState<RealtimeMessage[]>([]);
	const [input, setInput] = useState("");
	const [status, setStatus] = useState("connecting");
	const [error, setError] = useState<string | null>(null);

	const channelRef = useRef<AblyChannel | null>(null);

	useEffect(() => {
		let isActive = true;
		let client: Awaited<ReturnType<typeof getAblyClient>> | null = null;

		const handleConnectionState = (stateChange: {
			current: string;
			reason?: { message?: string };
		}) => {
			setStatus(stateChange.current);
			if (stateChange.reason?.message) {
				setError(stateChange.reason.message);
			} else {
				setError(null);
			}
		};

		const handleMessage = (message: {
			id?: string;
			data?: unknown;
			timestamp?: number;
			clientId?: string;
		}) => {
			setMessages((prev) => [
				{
					id: message.id ?? `${Date.now()}`,
					text: String(message.data ?? ""),
					sentAt: new Date(
						message.timestamp ?? Date.now(),
					).toLocaleTimeString(),
					sender: message.clientId,
				},
				...prev,
			]);
		};

		const subscribe = async () => {
			try {
				client = await getAblyClient();
				if (!isActive) {
					return;
				}
				const nextChannel = client.channels.get(CHANNEL_NAME);
				channelRef.current = nextChannel;
				client.connection.on(handleConnectionState);
				nextChannel.subscribe(handleMessage);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to connect to Ably",
				);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			if (channelRef.current) {
				channelRef.current.unsubscribe(handleMessage);
			}
			if (client) {
				client.connection.off(handleConnectionState);
			}
		};
	}, []);

	const handlePublish = async () => {
		if (!input.trim()) {
			return;
		}
		try {
			if (!channelRef.current) {
				throw new Error("Channel not ready");
			}
			await channelRef.current.publish("message", input.trim());
			setInput("");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to publish message",
			);
		}
	};

	return (
		<Page width="full">
			<Container direction="vertical" gap="md" className="py-8 min-h-screen">
				<Container direction="vertical" gap="xs">
					<h1 className="text-xl font-semibold text-zinc-100">
						Realtime Friend Requests Demo
					</h1>
					<p className="text-sm text-zinc-400">
						This is a simple Ably chat window that mirrors how realtime data
						will update the UI.
					</p>
					<p className="text-sm text-zinc-400">
						Channel: <span className="text-zinc-200">{CHANNEL_NAME}</span>
					</p>
					<p className="text-sm text-zinc-400">
						Status: <span className="text-zinc-200">{status}</span>
					</p>
					{error && <p className="text-sm text-rose-400">Error: {error}</p>}
				</Container>

				<Container
					direction="vertical"
					gap="sm"
					className="flex-1 min-h-0 rounded-xl border border-zinc-800 bg-zinc-900/40"
				>
					<div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
						{messages.length === 0 && (
							<p className="text-sm text-zinc-500">
								No messages yet. Open this page in another tab to test.
							</p>
						)}
						{messages.map((msg, index) => (
							<div
								key={`${msg.id}-${msg.sentAt}-${index}`}
								className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200"
							>
								<div className="text-xs text-zinc-500">
									{msg.sentAt}
									{msg.sender ? ` • ${msg.sender}` : ""}
								</div>
								<div>{msg.text}</div>
							</div>
						))}
					</div>

					<div className="border-t border-zinc-800 px-4 py-3">
						<div className="flex gap-2">
							<input
								className="w-full rounded-md bg-zinc-900/60 border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
								placeholder="Type a message"
								value={input}
								onChange={(event) => setInput(event.target.value)}
							/>
							<button
								type="button"
								onClick={handlePublish}
								className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
							>
								Send
							</button>
						</div>
					</div>
				</Container>
			</Container>
		</Page>
	);
}
