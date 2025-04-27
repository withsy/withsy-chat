import { UserDefaultPrompt } from "@/types";
import { publicProcedure, t } from "../server";

export const userDefaultPromptRouter = t.router({
  get: publicProcedure
    .output(UserDefaultPrompt.GetOutput)
    .query(async (opts) =>
      opts.ctx.service.userDefaultPrompt
        .get(opts.ctx.userId)
        .then((x) => UserDefaultPrompt.GetOutput.parse(x))
    ),
  update: publicProcedure
    .input(UserDefaultPrompt.Update)
    .output(UserDefaultPrompt.Data)
    .mutation(async (opts) =>
      opts.ctx.service.userDefaultPrompt
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserDefaultPrompt.Data.parse(x))
    ),
});
