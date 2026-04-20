#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const COMPOSE_ARGS = ["--env-file", ".env.dev", "-f", "docker-compose.dev.yml", "-p", "dev"];

const COLOR = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

const print = (message) => {
  process.stdout.write(`${message}\n`);
};

const info = (message) => print(`${COLOR.cyan}[INFO]${COLOR.reset} ${message}`);
const ok = (message) => print(`${COLOR.green}[OK]${COLOR.reset} ${message}`);

const fail = (message, probableCause, suggestedFix) => {
  print(`${COLOR.red}[FAIL]${COLOR.reset} ${message}`);
  if (probableCause) {
    print(`${COLOR.yellow}Probable cause:${COLOR.reset} ${probableCause}`);
  }
  if (suggestedFix) {
    print(`${COLOR.yellow}Suggested fix:${COLOR.reset} ${suggestedFix}`);
  }
  process.exit(1);
};

const run = (args, stdio = "inherit") => {
  return spawnSync("docker", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio,
  });
};

const main = () => {
  info("Starting Mode B backend services (mongo + backend)");

  const up = run(["compose", ...COMPOSE_ARGS, "up", "-d", "--build", "mongo", "backend"]);
  if (up.status !== 0) {
    fail(
      "Failed to start backend mode services",
      "Docker compose could not start mongo/backend.",
      "Check Docker Desktop and rerun `npm run dev:backend`."
    );
  }

  const stopConflicting = run(["compose", ...COMPOSE_ARGS, "stop", "frontend", "nginx"], "pipe");
  if (stopConflicting.status !== 0) {
    info("frontend/nginx were not running, no conflict cleanup needed");
  } else {
    ok("Stopped docker frontend/nginx to enforce mode separation");
  }

  ok("Mode B backend is ready. Start local UI with `npm run dev:ui`.");
};

main();
