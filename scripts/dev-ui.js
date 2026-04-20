#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT, "frontend");
const ENV_PATH = path.join(ROOT, ".env.dev");
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

const parseEnv = () => {
  const env = {};
  if (!fs.existsSync(ENV_PATH)) {
    return env;
  }

  const raw = fs.readFileSync(ENV_PATH, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
};

const runDocker = (args, stdio = "inherit") => {
  return spawnSync("docker", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio,
  });
};

const main = () => {
  const env = parseEnv();
  const apiPort = Number(env.DEV_API_PORT || 5005);

  info("Preparing Mode B (local Vite UI + docker backend/mongo)");

  const upBackend = runDocker(["compose", ...COMPOSE_ARGS, "up", "-d", "--build", "mongo", "backend"]);
  if (upBackend.status !== 0) {
    fail(
      "Cannot start backend/mongo for Mode B",
      "Docker compose failed to start required services.",
      "Run `npm run dev:backend` and inspect `npm run dev:logs` for errors."
    );
  }

  const stopModeA = runDocker(["compose", ...COMPOSE_ARGS, "stop", "frontend", "nginx"], "pipe");
  if (stopModeA.status === 0) {
    ok("Stopped docker frontend/nginx so Mode A and Mode B cannot run together");
  }

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const viteApiUrl = `http://localhost:${apiPort}`;

  info(`Starting local Vite on port 5173 with VITE_API_URL=${viteApiUrl}`);

  const ui = spawnSync(
    npmCommand,
    ["run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"],
    {
      cwd: FRONTEND_DIR,
      stdio: "inherit",
      env: {
        ...process.env,
        VITE_API_URL: viteApiUrl,
      },
    }
  );

  if (ui.status !== 0) {
    fail(
      "Local Vite dev server exited with error",
      "Port 5173 may be occupied or frontend dependencies are missing.",
      "Free port 5173 and retry `npm run dev:ui`."
    );
  }
};

main();
