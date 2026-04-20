const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { env } = require("../config/env");
const logger = require("../utils/logger");

const migrationsPath = path.join(__dirname, "..", "migrations");

const getAppliedMigrationIds = async () => {
  const collection = mongoose.connection.collection("schema_migrations");
  const applied = await collection.find({}, { projection: { _id: 0, id: 1 } }).toArray();
  return new Set(applied.map((entry) => entry.id));
};

const markMigrationApplied = async (id) => {
  await mongoose.connection.collection("schema_migrations").insertOne({
    id,
    appliedAt: new Date(),
  });
};

const run = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is required to run migrations");
  }

  await connectDB(env.MONGO_URI);

  const files = (await fs.readdir(migrationsPath)).filter((file) => file.endsWith(".js")).sort();
  const appliedIds = await getAppliedMigrationIds();

  for (const file of files) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const migration = require(path.join(migrationsPath, file));
    const migrationId = migration.id || file.replace(/\.js$/, "");

    if (appliedIds.has(migrationId)) {
      continue;
    }

    logger.info({ action: "MIGRATION_START", migrationId }, "Running migration");
    await migration.up();
    await markMigrationApplied(migrationId);
    logger.info({ action: "MIGRATION_COMPLETE", migrationId }, "Migration complete");
  }

  process.exit(0);
};

run().catch((error) => {
  logger.error({ action: "MIGRATION_FAILED", errorMessage: error.message }, "Migration failed");
  process.exit(1);
});