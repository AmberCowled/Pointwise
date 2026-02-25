import Ably from "ably";
import Push from "ably/push";

let ablyClient: Ably.Realtime | null = null;

export const getAblyClient = async () => {
	if (ablyClient) {
		return ablyClient;
	}
	if (typeof window === "undefined") {
		throw new Error("Ably client is only available in the browser");
	}
	const client = new Ably.Realtime({
		authUrl: "/api/ably/token",
		authMethod: "POST",
		pushServiceWorkerUrl: "/service_worker.js",
		plugins: { Push },
	});
	ablyClient = client;
	return client;
};
