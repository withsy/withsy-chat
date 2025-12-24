import { Injectable } from "@nestjs/common";
import { UserId } from "../user/user-schemas";
import { UserDefaultPromptTryGetOutput } from "./user-default-prompt-schemas";

@Injectable()
export class UserDefaultPromptService {
  async tryGet(userId: UserId): Promise<UserDefaultPromptTryGetOutput> {
    throw new Error();
  }
}
