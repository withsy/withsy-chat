import type { ChatService } from "../chat/chat.service";
import type { MessageChunkService } from "../message-chunk/message-chunk.service";
import type { MessageService } from "../message/message.service";
import type { UserPromptService } from "../user-prompt/user-prompt.service";

interface Task {
  name: string;
  promise: Promise<void>;
}

export class TickService {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly messageChunkService: MessageChunkService,
    private readonly userPromptService: UserPromptService
  ) {}

  async tickEvery5minutes() {
    await this.#call([
      {
        name: "cleanupZombieMessages",
        promise: this.messageService.cleanupZombieMessages(),
      },
    ]);
  }

  async tickDaily() {
    await this.#call([
      {
        name: "hardDeleteMessageChunks",
        promise: this.messageChunkService.hardDeleteMessageChunks(),
      },
      {
        name: "hardDeleteChats",
        promise: this.chatService.hardDeleteChats(),
      },
      {
        name: "hardDeleteUserPrompts",
        promise: this.userPromptService.hardDeleteUserPrompts(),
      },
    ]);
  }

  async #call(tasks: Task[]) {
    const results = await Promise.allSettled(
      tasks.map(({ promise }) => promise)
    );

    for (let i = 0; i < results.length; ++i) {
      const result = results[i];
      if (result.status === "rejected") {
        console.error(`[${tasks[i].name}] task failed. error:`, result.reason);
      }
    }
  }
}
