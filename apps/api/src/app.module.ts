import { Module } from "@nestjs/common";
import { GracefulShutdownModule } from "@tygra/nestjs-graceful-shutdown";

@Module({
  imports: [GracefulShutdownModule.forRoot()],
})
export class AppModule {}
