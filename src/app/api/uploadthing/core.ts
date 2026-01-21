import { authOptions } from "@pointwise/lib/auth";
import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
	profilePictureUploader: f({ image: { maxFileSize: "4MB" } })
		.middleware(async () => {
			const session = await getServerSession(authOptions);

			if (!session?.user?.id) {
				throw new UploadThingError("Unauthorized");
			}

			return { userId: session.user.id };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log("Upload complete for userId:", metadata.userId);
			console.log("file url", file.ufsUrl);
			return { uploadedBy: metadata.userId, url: file.ufsUrl };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
