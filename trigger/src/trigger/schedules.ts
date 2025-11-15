import { schedules } from "@trigger.dev/sdk";

function createUrl(procedure: string) {
  return `${process.env.NEXTAUTH_URL!}/api/trpc/trigger.${procedure}`;
}

export const messageCleanupZombiesTask = schedules.task({
  id: "message-cleanup-zombies",
  cron: "*/5 * * * *",
  run: async () => {
    await fetch(createUrl("messageCleanupZombies"), {
      method: "POST",
    });
  },
});

export const messageChunkHardDeleteTask = schedules.task({
  id: "message-chunk-hard-delete",
  cron: "0 0 * * *",
  run: async () => {
    await fetch(createUrl("messageChunkHardDelete"), {
      method: "POST",
    });
  },
});

export const chatHardDeleteTask = schedules.task({
  id: "chat-hard-delete",
  cron: "0 0 * * *",
  run: async () => {
    await fetch(createUrl("chatHardDelete"), {
      method: "POST",
    });
  },
});

export const userPromptHardDeleteTask = schedules.task({
  id: "user-prompt-hard-delete",
  cron: "0 0 * * *",
  run: async () => {
    await fetch(createUrl("userPromptHardDelete"), {
      method: "POST",
    });
  },
});
