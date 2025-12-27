import { Injectable } from "@nestjs/common";
import { UserId } from "../user/user-schemas.js";
import { UserDefaultPromptTryGetOutput } from "./user-default-prompt-schemas.js";

@Injectable()
export class UserDefaultPromptService {
  async tryGet(userId: UserId): Promise<UserDefaultPromptTryGetOutput> {
    throw new Error();
  }
}
