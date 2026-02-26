import { authOptions } from "@pointwise/lib/auth";
import Ably from "ably";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const apiKey = process.env.ABLY_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "Ably API key missing" },
			{ status: 500 },
		);
	}

	const userId = session.user.id;
	const client = new Ably.Rest({ key: apiKey });
	const tokenRequest = await client.auth.createTokenRequest({
		clientId: userId,
		capability: {
			[`user:${userId}:*`]: ["subscribe", "publish", "push-subscribe"],
			"conversation:*": ["subscribe", "publish"],
			"task:*": ["subscribe", "publish"],
		},
	});

	return NextResponse.json(tokenRequest);
}
