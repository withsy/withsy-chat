import { NestFactory } from "@nestjs/core";
import { setupGracefulShutdown } from "@tygra/nestjs-graceful-shutdown";
import { AppModule } from "./app/app.module";
import { checkTimeZoneUtc } from "./utils";

async function bootstrap() {
  checkTimeZoneUtc();

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ["https://withsy-chat.vercel.app", "http://localhost:3000"],
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
    },
  });
  setupGracefulShutdown({ app });

  await app.listen(process.env.PORT ?? 3100);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
