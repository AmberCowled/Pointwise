/**
 * ERTK Codegen Script
 *
 * Reads endpoint definition files from src/endpoints/ and generates:
 * - src/generated/api.ts (RTK Query API + hooks)
 * - src/generated/store.ts (Redux store config)
 * - src/generated/invalidation.ts (cache invalidation helpers)
 * - src/app/api/.../route.ts (Next.js route handlers)
 */

import { Project, SyntaxKind } from "ts-morph";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const ENDPOINTS_DIR = path.join(ROOT, "src/endpoints");
const GENERATED_DIR = path.join(ROOT, "src/generated");
const APP_API_DIR = path.join(ROOT, "src/app/api");

// CRUD filenames that don't add URL segments
const CRUD_FILENAMES = new Set([
	"get",
	"list",
	"create",
	"send",
	"update",
	"delete",
	"remove",
	"cancel",
]);

interface ParsedEndpoint {
	name: string;
	method: string;
	filePath: string; // relative from src/endpoints
	importPath: string; // @pointwise/endpoints/...
	routePath: string; // /api/...
	isProtected: boolean;
	hasRequest: boolean;

	// For RTK Query generation (source text)
	responseType: string;
	responseTypeImport: string | null; // import path for response type
	argsType: string;
	argsTypeImport: string | null; // import path for args type
	queryFnSource: string;
	endpointType: "query" | "mutation";

	// Tags (source text)
	providesTagsSource: string | null;
	invalidatesTagsSource: string | null;

	// Optimistic updates (source text)
	optimisticSource: string | null;

	// Type imports needed
	typeImports: Map<string, Set<string>>; // import path -> type names
}

interface RouteGroup {
	routePath: string; // e.g., /api/tasks/[id]/like
	appRouteDir: string; // e.g., src/app/api/tasks/[id]/like
	methods: Map<string, ParsedEndpoint>; // HTTP method -> endpoint
}

// ─── AST Parsing ──────────────────────────────────────────────

function parseEndpointFile(
	project: Project,
	filePath: string,
): ParsedEndpoint | null {
	const absPath = path.join(ENDPOINTS_DIR, filePath);
	const sourceFile = project.addSourceFileAtPath(absPath);

	// Find the default export
	const defaultExport = sourceFile.getDefaultExportSymbol();
	if (!defaultExport) {
		console.warn(`No default export in ${filePath}, skipping`);
		return null;
	}

	// Find the endpoint.{method}(...) call
	const callExpressions = sourceFile.getDescendantsOfKind(
		SyntaxKind.CallExpression,
	);

	let endpointCall = null;
	let method = "";

	for (const call of callExpressions) {
		const expr = call.getExpression();
		if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
			const propAccess = expr.asKindOrThrow(
				SyntaxKind.PropertyAccessExpression,
			);
			const objectText = propAccess.getExpression().getText();
			const methodName = propAccess.getName();

			if (
				objectText === "endpoint" &&
				["get", "post", "put", "patch", "delete"].includes(methodName)
			) {
				endpointCall = call;
				method = methodName;
				break;
			}
		}
	}

	if (!endpointCall || !method) {
		console.warn(`No endpoint.{method}() call found in ${filePath}, skipping`);
		return null;
	}

	// Extract type arguments
	const typeArgs = endpointCall.getTypeArguments();
	const responseType = typeArgs[0]?.getText() ?? "unknown";
	const argsType = typeArgs[1]?.getText() ?? "void";

	// Extract config object
	const configArg = endpointCall.getArguments()[0];
	if (!configArg || configArg.getKind() !== SyntaxKind.ObjectLiteralExpression) {
		console.warn(`Config argument not found in ${filePath}, skipping`);
		return null;
	}

	const configObj = configArg.asKindOrThrow(
		SyntaxKind.ObjectLiteralExpression,
	);

	// Extract name
	const nameProp = configObj.getProperty("name");
	const name = nameProp
		? nameProp
				.asKindOrThrow(SyntaxKind.PropertyAssignment)
				.getInitializerOrThrow()
				.getText()
				.replace(/['"]/g, "")
		: "";

	if (!name) {
		console.warn(`No name property in ${filePath}, skipping`);
		return null;
	}

	// Extract protected
	const protectedProp = configObj.getProperty("protected");
	const isProtected = protectedProp
		? protectedProp
				.asKindOrThrow(SyntaxKind.PropertyAssignment)
				.getInitializerOrThrow()
				.getText() !== "false"
		: true;

	// Check for request schema
	const requestProp = configObj.getProperty("request");
	const hasRequest = !!requestProp;

	// Extract query function source
	const queryProp = configObj.getProperty("query");
	let queryFnSource = "";
	if (queryProp) {
		const init = queryProp
			.asKindOrThrow(SyntaxKind.PropertyAssignment)
			.getInitializerOrThrow();
		queryFnSource = init.getText();
	}

	// Extract tags
	let providesTagsSource: string | null = null;
	let invalidatesTagsSource: string | null = null;

	const tagsProp = configObj.getProperty("tags");
	if (tagsProp) {
		const tagsObj = tagsProp
			.asKindOrThrow(SyntaxKind.PropertyAssignment)
			.getInitializerOrThrow();

		if (tagsObj.getKind() === SyntaxKind.ObjectLiteralExpression) {
			const tagsObjLit = tagsObj.asKindOrThrow(
				SyntaxKind.ObjectLiteralExpression,
			);

			const providesProp = tagsObjLit.getProperty("provides");
			if (providesProp) {
				providesTagsSource = providesProp
					.asKindOrThrow(SyntaxKind.PropertyAssignment)
					.getInitializerOrThrow()
					.getText();
			}

			const invalidatesProp = tagsObjLit.getProperty("invalidates");
			if (invalidatesProp) {
				invalidatesTagsSource = invalidatesProp
					.asKindOrThrow(SyntaxKind.PropertyAssignment)
					.getInitializerOrThrow()
					.getText();
			}
		}
	}

	// Extract optimistic updates
	const optimisticProp = configObj.getProperty("optimistic");
	let optimisticSource: string | null = null;
	if (optimisticProp) {
		optimisticSource = optimisticProp
			.asKindOrThrow(SyntaxKind.PropertyAssignment)
			.getInitializerOrThrow()
			.getText();
	}

	// Derive route path from file path
	const routePath = deriveRoutePath(filePath);
	const endpointType = method === "get" ? "query" : "mutation";

	// Resolve type imports
	const typeImports = new Map<string, Set<string>>();
	let responseTypeImport: string | null = null;
	let argsTypeImport: string | null = null;

	// Find imports in the source file that contain our types
	for (const importDecl of sourceFile.getImportDeclarations()) {
		if (!importDecl.isTypeOnly()) {
			// Check named imports for type-only imports
			const namedImports = importDecl.getNamedImports();
			for (const named of namedImports) {
				const importName = named.getName();
				const moduleSpecifier = importDecl.getModuleSpecifierValue();

				// Convert relative import to @pointwise alias
				const aliasPath = resolveToAlias(moduleSpecifier, absPath);

				if (responseType.includes(importName)) {
					responseTypeImport = aliasPath;
					addToMapSet(typeImports, aliasPath, importName);
				}
				if (argsType.includes(importName)) {
					argsTypeImport = aliasPath;
					addToMapSet(typeImports, aliasPath, importName);
				}
			}
		}
		if (importDecl.isTypeOnly()) {
			const namedImports = importDecl.getNamedImports();
			for (const named of namedImports) {
				const importName = named.getName();
				const moduleSpecifier = importDecl.getModuleSpecifierValue();

				const aliasPath = resolveToAlias(moduleSpecifier, absPath);

				if (responseType.includes(importName)) {
					responseTypeImport = aliasPath;
					addToMapSet(typeImports, aliasPath, importName);
				}
				if (argsType.includes(importName)) {
					argsTypeImport = aliasPath;
					addToMapSet(typeImports, aliasPath, importName);
				}
			}
		}
	}

	// Build import path for endpoint file
	const importPath = `@pointwise/endpoints/${filePath.replace(/\.ts$/, "")}`;

	return {
		name,
		method,
		filePath,
		importPath,
		routePath,
		isProtected,
		hasRequest,
		responseType,
		responseTypeImport,
		argsType,
		argsTypeImport,
		queryFnSource,
		endpointType,
		providesTagsSource,
		invalidatesTagsSource,
		optimisticSource,
		typeImports,
	};
}

function resolveToAlias(moduleSpecifier: string, fromFile: string): string {
	if (moduleSpecifier.startsWith("@pointwise/")) {
		return moduleSpecifier;
	}
	// Resolve relative path to absolute, then convert to alias
	const dir = path.dirname(fromFile);
	const resolved = path.resolve(dir, moduleSpecifier);
	const srcDir = path.join(ROOT, "src");
	if (resolved.startsWith(srcDir)) {
		return `@pointwise/${path.relative(srcDir, resolved).replace(/\.ts$/, "")}`;
	}
	return moduleSpecifier;
}

function addToMapSet(
	map: Map<string, Set<string>>,
	key: string,
	value: string,
): void {
	if (!map.has(key)) {
		map.set(key, new Set());
	}
	map.get(key)!.add(value);
}

function deriveRoutePath(filePath: string): string {
	// e.g., task/get.ts → /tasks
	// e.g., task/[id]/like.ts → /tasks/[id]/like
	// e.g., task/[id]/comment/list.ts → /tasks/[id]/comments
	const parts = filePath.replace(/\.ts$/, "").split("/");
	const fileName = parts.pop()!;
	const segments: string[] = [];

	for (const part of parts) {
		// Use directory names as-is (directories should be named to match URL segments)
		segments.push(part);
	}

	// Add filename as segment only if it's not a CRUD name
	if (!CRUD_FILENAMES.has(fileName)) {
		segments.push(fileName);
	}

	return `/api/${segments.join("/")}`;
}

function pluralize(word: string): string {
	// Simple pluralization - handles the cases in this project
	if (word.endsWith("s")) return word;
	if (word.endsWith("y") && !word.endsWith("ay") && !word.endsWith("ey")) {
		return word.slice(0, -1) + "ies";
	}
	return word + "s";
}

// ─── Route Grouping ───────────────────────────────────────────

function groupEndpointsByRoute(
	endpoints: ParsedEndpoint[],
): Map<string, RouteGroup> {
	const groups = new Map<string, RouteGroup>();

	for (const ep of endpoints) {
		if (!groups.has(ep.routePath)) {
			// Convert route path to app directory
			// /api/tasks/[id]/like → src/app/api/tasks/[id]/like
			const appRouteDir = path.join(
				APP_API_DIR,
				ep.routePath.replace(/^\/api\//, ""),
			);
			groups.set(ep.routePath, {
				routePath: ep.routePath,
				appRouteDir,
				methods: new Map(),
			});
		}
		const httpMethod = ep.method.toUpperCase();
		groups.get(ep.routePath)!.methods.set(httpMethod, ep);
	}

	return groups;
}

// ─── Code Generation ──────────────────────────────────────────

function generateApiTs(endpoints: ParsedEndpoint[]): string {
	// Collect all type imports
	const allTypeImports = new Map<string, Set<string>>();
	for (const ep of endpoints) {
		for (const [importPath, types] of ep.typeImports) {
			if (!allTypeImports.has(importPath)) {
				allTypeImports.set(importPath, new Set());
			}
			for (const t of types) {
				allTypeImports.get(importPath)!.add(t);
			}
		}
	}

	// Collect all tag types used
	const tagTypes = new Set<string>();
	for (const ep of endpoints) {
		extractTagTypes(ep.providesTagsSource, tagTypes);
		extractTagTypes(ep.invalidatesTagsSource, tagTypes);
	}

	const lines: string[] = [];
	lines.push("// AUTO-GENERATED by ERTK codegen. Do not edit.");
	lines.push(
		'import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";',
	);

	// Add type imports
	for (const [importPath, types] of [...allTypeImports.entries()].sort()) {
		const typeList = [...types].sort().join(", ");
		lines.push(`import type { ${typeList} } from "${importPath}";`);
	}

	lines.push("");
	lines.push("export const api = createApi({");
	lines.push('\treducerPath: "api",');
	lines.push("\tbaseQuery: fetchBaseQuery({ baseUrl: \"/api\" }),");

	const tagTypesList = [...tagTypes].sort();
	lines.push(
		`\ttagTypes: [${tagTypesList.map((t) => `"${t}"`).join(", ")}],`,
	);
	lines.push("\trefetchOnFocus: false,");
	lines.push("\trefetchOnReconnect: true,");
	lines.push("\tendpoints: (builder) => ({");

	for (const ep of endpoints) {
		lines.push(...generateEndpointDef(ep));
	}

	lines.push("\t}),");
	lines.push("});");

	// Export hooks
	lines.push("");
	const hookExports: string[] = [];
	for (const ep of endpoints) {
		if (ep.endpointType === "query") {
			hookExports.push(
				`use${capitalize(ep.name)}Query`,
			);
		} else {
			hookExports.push(
				`use${capitalize(ep.name)}Mutation`,
			);
		}
	}

	// Split hook exports into multiple lines for readability
	lines.push("export const {");
	for (const hook of hookExports) {
		lines.push(`\t${hook},`);
	}
	lines.push("} = api;");

	return lines.join("\n") + "\n";
}

function generateEndpointDef(ep: ParsedEndpoint): string[] {
	const lines: string[] = [];
	const builderType =
		ep.endpointType === "query" ? "builder.query" : "builder.mutation";

	lines.push(
		`\t\t${ep.name}: ${builderType}<${ep.responseType}, ${ep.argsType}>({`,
	);

	// query function - strip /api prefix since baseUrl already includes it
	if (ep.queryFnSource) {
		const strippedQuery = stripApiPrefix(ep.queryFnSource);
		lines.push(`\t\t\tquery: ${strippedQuery},`);
	}

	// providesTags
	if (ep.providesTagsSource) {
		lines.push(`\t\t\tprovidesTags: ${ep.providesTagsSource},`);
	}

	// invalidatesTags
	if (ep.invalidatesTagsSource) {
		lines.push(`\t\t\tinvalidatesTags: ${ep.invalidatesTagsSource},`);
	}

	// Optimistic updates
	if (ep.optimisticSource) {
		const onQueryStarted = generateOnQueryStarted(ep);
		if (onQueryStarted) {
			lines.push(...onQueryStarted);
		}
	}

	lines.push("\t\t}),");

	return lines;
}

function generateOnQueryStarted(ep: ParsedEndpoint): string[] | null {
	if (!ep.optimisticSource) return null;

	const lines: string[] = [];

	// Determine if it's single or multi target
	const isSingle = ep.optimisticSource.includes("target:");
	const isMulti = ep.optimisticSource.includes("updates:");

	if (isSingle && !isMulti) {
		// Parse single optimistic: { target, args, update }
		const targetMatch = ep.optimisticSource.match(
			/target:\s*["'](\w+)["']/,
		);
		const argsMatch = ep.optimisticSource.match(
			/args:\s*((?:\([^)]*\)|\w+)\s*=>[\s\S]*?)(?=,\s*update:)/,
		);
		const updateMatch = ep.optimisticSource.match(
			/update:\s*((?:\([^)]*\)|\w+)\s*=>[\s\S]*?)(?=,?\s*}$)/,
		);

		if (targetMatch && argsMatch && updateMatch) {
			const target = targetMatch[1];
			const argsFn = argsMatch[1].trim();
			const updateFn = updateMatch[1].trim();

			lines.push(
				`\t\t\tasync onQueryStarted(params, { dispatch, queryFulfilled }) {`,
			);
			lines.push(
				`\t\t\t\tconst patchResult = dispatch(`,
			);
			lines.push(
				`\t\t\t\t\tapi.util.updateQueryData("${target}", (${argsFn})(params), (draft) => {`,
			);
			lines.push(`\t\t\t\t\t\t(${updateFn})(draft, params);`);
			lines.push(`\t\t\t\t\t}),`);
			lines.push(`\t\t\t\t);`);
			lines.push(`\t\t\t\ttry { await queryFulfilled; } catch { patchResult.undo(); }`);
			lines.push(`\t\t\t},`);
		}
	} else if (isMulti) {
		// Parse multi optimistic: { updates: [...] }
		// For multi-target, we embed the source more directly
		lines.push(
			`\t\t\tasync onQueryStarted(params, { dispatch, queryFulfilled }) {`,
		);
		lines.push(`\t\t\t\tconst patches: Array<{ undo: () => void }> = [];`);

		// Extract individual update blocks from the updates array
		const updatesContent = extractUpdatesArray(ep.optimisticSource);
		if (updatesContent) {
			for (const update of updatesContent) {
				const targetMatch = update.match(/target:\s*["'](\w+)["']/);
				const conditionMatch = update.match(
					/condition:\s*((?:\([^)]*\)|\w+)\s*=>[^,}]*)/,
				);
				const argsMatch = update.match(
					/args:\s*((?:\([^)]*\)|\w+)\s*=>[\s\S]*?)(?=,\s*(?:update|condition):)/,
				);
				const updateMatch = update.match(
					/update:\s*((?:\([^)]*\)|\w+)\s*=>[\s\S]*?)(?=,?\s*}$)/,
				);

				if (targetMatch && argsMatch && updateMatch) {
					const target = targetMatch[1];
					const argsFn = argsMatch[1].trim();
					const updateFn = updateMatch[1].trim();

					if (conditionMatch) {
						const conditionFn = conditionMatch[1].trim();
						lines.push(
							`\t\t\t\tif ((${conditionFn})(params)) {`,
						);
						lines.push(`\t\t\t\t\tpatches.push(`);
						lines.push(`\t\t\t\t\t\tdispatch(`);
						lines.push(
							`\t\t\t\t\t\t\tapi.util.updateQueryData("${target}", (${argsFn})(params), (draft) => {`,
						);
						lines.push(
							`\t\t\t\t\t\t\t\t(${updateFn})(draft, params);`,
						);
						lines.push(`\t\t\t\t\t\t\t}),`);
						lines.push(`\t\t\t\t\t\t),`);
						lines.push(`\t\t\t\t\t);`);
						lines.push(`\t\t\t\t}`);
					} else {
						lines.push(`\t\t\t\tpatches.push(`);
						lines.push(`\t\t\t\t\tdispatch(`);
						lines.push(
							`\t\t\t\t\t\tapi.util.updateQueryData("${target}", (${argsFn})(params), (draft) => {`,
						);
						lines.push(
							`\t\t\t\t\t\t\t(${updateFn})(draft, params);`,
						);
						lines.push(`\t\t\t\t\t\t}),`);
						lines.push(`\t\t\t\t\t),`);
						lines.push(`\t\t\t\t);`);
					}
				}
			}
		}

		lines.push(
			`\t\t\t\ttry { await queryFulfilled; } catch { for (const p of patches) p.undo(); }`,
		);
		lines.push(`\t\t\t},`);
	}

	return lines.length > 0 ? lines : null;
}

function extractUpdatesArray(source: string): string[] | null {
	// Find the updates array and split into individual update objects
	const match = source.match(/updates:\s*\[([\s\S]*)\]/);
	if (!match) return null;

	const content = match[1];
	const updates: string[] = [];
	let depth = 0;
	let current = "";

	for (const char of content) {
		if (char === "{") {
			depth++;
			current += char;
		} else if (char === "}") {
			depth--;
			current += char;
			if (depth === 0) {
				updates.push(current.trim());
				current = "";
			}
		} else if (depth > 0) {
			current += char;
		}
	}

	return updates.length > 0 ? updates : null;
}

function stripApiPrefix(querySource: string): string {
	// The query functions use paths starting with / but baseUrl is already /api
	// We need to strip /api prefix if present, or leave as-is for paths without it
	// Actually, looking at the existing services, they DON'T include /api in query paths
	// because baseUrl already has it. So we keep the query source as-is.
	return querySource;
}

function extractTagTypes(source: string | null, tags: Set<string>): void {
	if (!source) return;
	// Extract tag type strings from source like ["Tasks"] or [{ type: "Comments", id }]
	const matches = source.matchAll(/["'](\w+)["']/g);
	for (const m of matches) {
		// Only add if it looks like a valid tag type (starts with uppercase)
		if (m[1][0] === m[1][0].toUpperCase()) {
			tags.add(m[1]);
		}
	}
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateStoreTs(): string {
	return `// AUTO-GENERATED by ERTK codegen. Do not edit.
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";

export const store = configureStore({
\treducer: {
\t\t[api.reducerPath]: api.reducer,
\t},
\tmiddleware: (getDefaultMiddleware) =>
\t\tgetDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;
}

function generateInvalidationTs(): string {
	return `// AUTO-GENERATED by ERTK codegen. Do not edit.
import { api } from "./api";
import type { TagDescription } from "@pointwise/lib/ertk/types";

export function invalidateTags(tags: TagDescription[]) {
\treturn api.util.invalidateTags(tags);
}

export const updateQueryData = api.util.updateQueryData;
`;
}

function generateRouteFile(group: RouteGroup): string {
	const lines: string[] = [];
	lines.push("// AUTO-GENERATED by ERTK codegen. Do not edit.");

	// Collect all imports, then sort alphabetically by path
	const importLines: string[] = [];
	importLines.push(
		'import { createRouteHandler } from "@pointwise/lib/ertk/route-handler";',
	);

	for (const [_method, ep] of group.methods) {
		const varName = `${ep.name}Endpoint`;
		importLines.push(`import ${varName} from "${ep.importPath}";`);
	}

	// Sort by the module path (everything after "from ")
	importLines.sort((a, b) => {
		const pathA = a.match(/from "(.+)"/)?.[1] ?? "";
		const pathB = b.match(/from "(.+)"/)?.[1] ?? "";
		return pathA.localeCompare(pathB);
	});

	lines.push(...importLines);
	lines.push("");

	// Export HTTP method handlers
	for (const [method, ep] of group.methods) {
		const varName = `${ep.name}Endpoint`;
		lines.push(
			`export const ${method} = createRouteHandler(${varName});`,
		);
	}

	return lines.join("\n") + "\n";
}

// ─── Non-ERTK Routes (preserved) ─────────────────────────────

const NON_ERTK_ROUTES = new Set([
	"auth",
	"uploadthing",
	"ably",
	"llm",
]);

function isNonErtkRoute(routeDir: string): boolean {
	const relative = path.relative(APP_API_DIR, routeDir);
	const topLevel = relative.split(path.sep)[0];
	return NON_ERTK_ROUTES.has(topLevel);
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
	console.log("ERTK Codegen: Scanning endpoints...");

	// Find all endpoint files
	const allFiles = fs.readdirSync(ENDPOINTS_DIR, { recursive: true }) as string[];
	const endpointFiles = allFiles
		.filter((f) => f.endsWith(".ts"))
		.map((f) => f.replace(/\\/g, "/"))
		.sort();

	console.log(`Found ${endpointFiles.length} endpoint files`);

	// Parse all endpoint files
	const tsProject = new Project({
		tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
		skipAddingFilesFromTsConfig: true,
	});

	const endpoints: ParsedEndpoint[] = [];
	for (const file of endpointFiles) {
		const parsed = parseEndpointFile(tsProject, file);
		if (parsed) {
			endpoints.push(parsed);
			console.log(
				`  ${parsed.name} (${parsed.method.toUpperCase()} ${parsed.routePath})`,
			);
		}
	}

	console.log(`\nParsed ${endpoints.length} endpoints`);

	// Generate files
	fs.mkdirSync(GENERATED_DIR, { recursive: true });

	// 1. Generate api.ts
	const apiContent = generateApiTs(endpoints);
	fs.writeFileSync(path.join(GENERATED_DIR, "api.ts"), apiContent);
	console.log("Generated: src/generated/api.ts");

	// 2. Generate store.ts
	fs.writeFileSync(path.join(GENERATED_DIR, "store.ts"), generateStoreTs());
	console.log("Generated: src/generated/store.ts");

	// 3. Generate invalidation.ts
	fs.writeFileSync(
		path.join(GENERATED_DIR, "invalidation.ts"),
		generateInvalidationTs(),
	);
	console.log("Generated: src/generated/invalidation.ts");

	// 4. Generate route handlers
	const routeGroups = groupEndpointsByRoute(endpoints);
	let routeCount = 0;

	for (const [, group] of routeGroups) {
		// Skip non-ERTK routes
		if (isNonErtkRoute(group.appRouteDir)) continue;

		const routeContent = generateRouteFile(group);
		fs.mkdirSync(group.appRouteDir, { recursive: true });
		fs.writeFileSync(
			path.join(group.appRouteDir, "route.ts"),
			routeContent,
		);
		routeCount++;
	}

	console.log(`Generated: ${routeCount} route files`);
	console.log("\nERTK Codegen complete!");
}

main().catch((err) => {
	console.error("ERTK Codegen failed:", err);
	process.exit(1);
});
