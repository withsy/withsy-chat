import { Module } from "@nestjs/common";
import { XaiService } from "./xai-service.js";

@Module({
  providers: [XaiService],
  exports: [XaiService],
})
export class XaiModule {}
