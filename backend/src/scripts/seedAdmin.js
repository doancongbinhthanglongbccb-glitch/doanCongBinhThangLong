const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in environment variables");
  }

  if (!username || !password) {
    throw new Error("Missing ADMIN_USERNAME or ADMIN_PASSWORD in environment variables");
  }

  await mongoose.connect(mongoUri);

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    existingUser.password = password;
    existingUser.role = "admin";
    await existingUser.save();
    console.log(`Updated password for existing user: ${username}`);
  } else {
    await User.create({ username, password, role: "admin" });
    console.log(`Created admin user: ${username}`);
  }

  await mongoose.connection.close();
};

seedAdmin()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    try {
      await mongoose.connection.close();
    } catch {
      // Ignore close errors.
    }
    process.exit(1);
  });
