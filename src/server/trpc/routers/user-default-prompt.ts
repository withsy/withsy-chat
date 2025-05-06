import * as UserDefaultPrompt from "@/types/user-default-prompt";
import { publicProcedure, t } from "../server";

export const userDefaultPromptRouter = t.router({
  get: publicProcedure
    .output(UserDefaultPrompt.GetOutput)
    .query((opts) =>
      opts.ctx.service.userDefaultPrompt
        .get(opts.ctx.userId)
        .then((x) => UserDefaultPrompt.GetOutput.parse(x))
    ),
  update: publicProcedure
    .input(UserDefaultPrompt.Update)
    .output(UserDefaultPrompt.Data)
    .mutation((opts) =>
      opts.ctx.service.userDefaultPrompt
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserDefaultPrompt.Data.parse(x))
    ),
});
