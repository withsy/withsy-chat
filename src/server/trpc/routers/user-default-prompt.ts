import {
  UserDefaultPromptData,
  UserDefaultPromptGetOutput,
  UserDefaultPromptUpdate,
} from "@/types/user-default-prompt";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

export const userDefaultPromptRouter = t.router({
  get: publicProcedure.output(UserDefaultPromptGetOutput).query((opts) =>
    inject("userDefaultPromptService")
      .get(opts.ctx.userId)
      .then((x) => UserDefaultPromptGetOutput.parse(x))
  ),
  update: publicProcedure
    .input(UserDefaultPromptUpdate)
    .output(UserDefaultPromptData)
    .mutation((opts) =>
      inject("userDefaultPromptService")
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserDefaultPromptData.parse(x))
    ),
});
