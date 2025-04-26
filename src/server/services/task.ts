import type { CronTask, TaskInput, TaskKey, TaskMap } from "@/types/task";
import { run, type Runner, type TaskList } from "graphile-worker";
import type { ServiceRegistry } from "../service-registry";

export class TaskService {
  private runner: Promise<Runner>;

  constructor(private readonly service: ServiceRegistry) {
    const taskMap: TaskMap = {
      model_route_send_message_to_ai: (input) =>
        service.modelRoute.onSendMessageToAiTask(input),
      message_cleanup_zombies: () => service.message.onCleanupZombiesTask(),
    };
    const cronTasks: CronTask[] = [
      { cron: "*/5 * * * *", key: "message_cleanup_zombies" },
    ];

    this.runner = (async () => {
      return await run({
        pgPool: service.pgPool,
        taskList: Object.fromEntries(
          Object.entries(taskMap).map(([key, handler]) => {
            const wrapper = async (input: any) => {
              try {
                await handler(input);
              } catch (e) {
                console.error(`Task error occurred. key: ${key} error:`, e);
              }
            };
            return [key, wrapper];
          })
        ) as TaskList,
        crontab: cronTasks.map(({ cron, key }) => `${cron} ${key}`).join("\n"),
      });
    })();
  }

  async add<K extends TaskKey>(key: K, input: TaskInput<K>) {
    const runner = await this.runner;
    await runner.addJob(key, input as any);
  }
}
