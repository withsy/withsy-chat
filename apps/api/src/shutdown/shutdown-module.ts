import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { ShutdownService } from "./shutdown-service.js";

@Module({
  imports: [DbModule],
  providers: [ShutdownService],
})
export class ShutdownModule {}
