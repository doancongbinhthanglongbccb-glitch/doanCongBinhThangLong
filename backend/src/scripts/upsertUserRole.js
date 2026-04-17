const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const VALID_ROLES = ["admin", "editor"];

const parseArgs = () => {
  const rawArgs = process.argv.slice(2);
  const result = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const token = rawArgs[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = rawArgs[index + 1];
    result[key] = value;
    index += 1;
  }

  return result;
};

const upsertUserRole = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in environment variables");
  }

  const args = parseArgs();
  const username = (args.username || "").trim();
  const password = args.password || "";
  const role = (args.role || "").trim().toLowerCase();

  if (!username || !password || !role) {
    throw new Error("Usage: --username <value> --password <value> --role <admin|editor>");
  }

  if (!VALID_ROLES.includes(role)) {
    throw new Error("Role must be one of: admin, editor");
  }

  await mongoose.connect(mongoUri);

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    existingUser.password = password;
    existingUser.role = role;
    await existingUser.save();
    console.log(`Updated user ${username} with role ${role}`);
  } else {
    await User.create({ username, password, role });
    console.log(`Created user ${username} with role ${role}`);
  }

  await mongoose.connection.close();
};

upsertUserRole()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Upsert user failed:", error.message);
    try {
      await mongoose.connection.close();
    } catch {
      // Ignore close errors.
    }
    process.exit(1);
  });
