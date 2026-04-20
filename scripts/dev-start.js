#!/usr/bin/env node

const fs = require("fs");
const net = require("net");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
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

const runDocker = (args) => {
  return spawnSync("docker", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
};

const getListeningPidsByPort = (port) => {
  const result = spawnSync("netstat", ["-ano"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    return [];
  }

  const lines = result.stdout.split(/\r?\n/);
  const matches = [];

  for (const line of lines) {
    const normalized = line.trim().replace(/\s+/g, " ");
    if (!normalized.startsWith("TCP ")) {
      continue;
    }

    const parts = normalized.split(" ");
    if (parts.length < 5) {
      continue;
    }

    const localAddress = parts[1] || "";
    const state = parts[3] || "";
    const pid = parts[4] || "";

    if (state !== "LISTENING") {
      continue;
    }

    const addressParts = localAddress.split(":");
    const localPort = Number(addressParts[addressParts.length - 1]);
    if (localPort === port) {
      matches.push(pid);
    }
  }

  return Array.from(new Set(matches));
};

const isPortInUseByNetstat = (port) => {
  return getListeningPidsByPort(port).length > 0;
};

const isServiceRunning = (serviceName) => {
  const result = runDocker(["compose", ...COMPOSE_ARGS, "ps", "--services", "--status", "running"]);
  if (result.status !== 0) {
    return false;
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .includes(serviceName);
};

const canBindPort = (port) => {
  return new Promise((resolve) => {
    if (isPortInUseByNetstat(port)) {
      resolve(false);
      return;
    }

    const server = net.createServer();

    server.once("error", (error) => {
      if (error && error.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
};

const findSuggestedPort = async (preferredPort) => {
  const candidates = [preferredPort, 8080, 8081, 8082, 8083, 8084, 8085].filter(
    (value, index, all) => Number.isInteger(value) && value > 0 && all.indexOf(value) === index
  );

  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const available = await canBindPort(candidate);
    if (available) {
      return candidate;
    }
  }

  return null;
};

const runComposeUp = () => {
  const up = spawnSync("docker", ["compose", ...COMPOSE_ARGS, "up", "-d", "--build"], {
    cwd: ROOT,
    stdio: "inherit",
  });

  if (up.status !== 0) {
    process.exit(up.status || 1);
  }
};

const main = async () => {
  const env = parseEnv();
  const httpPort = Number(env.DEV_HTTP_PORT || 8080);
  const vitePort = 5173;

  info(`Preparing dev start with DEV_HTTP_PORT=${httpPort}`);

  const viteOwnerPids = getListeningPidsByPort(vitePort);
  if (viteOwnerPids.length > 0) {
    fail(
      `Detected active listener on port ${vitePort}`,
      `Mode B local UI likely running (PID(s): ${viteOwnerPids.join(", ")}). Mode A and Mode B are mutually exclusive.`,
      "Stop local Vite before `npm run dev:full`, or use `npm run dev:backend` + `npm run dev:ui` for Mode B."
    );
  }

  if (!isServiceRunning("nginx")) {
    const available = await canBindPort(httpPort);
    if (!available) {
      const suggestedPort = await findSuggestedPort(httpPort);
      const ownerPids = getListeningPidsByPort(httpPort);
      const ownerHint = ownerPids.length > 0 ? ` Current listener PID(s): ${ownerPids.join(", ")}.` : "";
      fail(
        `Port ${httpPort} is already in use`,
        `Another process or reserved range is occupying the dev nginx port.${ownerHint}`,
        suggestedPort
          ? `Set DEV_HTTP_PORT=${suggestedPort} in .env.dev, then rerun \`npm run dev:start\`.`
          : "Free one of ports 8080-8085 (or choose another free port) and rerun `npm run dev:start`."
      );
    }
  }

  runComposeUp();
  ok("Dev environment started successfully");
};

main().catch((error) => {
  fail(
    "Unexpected dev startup failure",
    error.message,
    "Check Docker Desktop status and run `npm run dev:logs` for details."
  );
});
