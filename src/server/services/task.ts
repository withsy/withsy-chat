import type { MessageId } from "@/types/id";
import type {
  CronTask,
  MessageChunkCreatedInput,
  TaskInput,
  TaskKey,
  TaskMap,
} from "@/types/task";
import type { ServiceRegistry } from "../service-registry";

export class TaskService {
  started: Promise<void>;

  constructor(private readonly service: ServiceRegistry) {
    this.started = this.start();
  }

  private async start() {
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
      await this.service.pubsub.subscribe({
        topicName: key,
        subscriptionName: "default",
        handler,
      });
    }
  }

  async publishTask<K extends TaskKey>(key: K, input: TaskInput<K>) {
    await this.started;
    await this.service.pubsub.publishMessage({ topicName: key, json: input });
  }

  async publishMessageChunkCreated(
    messageId: MessageId,
    input: MessageChunkCreatedInput
  ) {
    await this.started;
    await this.service.pubsub.publishMessage({
      topicName: this.createMessageChunkCreatedTopic(messageId),
      json: input,
    });
  }

  async subscribeMessageChunkCreated(input: {
    messageId: MessageId;
    handler: (input: MessageChunkCreatedInput) => void;
  }) {
    await this.started;
    const { messageId, handler } = input;
    return await this.service.pubsub.subscribe({
      topicName: this.createMessageChunkCreatedTopic(messageId),
      subscriptionName: "default",
      handler,
    });
  }

  createMessageChunkCreatedTopic(messageId: MessageId) {
    return `message_chunk_created-${messageId}`;
  }
}
