import { Module } from "@nestjs/common";
import { XaiService } from "./xai-service.js";

@Module({
  providers: [XaiService],
})
export class XaiModule {}
