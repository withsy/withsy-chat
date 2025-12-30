import { Module } from "@nestjs/common";
import { ChatChunkModule } from "../chat-chunk/chat-chunk-module.js";
import { DbModule } from "../db/db-module.js";
import { E8nModule } from "../e8n/e8n-module.js";
import { GoogleGenAiModule } from "../google-gen-ai/google-gen-ai-module.js";
import { XaiModule } from "../xai/xai-module.js";
import { AiTextSenderService } from "./ai-text-sender.service.js";

@Module({
  imports: [DbModule, E8nModule, GoogleGenAiModule, XaiModule, ChatChunkModule],
  providers: [AiTextSenderService],
  exports: [AiTextSenderService],
})
export class AiTextSenderModule {}
