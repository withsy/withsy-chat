import { parse } from "dotenv";
import { spawn } from "node:child_process";

const secretManagerEnv = process.env.SECRET_MANAGER_ENV;
if (!secretManagerEnv) {
  console.error("ERROR: Please set SECRET_MANAGER_ENV environment variable.");
  process.exit(1);
}

const command = process.argv.slice(2).join(" ");
const env = {
  ...process.env,
  ...parse(secretManagerEnv),
};

const controller = new AbortController();
const { signal } = controller;
const child = spawn(command, [], {
  shell: true,
  stdio: "inherit",
  env,
  signal,
});

child.on("error", (e) => {
  console.error("ERROR: server process error occurred. error:", e);
});

child.on("exit", (code, signal) => {
  if (code != null) process.exit(code);
  if (signal === "SIGTERM") process.exit(0);
  process.exit(1);
});

process.on("SIGTERM", (signal) => {
  child.kill(signal);
  const timeout60s = 60 * 1000;
  setTimeout(() => controller.abort(), timeout60s);
});
