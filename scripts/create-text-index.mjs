/**
 * Script to create MongoDB text indexes for Project and User search
 *
 * This script creates text indexes on:
 * - Project.name and Project.description (for project search)
 * - User.name (for user search)
 *
 * These indexes enable case-insensitive full-text search.
 *
 * Run with: node scripts/create-text-index.mjs
 * Or via npm: pnpm db:create-text-index
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });

const uri = process.env.DATABASE_URL;

if (!uri) {
	console.error("❌ DATABASE_URL environment variable is not set");
	process.exit(1);
}

async function createTextIndex() {
	const client = new MongoClient(uri);

	try {
		await client.connect();
		console.log("✅ Connected to MongoDB");

		const db = client.db();

		// Create Project text index
		const projectCollection = db.collection("Project");
		const projectIndexes = await projectCollection.listIndexes().toArray();
		const projectTextIndexExists = projectIndexes.some(
			(idx) => idx.name === "name_description_text",
		);

		if (projectTextIndexExists) {
			console.log(
				"⚠️  Project text index 'name_description_text' already exists",
			);
			console.log("   Skipping creation.");
		} else {
			// Create text index on name and description fields
			await projectCollection.createIndex(
				{
					name: "text",
					description: "text",
				},
				{
					name: "name_description_text",
					default_language: "none", // Disable language-specific stemming
				},
			);

			console.log("✅ Project text index created successfully!");
			console.log("   Index: name_description_text");
			console.log("   Fields: name, description");
		}

		// Create User text index
		const userCollection = db.collection("User");
		const userIndexes = await userCollection.listIndexes().toArray();
		const userTextIndexExists = userIndexes.some(
			(idx) => idx.name === "name_text",
		);

		if (userTextIndexExists) {
			console.log("⚠️  User text index 'name_text' already exists");
			console.log("   Skipping creation.");
		} else {
			// Create text index on name field
			await userCollection.createIndex(
				{
					name: "text",
				},
				{
					name: "name_text",
					default_language: "none", // Disable language-specific stemming
				},
			);

			console.log("✅ User text index created successfully!");
			console.log("   Index: name_text");
			console.log("   Fields: name");
		}
	} catch (error) {
		console.error("❌ Error creating text index:", error);
		throw error;
	} finally {
		await client.close();
		console.log("✅ Disconnected from MongoDB");
	}
}

createTextIndex()
	.then(() => {
		console.log("\n✅ Script completed successfully");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n❌ Script failed:", error);
		process.exit(1);
	});
