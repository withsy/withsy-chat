import { defineConfig } from "@trigger.dev/sdk";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import dotenvx from "@dotenvx/dotenvx";
import { readFileSync } from "fs";

export default defineConfig({
  project: "proj_hpzyxktrjcjkcqicsrox",
  runtime: "node-22",
  maxDuration: 5 * 60,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1 * 1000,
      maxTimeoutInMs: 10 * 1000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
  build: {
    extensions: [
      syncEnvVars(async () => {
        const envContent = readFileSync(".env", "utf8");
        const parsed = dotenvx.parse(envContent);
        return parsed ?? {};
      }),
    ],
  },
});
