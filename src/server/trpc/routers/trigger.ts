import { publicProcedure, t } from "../server";

export const triggerRouter = t.router({
  messageCleanupZombies: publicProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.messageService.onCleanupZombiesTask()
  ),
  messageChunkHardDelete: publicProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.messageChunkService.onHardDeleteTask()
  ),
  chatHardDelete: publicProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.chatTaskHandler.onHardDeleteTask()
  ),
  userPromptHardDelete: publicProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.userPromptService.onHardDeleteTask()
  ),
});
