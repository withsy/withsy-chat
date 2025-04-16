import type { CronTask, TaskInput, TaskKey, TaskMap } from "@/types/task";
import { run, type Runner, type TaskList } from "graphile-worker";
import type { ServiceRegistry } from "../service-registry";

export class TaskService {
  private runner: Promise<Runner>;

  constructor(private readonly service: ServiceRegistry) {
    const taskMap: TaskMap = {
      google_gen_ai_send_chat: (i) => service.googleGenAi.onSendChatTask(i),
      chat_message_cleanup_zombies: () =>
        service.chatMessage.onCleanupZombiesTask(),
    };
    const cronTasks: CronTask[] = [
      { cron: "*/5 * * * *", key: "chat_message_cleanup_zombies" },
    ];
    this.runner = (async () => {
      return await run({
        pgPool: service.pool,
        taskList: taskMap as TaskList,
        crontab: cronTasks.map(({ cron, key }) => `${cron} ${key}`).join("\n"),
      });
    })();
  }

  async add<K extends TaskKey>(key: K, input: TaskInput<K>) {
    const runner = await this.runner;
    return await runner.addJob(key, input as any);
  }
}
