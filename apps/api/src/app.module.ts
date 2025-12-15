import { Module } from "@nestjs/common";
import { GracefulShutdownModule } from "@tygra/nestjs-graceful-shutdown";
import { ConfigModule } from "./config/config.module";
import { DbModule } from "./db/db.module";

@Module({
  imports: [ConfigModule, GracefulShutdownModule.forRoot(), DbModule],
})
export class AppModule {}
