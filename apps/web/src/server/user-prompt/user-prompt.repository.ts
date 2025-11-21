import type { Tx } from "../services/db";
import { getHardDeleteCutoffDate } from "../utils";

export class UserPromptRepository {
  constructor(private readonly tx: Tx) {}

  async findUserPromptsToHardDelete() {
    const cutoffDate = getHardDeleteCutoffDate(new Date());
    return await this.tx.userPrompt.findMany({
      where: { deletedAt: { not: null, lt: cutoffDate } },
      select: { id: true },
    });
  }

  async hardDeleteUserPrompts(userPromptIds: string[]) {
    return await this.tx.userPrompt.deleteMany({
      where: { id: { in: userPromptIds } },
    });
  }
}
