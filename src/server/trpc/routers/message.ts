import { Message } from "@/types";
import { publicProcedure, t } from "../server";

export const messageRouter = t.router({
  get: publicProcedure
    .input(Message.Get)
    .output(Message.GetOutput)
    .query((opts) => opts.ctx.service.message.get(opts.ctx.userId, opts.input)),
  list: publicProcedure
    .input(Message.List)
    .output(Message.ListOutput)
    .query((opts) =>
      opts.ctx.service.message.list(opts.ctx.userId, opts.input)
    ),
  update: publicProcedure
    .input(Message.Update)
    .output(Message.Data)
    .mutation((opts) =>
      opts.ctx.service.message.update(opts.ctx.userId, opts.input)
    ),
  send: publicProcedure
    .input(Message.Send)
    .output(Message.SendOutput)
    .mutation((opts) =>
      opts.ctx.service.message.send(opts.ctx.userId, opts.input)
    ),
});
