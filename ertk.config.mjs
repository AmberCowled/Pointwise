import { defineConfig } from "ertk";

export default defineConfig({
	endpoints: "src/endpoints",
	generated: "src/generated",
	pathAlias: "@pointwise",
	baseUrl: "/api",
	routes: {
		dir: "src/app/api",
		handlerModule: "@pointwise/lib/ertk-handler",
		ignoredRoutes: ["auth", "uploadthing", "ably"],
	},
});
