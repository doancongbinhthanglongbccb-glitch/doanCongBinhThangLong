const User = require("../models/User");
const logger = require("../utils/logger");

const ensureInitialAdminUser = async () => {
  const username = (process.env.ADMIN_USERNAME || "").trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required to seed the initial admin user");
  }

  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount > 0) {
    logger.info({ action: "ADMIN_SEED_SKIPPED", reason: "admin_already_exists" }, "Initial admin already exists");
    return;
  }

  const existingUser = await User.findOne({ username });
  if (existingUser && existingUser.role === "admin") {
    logger.info({ action: "ADMIN_SEED_SKIPPED", reason: "matching_admin_exists", username }, "Initial admin already exists");
    return;
  }

  if (existingUser && existingUser.role !== "admin") {
    existingUser.password = password;
    existingUser.role = "admin";
    await existingUser.save();
    logger.info({ action: "ADMIN_SEEDED", username, mode: "promoted_existing_user" }, "Initial admin user created");
    return;
  }

  await User.create({
    username,
    password,
    role: "admin",
  });

  logger.info({ action: "ADMIN_SEEDED", username, mode: "created" }, "Initial admin user created");
};

module.exports = {
  ensureInitialAdminUser,
};