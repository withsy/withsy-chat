import { Module } from "@nestjs/common";
import { GracefulShutdownModule } from "@tygra/nestjs-graceful-shutdown";
import { ConfigModule } from "src/config/config.module";
import { DbModule } from "src/db/db.module";
import { ShutdownModule } from "src/shutdown/shutdown.module";
import { TrpcModule } from "src/trpc/trpc.module";

@Module({
  imports: [
    ConfigModule,
    GracefulShutdownModule.forRoot(),
    DbModule,
    ShutdownModule,
    TrpcModule,
  ],
})
export class AppModule {}
