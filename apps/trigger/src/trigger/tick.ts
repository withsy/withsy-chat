import { schedules } from "@trigger.dev/sdk";
import { createTrpcClient } from "../trpc-client";

export const tickMinuteTask = schedules.task({
  id: "tick-minute",
  cron: "* * * * *",
  run: async () => {
    const trpcClient = createTrpcClient();
    await trpcClient.tick.tickMinute.mutate();
  },
});

export const tickDailyTask = schedules.task({
  id: "tick-daily",
  cron: "1 0 * * *",
  run: async () => {
    const trpcClient = createTrpcClient();
    await trpcClient.tick.tickDaily.mutate();
  },
});

export const tickMonthlyTask = schedules.task({
  id: "tick-monthly",
  cron: "1 0 1 * *",
  run: async () => {
    const trpcClient = createTrpcClient();
    await trpcClient.tick.tickMonthly.mutate();
  },
});
