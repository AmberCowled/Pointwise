/**
 * Fix CommentThread unique indexes to be sparse.
 *
 * MongoDB's default unique indexes treat missing/null values as duplicates,
 * meaning only ONE CommentThread can have a missing taskId or parentCommentId.
 * This breaks thread creation since base threads have no parentCommentId,
 * reply threads have no taskId, and post threads have neither.
 *
 * This script replaces the default unique indexes with sparse unique indexes,
 * which skip documents where the field is missing.
 *
 * Run with: node scripts/fix-comment-thread-indexes.mjs
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });

const uri = process.env.DATABASE_URL;

if (!uri) {
	console.error("DATABASE_URL environment variable is not set");
	process.exit(1);
}

const INDEXES_TO_FIX = [
	{
		field: "taskId",
		indexName: "CommentThread_taskId_key",
	},
	{
		field: "parentCommentId",
		indexName: "CommentThread_parentCommentId_key",
	},
];

async function fixIndexes() {
	const client = new MongoClient(uri);

	try {
		await client.connect();
		console.log("Connected to MongoDB");

		const db = client.db();
		const collection = db.collection("CommentThread");

		// Also clean up any existing documents with explicit null values
		// (convert them to unset so sparse index skips them)
		for (const { field, indexName } of INDEXES_TO_FIX) {
			console.log(`\nFixing index: ${indexName} (field: ${field})`);

			// Unset explicit nulls so sparse index ignores them
			const unsetResult = await collection.updateMany(
				{ [field]: null },
				{ $unset: { [field]: "" } },
			);
			if (unsetResult.modifiedCount > 0) {
				console.log(
					`  Cleaned ${unsetResult.modifiedCount} documents with null ${field}`,
				);
			}

			// Drop the existing non-sparse unique index
			try {
				await collection.dropIndex(indexName);
				console.log(`  Dropped existing index: ${indexName}`);
			} catch (err) {
				if (err.codeName === "IndexNotFound") {
					console.log(`  Index ${indexName} does not exist, skipping drop`);
				} else {
					throw err;
				}
			}

			// Create sparse unique index
			await collection.createIndex(
				{ [field]: 1 },
				{ unique: true, sparse: true, name: indexName },
			);
			console.log(`  Created sparse unique index: ${indexName}`);
		}

		console.log("\nAll indexes fixed successfully");
	} catch (error) {
		console.error("Error fixing indexes:", error);
		throw error;
	} finally {
		await client.close();
	}
}

fixIndexes()
	.then(() => process.exit(0))
	.catch(() => process.exit(1));
