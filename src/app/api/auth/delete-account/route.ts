import { deleteUserAccount } from "@pointwise/lib/api/account-deletion";
import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function DELETE(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id || !session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { confirmEmail } = body;

		if (!confirmEmail) {
			return NextResponse.json(
				{ error: "Confirmation email is required" },
				{ status: 400 },
			);
		}

		// Verify the email matches
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { email: true },
		});

		if (
			!user?.email ||
			confirmEmail.toLowerCase() !== user.email.toLowerCase()
		) {
			return NextResponse.json(
				{ error: "Email does not match" },
				{ status: 400 },
			);
		}

		await deleteUserAccount(session.user.id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Delete account error:", error);
		return NextResponse.json(
			{ error: "Failed to delete account" },
			{ status: 500 },
		);
	}
}
