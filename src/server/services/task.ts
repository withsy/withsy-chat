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
      message_chunk_hard_delete: () => service.messageChunk.onHardDeleteTask(),
      chat_hard_delete: () => service.chat.onHardDeleteTask(),
      user_prompt_hard_delete: () => service.userPrompt.onHardDeleteTask(),
    };
    const cronTasks: CronTask[] = [
      { cron: "*/5 * * * *", key: "message_cleanup_zombies" },
      { cron: "0 0 * * *", key: "message_chunk_hard_delete" },
      { cron: "0 0 * * *", key: "chat_hard_delete" },
      { cron: "0 0 * * *", key: "user_prompt_hard_delete" },
    ];

    this.runner = (async () => {
      const runner = await run({
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

      const createOnError =
        (message: string) => (event: { error: unknown }) => {
          console.error(message, event.error);
        };

      const onJobError = createOnError("job:error");
      const onPoolListenError = createOnError("pool:listen:error");
      const onWorkerFatalError = createOnError("worker:fatalError");
      const onWorkerGetJobError = createOnError("worker:getJob:error");
      const onPoolForcefulShutdownError = createOnError(
        "pool:forcefulShutdown:error"
      );
      const onPoolGracefulShutdownError = createOnError(
        "pool:gracefulShutdown:error"
      );
      const onPoolGracefulShutdownWorkerError = createOnError(
        "pool:gracefulShutdown:workerError"
      );

      runner.events.on("job:error", onJobError);
      runner.events.on("pool:listen:error", onPoolListenError);
      runner.events.on("worker:fatalError", onWorkerFatalError);
      runner.events.on("worker:getJob:error", onWorkerGetJobError);
      runner.events.on(
        "pool:forcefulShutdown:error",
        onPoolForcefulShutdownError
      );
      runner.events.on(
        "pool:gracefulShutdown:error",
        onPoolGracefulShutdownError
      );
      runner.events.on(
        "pool:gracefulShutdown:workerError",
        onPoolGracefulShutdownWorkerError
      );

      process.on("SIGTERM", () => {
        runner.events.off("job:error", onJobError);
        runner.events.off("pool:listen:error", onPoolListenError);
        runner.events.off("worker:fatalError", onWorkerFatalError);
        runner.events.off("worker:getJob:error", onWorkerGetJobError);
        runner.events.off(
          "pool:forcefulShutdown:error",
          onPoolForcefulShutdownError
        );
        runner.events.off(
          "pool:gracefulShutdown:error",
          onPoolGracefulShutdownError
        );
        runner.events.off(
          "pool:gracefulShutdown:workerError",
          onPoolGracefulShutdownWorkerError
        );
      });

      return runner;
    })();
  }

  async waitUntilStart() {
    await this.runner;
  }

  async add<K extends TaskKey>(key: K, input: TaskInput<K>) {
    const runner = await this.runner;
    await runner.addJob(key, input as any);
  }
}
