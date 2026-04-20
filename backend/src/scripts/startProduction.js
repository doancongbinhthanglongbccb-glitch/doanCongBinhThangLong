const { spawn } = require("child_process");
const logger = require("../utils/logger");

const run = async () => {
  const migrate = spawn(process.execPath, ["src/scripts/migrateDatabase.js"], {
    stdio: "inherit",
    shell: false,
  });

  migrate.on("error", (error) => {
    logger.error({ action: "MIGRATION_PROCESS_ERROR", errorMessage: error.message }, "Migration process failed to start");
    process.exit(1);
  });

  migrate.on("exit", (code) => {
    if (code !== 0) {
      process.exit(code || 1);
      return;
    }

    const server = spawn(process.execPath, ["src/server.js"], {
      stdio: "inherit",
      shell: false,
    });

    server.on("error", (error) => {
      logger.error({ action: "SERVER_PROCESS_ERROR", errorMessage: error.message }, "Server process failed to start");
      process.exit(1);
    });

    server.on("exit", (serverCode) => {
      process.exit(serverCode || 0);
    });
  });
};

run();