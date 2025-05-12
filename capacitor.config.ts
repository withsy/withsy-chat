import type { CapacitorConfig } from "@capacitor/cli";

// capacitor.config.ts
const config: CapacitorConfig = {
  appId: "chat.withsy.app",
  appName: "Withsy",
  webDir: "out",
  server: {
    url: "https://withsy.chat",
    cleartext: true,
  },
};

export default config;
