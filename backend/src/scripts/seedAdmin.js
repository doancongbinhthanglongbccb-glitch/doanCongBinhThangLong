const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { ensureInitialAdminUser } = require("../services/initial-admin.service");
const logger = require("../utils/logger");

dotenv.config();

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in environment variables");
  }

  await mongoose.connect(mongoUri);
  await ensureInitialAdminUser();

  await mongoose.connection.close();
};

seedAdmin()
  .then(() => {
    logger.info({ action: "ADMIN_SEED_COMPLETE" }, "Seed completed successfully");
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error({ action: "ADMIN_SEED_FAILED", errorMessage: error.message }, "Seed failed");
    try {
      await mongoose.connection.close();
    } catch {
      // Ignore close errors.
    }
    process.exit(1);
  });
