import { Injectable, Logger } from "@nestjs/common";
import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { inspect } from "../utils.js";

@Injectable()
export class AiMessageService {
  readonly #logger = new Logger(AiMessageService.name);

  send(input: {
    userChatMessageId: ChatMessageId;
    modelChatMessageId: ChatMessageId;
  }): void {
    this.#send(input).catch((e) => {
      this.#logger.error(`Failed to send. ${inspect(e)}`);
    });
  }

  async #send(input: {
    userChatMessageId: ChatMessageId;
    modelChatMessageId: ChatMessageId;
  }): Promise<void> {}
}
