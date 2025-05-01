import { Message } from "@/types";
import { z } from "zod";
import { publicProcedure, t } from "../server";

export const messageRouter = t.router({
  list: publicProcedure
    .input(Message.List)
    .output(z.array(Message.Data))
    .query((opts) =>
      opts.ctx.service.message
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => Message.Data.parse(x)))
    ),
  update: publicProcedure
    .input(Message.Update)
    .output(Message.Data)
    .mutation((opts) =>
      opts.ctx.service.message
        .update(opts.ctx.userId, opts.input)
        .then((x) => Message.Data.parse(x))
    ),
  send: publicProcedure
    .input(Message.Send)
    .output(Message.SendOutput)
    .mutation((opts) =>
      opts.ctx.service.message
        .send(opts.ctx.userId, opts.input)
        .then((x) => Message.SendOutput.parse(x))
    ),
});
