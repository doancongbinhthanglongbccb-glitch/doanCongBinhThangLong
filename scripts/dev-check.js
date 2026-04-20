#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
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

const ok = (message) => print(`${COLOR.green}[OK]${COLOR.reset} ${message}`);
const info = (message) => print(`${COLOR.cyan}[INFO]${COLOR.reset} ${message}`);

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

const getRunningServices = () => {
  const result = runDocker(["compose", ...COMPOSE_ARGS, "ps", "--services", "--status", "running"]);
  if (result.status !== 0) {
    fail(
      "Cannot query docker compose dev services",
      result.stderr.trim() || "docker compose command failed",
      "Run `npm run dev:start` or `npm run dev:backend`, then retry `npm run dev:check`."
    );
  }

  return new Set(
    result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
};

const isPortInUseByNetstat = (port) => {
  const result = spawnSync("netstat", ["-ano"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    return false;
  }

  const lines = result.stdout.split(/\r?\n/);
  const portPattern = new RegExp(`:${port}\\s`, "i");

  return lines.some((line) => {
    const normalized = line.trim().replace(/\s+/g, " ");
    if (!normalized.startsWith("TCP ")) {
      return false;
    }

    return normalized.includes(" LISTENING ") && portPattern.test(normalized);
  });
};

const isPortInUse = (port) => {
  return new Promise((resolve) => {
    if (isPortInUseByNetstat(port)) {
      resolve(true);
      return;
    }

    const server = net.createServer();

    server.once("error", (error) => {
      if (error && error.code === "EADDRINUSE") {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close(() => resolve(false));
    });

    server.listen(port, "0.0.0.0");
  });
};

const httpGet = (url) => {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({ statusCode: response.statusCode || 0, headers: response.headers, body });
      });
    });

    request.setTimeout(5000, () => {
      request.destroy(new Error("Request timeout"));
    });

    request.on("error", reject);
  });
};

const detectMode = (services) => {
  const hasMongo = services.has("mongo");
  const hasBackend = services.has("backend");
  const hasFrontend = services.has("frontend");
  const hasNginx = services.has("nginx");

  if (hasMongo && hasBackend && hasFrontend && hasNginx) {
    return "mode-a";
  }

  if (hasMongo && hasBackend && !hasFrontend && !hasNginx) {
    return "mode-b";
  }

  return "unknown";
};

const checkRunningServices = async (httpPort, mode, services) => {
  const required = mode === "mode-a" ? ["mongo", "backend", "frontend", "nginx"] : ["mongo", "backend"];
  for (const service of required) {
    if (!services.has(service)) {
      if (service === "nginx") {
        const portInUse = await isPortInUse(httpPort);
        if (portInUse) {
          fail(
            "nginx container is not running",
            `DEV_HTTP_PORT ${httpPort} is already occupied on the host, so nginx could not bind the port.`,
            "Set DEV_HTTP_PORT=8081 (or 8082) in .env.dev, then run `npm run dev:start` again."
          );
        }
      }

      fail(
        `${service} container is not running`,
        `Service '${service}' is not up in the dev compose project.`,
        `Run \`npm run dev:start\` and inspect \`npm run dev:logs\` for ${service}.`
      );
    }
  }

  if (mode === "mode-a") {
    ok("Mode A detected: all required containers are running (mongo, backend, frontend, nginx)");
  } else {
    ok("Mode B detected: required containers are running (mongo, backend)");
  }
};

const checkMongoPing = () => {
  const result = runDocker([
    "compose",
    ...COMPOSE_ARGS,
    "exec",
    "-T",
    "mongo",
    "mongosh",
    "--quiet",
    "--eval",
    "db.adminCommand('ping').ok",
  ]);

  if (result.status !== 0 || !result.stdout.includes("1")) {
    fail(
      "Mongo ping failed",
      result.stderr.trim() || result.stdout.trim() || "MongoDB is not responding.",
      "Check `npm run dev:logs` and verify mongo healthcheck status with docker compose ps."
    );
  }

  ok("Mongo connected and responding to ping");
};

const checkBackendHealth = async (apiPort) => {
  try {
    const response = await httpGet(`http://localhost:${apiPort}/api/health`);
    if (response.statusCode !== 200) {
      fail(
        `Backend health endpoint returned ${response.statusCode}`,
        "Backend service is up but health endpoint is failing.",
        "Check backend logs with `npm run dev:logs` and verify Mongo connectivity."
      );
    }
    ok("Backend healthy (/api/health returned 200)");
  } catch (error) {
    fail(
      "Backend health endpoint timeout/unreachable",
      error.message,
      "Ensure backend container is healthy and DEV_API_PORT is correct in .env.dev."
    );
  }
};

const checkNginxAndFrontend = async (httpPort) => {
  try {
    const health = await httpGet(`http://localhost:${httpPort}/health`);
    if (health.statusCode !== 200) {
      fail(
        `Nginx health endpoint returned ${health.statusCode}`,
        "Nginx is reachable but unhealthy.",
        "Check nginx logs with `npm run dev:logs` and verify upstream dependencies."
      );
    }
    ok("Nginx reachable (/health returned 200)");
  } catch (error) {
    fail(
      "Nginx entrypoint unreachable",
      error.message,
      "Check DEV_HTTP_PORT in .env.dev and ensure no host process occupies that port."
    );
  }

  try {
    const root = await httpGet(`http://localhost:${httpPort}/`);
    const contentType = String(root.headers["content-type"] || "").toLowerCase();
    const isHtml = contentType.includes("text/html") || /<html|<!doctype html/i.test(root.body);

    if (root.statusCode !== 200 || !isHtml) {
      fail(
        "Frontend is not accessible through nginx root",
        `Unexpected response from '/': status=${root.statusCode}, content-type=${contentType || "unknown"}`,
        "Check frontend container health and nginx upstream proxy configuration."
      );
    }

    ok("Frontend accessible via nginx root route");
  } catch (error) {
    fail(
      "Frontend root check failed",
      error.message,
      "Check frontend service logs and confirm Vite container started successfully."
    );
  }
};

const main = async () => {
  const env = parseEnv();
  const httpPort = Number(env.DEV_HTTP_PORT || 8080);
  const apiPort = Number(env.DEV_API_PORT || 5005);
  const services = getRunningServices();
  const mode = detectMode(services);

  if (mode === "unknown") {
    fail(
      "Unable to determine dev mode",
      "Expected Mode A (mongo, backend, frontend, nginx) or Mode B (mongo, backend).",
      "Use `npm run dev:start` for Mode A or `npm run dev:backend` + `npm run dev:ui` for Mode B."
    );
  }

  info(`Running dev health checks (${mode.toUpperCase()}) on DEV_HTTP_PORT=${httpPort}, DEV_API_PORT=${apiPort}`);
  await checkRunningServices(httpPort, mode, services);
  checkMongoPing();
  await checkBackendHealth(apiPort);
  if (mode === "mode-a") {
    await checkNginxAndFrontend(httpPort);
  } else {
    info("Skipping nginx/frontend checks in Mode B (local Vite workflow)");
  }
  ok("All development health checks passed");
};

main().catch((error) => {
  fail(
    "Unexpected failure while executing dev checks",
    error.message,
    "Re-run with `npm run dev:check` after `npm run dev:start` and inspect logs."
  );
});
