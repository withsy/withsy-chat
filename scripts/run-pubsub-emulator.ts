import { spawnSync } from "node:child_process";

spawnSync(
  "docker",
  [
    "run",
    "--rm",
    "-p",
    "8085:8085",
    "--name",
    "pubsub-emulator",
    "gcr.io/google.com/cloudsdktool/google-cloud-cli:522.0.0-emulators",
    "gcloud",
    "beta",
    "emulators",
    "pubsub",
    "start",
    "--project=withsy-chat-dev",
  ],
  {
    stdio: "inherit",
  }
);
