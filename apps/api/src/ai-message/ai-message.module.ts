import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { E8nModule } from "../e8n/e8n-module.js";
import { AiMessageService } from "./ai-message.service.js";

@Module({
  imports: [DbModule, E8nModule],
  providers: [AiMessageService],
  exports: [AiMessageService],
})
export class AiMessageModule {}
