const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const migrateUserRoles = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in environment variables");
  }

  await mongoose.connect(mongoUri);

  const result = await User.updateMany(
    {
      $or: [{ role: { $exists: false } }, { role: null }, { role: "" }],
    },
    {
      $set: { role: "editor" },
    },
  );

  console.log(`Migration completed. Updated users: ${result.modifiedCount}`);
  await mongoose.connection.close();
};

migrateUserRoles()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Role migration failed:", error.message);
    try {
      await mongoose.connection.close();
    } catch {
      // Ignore close errors.
    }
    process.exit(1);
  });
