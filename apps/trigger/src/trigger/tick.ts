import { schedules } from "@trigger.dev/sdk";
import { createTrpcClient } from "../trpc-client";

export const tickEvery5minutesTask = schedules.task({
  id: "tick-every-5-minutes-task",
  cron: "*/5 * * * *",
  run: async () => {
    const trpcClient = createTrpcClient();
    await trpcClient.tick.tickEvery5minutes.mutate();
  },
});

export const tickDailyTask = schedules.task({
  id: "tick-daily-task",
  cron: "5 0 * * *",
  run: async () => {
    const trpcClient = createTrpcClient();
    await trpcClient.tick.tickDaily.mutate();
  },
});
