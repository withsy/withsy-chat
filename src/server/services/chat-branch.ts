import { ChatListOutout, ChatSelect } from "@/types/chat";
import type { ChatBranchList } from "@/types/chat-branch";
import type { UserId } from "@/types/id";
import type { Db } from "./db";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";

export class ChatBranchService {
  constructor(
    private readonly db: Db,
    private readonly chatMessageDecryptService: ChatMessageDecryptService
  ) {}

  async list(userId: UserId, input: ChatBranchList): Promise<ChatListOutout> {
    const { chatId } = input;

    const entities = await this.db.chat.findMany({
      where: { parentMessage: { chatId }, userId, deletedAt: null },
      select: ChatSelect,
    });

    const datas = entities.map((x) =>
      this.chatMessageDecryptService.decryptChat(x)
    );
    return datas;
  }
}
