import { Module } from "@nestjs/common";
import { GoogleGenAiService } from "./google-gen-ai-service.js";

@Module({
  providers: [GoogleGenAiService],
})
export class GoogleGenAiModule {}
