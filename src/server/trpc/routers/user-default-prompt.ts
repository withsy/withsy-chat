import {
  UserDefaultPromptData,
  UserDefaultPromptGetOutput,
  UserDefaultPromptUpdate,
} from "@/types/user-default-prompt";
import { publicProcedure, t } from "../server";

export const userDefaultPromptRouter = t.router({
  get: publicProcedure
    .output(UserDefaultPromptGetOutput)
    .query((opts) =>
      opts.ctx.service.userDefaultPrompt
        .get(opts.ctx.userId)
        .then((x) => UserDefaultPromptGetOutput.parse(x))
    ),
  update: publicProcedure
    .input(UserDefaultPromptUpdate)
    .output(UserDefaultPromptData)
    .mutation((opts) =>
      opts.ctx.service.userDefaultPrompt
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserDefaultPromptData.parse(x))
    ),
});
