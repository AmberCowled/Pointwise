import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
	project: "proj_tudweuwkvmddyxvcscty",
	dirs: ["./trigger"],
	maxDuration: 60,
	build: {
		extensions: [
			prismaExtension({
				mode: "legacy",
				schema: "prisma/schema.prisma",
			}),
		],
	},
});
