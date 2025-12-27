import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface.js";
import { NestFactory } from "@nestjs/core";
import { setupGracefulShutdown } from "@tygra/nestjs-graceful-shutdown";
import { AppModule } from "./app/app-module.js";
import { ConfigService } from "./config/config-service.js";
import { checkTimeZoneUtc } from "./utils.js";

async function bootstrap() {
  checkTimeZoneUtc();

  const app = await NestFactory.create(AppModule);
  setupGracefulShutdown({ app });

  const configService = app.get(ConfigService);
  app.enableCors({
    origin:
      configService.nodeEnv === "production"
        ? "https://withsy-chat.vercel.app"
        : true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "X-Api-Key"],
    credentials: true,
  } satisfies CorsOptions);

  await app.listen(process.env.PORT ?? 3100);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
