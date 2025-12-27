import { Module } from "@nestjs/common";
import { E8nService } from "./e8n-service.js";

@Module({
  providers: [E8nService],
  exports: [E8nService],
})
export class E8nModule {}
