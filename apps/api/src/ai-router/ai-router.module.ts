import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { E8nModule } from "../e8n/e8n-module.js";
import { GoogleGenAiModule } from "../google-gen-ai/google-gen-ai-module.js";
import { XaiModule } from "../xai/xai-module.js";
import { AiRouterService } from "./ai-router.service.js";

@Module({
  imports: [DbModule, E8nModule, GoogleGenAiModule, XaiModule],
  providers: [AiRouterService],
  exports: [AiRouterService],
})
export class AiRouterModule {}
