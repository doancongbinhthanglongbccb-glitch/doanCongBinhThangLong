const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { env, assertRuntimeEnv } = require("./config/env");
const { app } = require("./app");
const logger = require("./utils/logger");
const { initSentry, captureException } = require("./utils/sentry");
const { ensureInitialAdminUser } = require("./services/initial-admin.service");

try {
  assertRuntimeEnv(env);
} catch (error) {
  logger.error(
    { action: "ENV_VALIDATION_FAILED", errorMessage: error.message },
    "Invalid runtime environment configuration"
  );
  process.exit(1);
}

initSentry(env);

const PORT = env.PORT;
let server;

const gracefulShutdown = async (signal) => {
  logger.info({ action: "SHUTDOWN_INITIATED", signal }, `Graceful shutdown started (${signal})`);

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info({ action: "SERVER_CLOSED" }, "HTTP server closed");

      try {
        await mongoose.disconnect();
        logger.info({ action: "DATABASE_CLOSED" }, "MongoDB connection closed");
      } catch (error) {
        logger.error(
          { action: "DATABASE_CLOSE_ERROR", errorMessage: error.message },
          "Error closing MongoDB connection"
        );
      }

      logger.info({ action: "SHUTDOWN_COMPLETE" }, "Graceful shutdown complete");
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error(
        { action: "FORCE_SHUTDOWN" },
        "Forcing shutdown after 30s grace period"
      );
      process.exit(1);
    }, 30000);
  }
};

const startServer = async () => {
  try {
    await connectDB(env.MONGO_URI);
    await ensureInitialAdminUser();

    server = app.listen(PORT, () => {
      logger.info({ action: "SERVER_STARTED", port: PORT }, "Server started");
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error(
        { action: "UNCAUGHT_EXCEPTION", errorMessage: error.message, errorStack: error.stack },
        "Uncaught exception"
      );
      captureException(error, { tags: { action: "UNCAUGHT_EXCEPTION" } });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error(
        {
          action: "UNHANDLED_REJECTION",
          reason: reason instanceof Error ? reason.message : String(reason),
          promise: String(promise),
        },
        "Unhandled promise rejection"
      );
      captureException(reason instanceof Error ? reason : new Error(String(reason)), {
        tags: { action: "UNHANDLED_REJECTION" },
      });
    });
  } catch (error) {
    captureException(error, { tags: { action: "SERVER_STARTUP_FAILURE" } });
    logger.error({ action: "SERVER_STARTUP_FAILURE", errorMessage: error.message }, "Server failed to start");
    process.exit(1);
  }
};

startServer();
