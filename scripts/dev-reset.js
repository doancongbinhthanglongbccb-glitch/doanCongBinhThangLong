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

const fail = (message, details, suggestion) => {
  print(`${COLOR.red}[FAIL]${COLOR.reset} ${message}`);
  if (details) {
    print(`${COLOR.yellow}Details:${COLOR.reset} ${details}`);
  }
  if (suggestion) {
    print(`${COLOR.yellow}Suggested fix:${COLOR.reset} ${suggestion}`);
  }
  process.exit(1);
};

const run = (command, args, optional = false) => {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0 && !optional) {
    fail(
      `${command} ${args.join(" ")} failed`,
      result.stderr.trim() || result.stdout.trim(),
      "Inspect Docker daemon status and run the command manually for details."
    );
  }

  return result;
};

const removeByLabel = (kind, listArgs, removeCommand) => {
  const list = run("docker", listArgs, true);
  if (list.status !== 0) {
    return;
  }

  const ids = list.stdout
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    ok(`No leftover ${kind} found for project 'dev'`);
    return;
  }

  info(`Removing ${ids.length} leftover ${kind} for project 'dev'`);
  run("docker", [...removeCommand, ...ids], true);
  ok(`Removed leftover ${kind} for project 'dev'`);
};

const main = () => {
  info("Stopping dev stack and removing project-scoped resources");
  run("docker", ["compose", ...COMPOSE_ARGS, "down", "-v", "--remove-orphans"]);
  ok("docker compose down completed for project 'dev'");

  removeByLabel(
    "containers",
    ["ps", "-aq", "--filter", "label=com.docker.compose.project=dev"],
    ["rm", "-f"]
  );

  removeByLabel(
    "networks",
    ["network", "ls", "-q", "--filter", "label=com.docker.compose.project=dev"],
    ["network", "rm"]
  );

  removeByLabel(
    "volumes",
    ["volume", "ls", "-q", "--filter", "label=com.docker.compose.project=dev"],
    ["volume", "rm"]
  );

  ok("Safe dev environment reset complete (no unrelated Docker projects touched)");
};

main();
