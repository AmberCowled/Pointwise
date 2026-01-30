import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@pointwise/lib/auth";
import Ably from "ably";

export async function POST() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const apiKey = process.env.ABLY_API_KEY;
	if (!apiKey) {
		return NextResponse.json({ error: "Ably API key missing" }, { status: 500 });
	}

	const client = new Ably.Rest({ key: apiKey });
	const tokenRequest = await client.auth.createTokenRequest({
		clientId: session.user.id,
	});

	return NextResponse.json(tokenRequest);
}
