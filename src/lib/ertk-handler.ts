import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { Prisma } from "@prisma/client";
import { configureHandler } from "ertk/next";
import { getServerSession } from "next-auth";

export const createRouteHandler = configureHandler({
	auth: {
		getUser: async () => {
			const session = await getServerSession(authOptions);
			const email = session?.user?.email;
			if (!email) return null;

			const user = await prisma.user.findUnique({
				where: { email },
				select: { id: true, email: true, name: true, image: true },
			});

			if (!user?.email) return null;
			return {
				id: user.id,
				email: user.email,
				name: user.name,
				image: user.image,
			};
		},
	},
	errorHandlers: [
		(error) => {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				console.error("Prisma Error:", {
					code: error.code,
					meta: error.meta,
					message: error.message,
				});

				if (error.code === "P2002") {
					const field = (error.meta?.target as string[])?.[0] ?? "field";
					return Response.json(
						{ error: `${field} already exists` },
						{ status: 409 },
					);
				}

				if (error.code === "P2025") {
					return Response.json({ error: "Record not found" }, { status: 404 });
				}

				return Response.json(
					{ error: "Database operation failed" },
					{ status: 500 },
				);
			}

			if (error instanceof Prisma.PrismaClientValidationError) {
				console.error("Prisma Validation Error:", error.message);
				return Response.json(
					{ error: "Invalid data provided" },
					{ status: 400 },
				);
			}

			return null;
		},
	],
});
