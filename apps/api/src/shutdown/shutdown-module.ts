import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module";
import { ShutdownService } from "./shutdown-service";

@Module({
  imports: [DbModule],
  providers: [ShutdownService],
})
export class ShutdownModule {}
