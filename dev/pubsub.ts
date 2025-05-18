import { spawnSync } from "node:child_process";

spawnSync(
  "docker",
  [
    "run",
    "--rm",
    "--name=withsy-chat-dev-pubsub",
    "-p",
    "8085:8085",
    "gcr.io/google.com/cloudsdktool/google-cloud-cli:522.0.0-emulators",
    "gcloud",
    "beta",
    "emulators",
    "pubsub",
    "start",
    "--project=withsy-chat-dev",
    "--host-port=0.0.0.0:8085",
  ],
  {
    stdio: "inherit",
  }
);
