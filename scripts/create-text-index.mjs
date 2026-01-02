/**
 * Script to create MongoDB text index for Project search
 * 
 * This script creates a text index on Project.name and Project.description
 * to enable case-insensitive full-text search.
 * 
 * Run with: node scripts/create-text-index.mjs
 */

import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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
    const collection = db.collection("Project");

    // Check if index already exists
    const indexes = await collection.listIndexes().toArray();
    const textIndexExists = indexes.some(
      (idx) => idx.name === "name_description_text",
    );

    if (textIndexExists) {
      console.log("⚠️  Text index 'name_description_text' already exists");
      console.log("   Skipping creation.");
      return;
    }

    // Create text index on name and description fields
    await collection.createIndex(
      {
        name: "text",
        description: "text",
      },
      {
        name: "name_description_text",
        default_language: "none", // Disable language-specific stemming
      },
    );

    console.log(
      "✅ Text index created successfully!",
    );
    console.log("   Index: name_description_text");
    console.log("   Fields: name, description");
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

