import type AblyTypes from "ably";

let ablyClient: AblyTypes.Realtime | null = null;
let ablyPromise: Promise<AblyTypes.Realtime> | null = null;

export const getAblyClient = async () => {
	if (ablyClient) {
		return ablyClient;
	}
	if (typeof window === "undefined") {
		throw new Error("Ably client is only available in the browser");
	}
	if (!ablyPromise) {
		ablyPromise = import("ably").then((Ably) => {
			const client = new Ably.Realtime({
				authUrl: "/api/ably/token",
				authMethod: "POST",
			});
			ablyClient = client;
			return client;
		});
	}
	return ablyPromise;
};
