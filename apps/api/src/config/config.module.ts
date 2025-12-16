import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { EnvVars } from "./config-env-vars";
import { ConfigService } from "./config.service";

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (config) => EnvVars.parse(config),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
