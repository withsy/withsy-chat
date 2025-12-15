import { Module } from "@nestjs/common";
import { ShutdownOrchestrationService } from "./shutdown-orchestration.service";

@Module({
  providers: [ShutdownOrchestrationService],
})
export class ShutdownOrchestrationModule {}
