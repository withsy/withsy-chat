import { Module } from "@nestjs/common";
import { AiMessageService } from "./ai-message.service.js";

@Module({
  providers: [AiMessageService],
  exports: [AiMessageService],
})
export class AiMessageModule {}
