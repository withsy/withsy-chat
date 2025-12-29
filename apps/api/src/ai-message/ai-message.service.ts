import { Injectable, Logger } from "@nestjs/common";
import { ChatMessageRepo } from "../chat-message/chat-message-repo.js";
import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { ChatRepo } from "../chat/chat-repo.js";
import { ChatId } from "../chat/chat-schemas.js";
import { DbService } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { UserDefaultPromptRepo } from "../user-default-prompt/user-default-prompt-repo.js";
import { UserPromptMapper } from "../user-prompt/user-prompt-mapper.js";
import { UserId } from "../user/user-schemas.js";
import { inspect } from "../utils.js";

interface AiMessageSend {
  userId: UserId;
  chatId: ChatId;
  userChatMessageId: ChatMessageId;
  modelChatMessageId: ChatMessageId;
}

@Injectable()
export class AiMessageService {
  readonly #logger = new Logger(AiMessageService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly e8nService: E8nService,
  ) {}

  send(input: AiMessageSend): void {
    this.#send(input).catch((e) => {
      this.#logger.error(`Failed to send. ${inspect(e)}`);
    });
  }

  async #send(input: AiMessageSend): Promise<void> {
    const { userId, chatId, userChatMessageId, modelChatMessageId } = input;

    await this.dbService.db.$transaction(async (tx) => {
      const chatMessageRepo = new ChatMessageRepo(tx);
      const modelChatMessage = await chatMessageRepo.tryTransitionStatus(
        userId,
        {
          chatId,
          chatMessageId: modelChatMessageId,
          expectedStatus: "pending",
          nextStatus: "processing",
        },
        {
          withChatPrompt: true,
        },
      );

      if (!modelChatMessage) {
        return;
      }

      const userChatMessage = await chatMessageRepo.get(userId, {
        chatId,
        chatMessageId: userChatMessageId,
      });

      const userDefaultPromptRepo = new UserDefaultPromptRepo(tx);
      const userDefaultPrompt = await userDefaultPromptRepo.tryGet(userId);

      const userPromptMapper = new UserPromptMapper(this.e8nService);
      const userDefaultPromptData = userDefaultPrompt?.userPrompt
        ? userPromptMapper.toData(userDefaultPrompt.userPrompt)
        : null;

      const chatUserPromptData = modelChatMessage.chat?.userPrompt
        ? userPromptMapper.toData(modelChatMessage.chat.userPrompt)
        : null;

      const prompt = [
        userDefaultPromptData?.text ?? "",
        chatUserPromptData?.text ?? "",
      ]
        .filter((x) => x)
        .join("\n");

      // TODO: list chat messages for history.
    });
  }
}
