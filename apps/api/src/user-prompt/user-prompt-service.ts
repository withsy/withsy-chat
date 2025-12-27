import { Injectable } from "@nestjs/common";
import { UserId } from "../user/user-schemas.js";
import {
  UserPromptData,
  UserPromptGet,
  UserPromptList,
  UserPromptListOutput,
} from "./user-prompt-schemas.js";

@Injectable()
export class UserPromptService {
  async list(
    userId: UserId,
    input: UserPromptList,
  ): Promise<UserPromptListOutput> {
    throw new Error();
  }

  async get(userId: UserId, input: UserPromptGet): Promise<UserPromptData> {
    throw new Error();
  }
}
