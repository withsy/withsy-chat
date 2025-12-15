import { Module } from "@nestjs/common";
import { GracefulShutdownModule } from "@tygra/nestjs-graceful-shutdown";
import { ConfigModule } from "src/config/config.module";
import { DbModule } from "src/db/db.module";
import { ShutdownOrchestrationModule } from "src/shutdown-orchestration/shutdown-orchestration.module";

@Module({
  imports: [
    ConfigModule,
    GracefulShutdownModule.forRoot(),
    DbModule,
    ShutdownOrchestrationModule,
  ],
})
export class AppModule {}
