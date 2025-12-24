import { Injectable } from "@nestjs/common";
import { UserId } from "../user/user-schemas";
import { UserPromptList, UserPromptListOutput } from "./user-prompt-schemas";

@Injectable()
export class UserPromptService {
  async list(
    userId: UserId,
    input: UserPromptList,
  ): Promise<UserPromptListOutput> {
    throw new Error();
  }
}
