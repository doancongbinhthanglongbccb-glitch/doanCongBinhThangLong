const mongoose = require("mongoose");
const logger = require("../utils/logger");

let connectionListenersRegistered = false;
let reconnectInProgress = false;
let activeMongoUri = "";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const reconnectInBackground = async () => {
  if (reconnectInProgress || !activeMongoUri) {
    return;
  }

  reconnectInProgress = true;
  let attempt = 0;

  while (true) {
    attempt += 1;
    const delayMs = Math.min(30000, 1000 * (2 ** Math.max(0, attempt - 1)));

    try {
      await mongoose.connect(activeMongoUri);
      logger.info({ action: "MONGO_RECONNECTED", attempt }, "MongoDB reconnected");
      reconnectInProgress = false;
      return;
    } catch (error) {
      logger.error(
        {
          action: "MONGO_RECONNECT_RETRY",
          attempt,
          delayMs,
          errorMessage: error.message,
        },
        "MongoDB reconnect attempt failed"
      );
      await delay(delayMs);
    }
  }
};

const registerConnectionGuards = () => {
  if (connectionListenersRegistered) {
    return;
  }

  connectionListenersRegistered = true;

  mongoose.connection.on("error", (error) => {
    logger.error({ action: "MONGO_CONNECTION_ERROR", errorMessage: error.message }, "MongoDB connection error");
    if (mongoose.connection.readyState !== 1) {
      void reconnectInBackground();
    }
  });

  mongoose.connection.on("disconnected", () => {
    logger.error({ action: "MONGO_DISCONNECTED" }, "MongoDB disconnected");
    void reconnectInBackground();
  });
};

const connectDB = async (mongoUri, options = {}) => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  activeMongoUri = mongoUri;

  const maxRetries = Number.isInteger(options.maxRetries) ? options.maxRetries : 5;
  const initialDelayMs = Number.isInteger(options.initialDelayMs) ? options.initialDelayMs : 1000;

  registerConnectionGuards();

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri);
      logger.info({ action: "MONGO_CONNECTED", attempt }, "MongoDB connected");
      return;
    } catch (error) {
      lastError = error;
      const delayMs = initialDelayMs * (2 ** (attempt - 1));

      logger.error(
        {
          action: "MONGO_CONNECTION_RETRY",
          attempt,
          maxRetries,
          delayMs,
          errorMessage: error.message,
        },
        "MongoDB connection attempt failed"
      );

      if (attempt < maxRetries) {
        await delay(delayMs);
      }
    }
  }

  logger.error(
    { action: "MONGO_CONNECTION_ERROR", errorMessage: lastError?.message || "Unknown MongoDB error" },
    "MongoDB connection error"
  );
  process.exit(1);
};

module.exports = connectDB;
