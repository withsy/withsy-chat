import { NestFactory } from "@nestjs/core";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { setupGracefulShutdown } from "@tygra/nestjs-graceful-shutdown";
import type { Express } from "express";
import { AppModule } from "./app/app.module";
import { appRouter } from "./app/app.router";
import { checkTimeZoneUtc } from "./utils";

async function bootstrap() {
  checkTimeZoneUtc();

  const app = await NestFactory.create(AppModule);
  setupGracefulShutdown({ app });

  const express: Express = app.getHttpAdapter().getInstance();
  express.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
