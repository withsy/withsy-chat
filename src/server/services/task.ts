import type { CronTask, TaskInput, TaskKey, TaskMap } from "@/types/task";
import type { ServiceRegistry } from "../service-registry";

export class TaskService {
  constructor(private readonly service: ServiceRegistry) {}

  async start() {
    const taskMap: TaskMap = {
      model_route_send_message_to_ai: (input) =>
        this.service.modelRoute.onSendMessageToAiTask(input),
      message_cleanup_zombies: () =>
        this.service.message.onCleanupZombiesTask(),
      message_chunk_hard_delete: () =>
        this.service.messageChunk.onHardDeleteTask(),
      chat_hard_delete: () => this.service.chat.onHardDeleteTask(),
      user_prompt_hard_delete: () => this.service.userPrompt.onHardDeleteTask(),
    };
    const cronTasks: CronTask[] = [
      { cron: "*/5 * * * *", key: "message_cleanup_zombies" },
      { cron: "0 0 * * *", key: "message_chunk_hard_delete" },
      { cron: "0 0 * * *", key: "chat_hard_delete" },
      { cron: "0 0 * * *", key: "user_prompt_hard_delete" },
    ];

    for (const [key, handler] of Object.entries(taskMap)) {
      const subscription = await this.service.pubsub.getSubscription({
        topicName: key,
        subscriptionName: "default",
      });
      subscription.on("message", async (message) => {
        try {
          await handler(JSON.parse(message.data.toString()));
          message.ack();
        } catch (_e) {
          message.nack();
        }
      });
    }
  }

  async add<K extends TaskKey>(key: K, input: TaskInput<K>) {
    await this.service.pubsub.publishMessage({ topicName: key, json: input });
  }
}
