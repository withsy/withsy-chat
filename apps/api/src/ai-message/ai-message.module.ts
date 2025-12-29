import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { AiMessageService } from "./ai-message.service.js";

@Module({
  imports: [DbModule],
  providers: [AiMessageService],
  exports: [AiMessageService],
})
export class AiMessageModule {}
