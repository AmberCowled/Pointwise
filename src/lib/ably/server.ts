import Ably from "ably";

let restClient: Ably.Rest | null = null;

const getRestClient = () => {
	if (restClient) {
		return restClient;
	}
	const apiKey = process.env.ABLY_API_KEY;
	if (!apiKey) {
		return null;
	}
	restClient = new Ably.Rest({ key: apiKey });
	return restClient;
};

export const publishAblyEvent = async (
	channelName: string,
	eventName: string,
	payload: Record<string, unknown>,
	extras?: Record<string, unknown>,
) => {
	const client = getRestClient();
	if (!client) {
		return;
	}
	await client.channels.get(channelName).publish({
		name: eventName,
		data: payload,
		...(extras ? { extras } : {}),
	});
};
