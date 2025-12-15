import { Module } from "@nestjs/common";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserTrpcRouter } from "./user.trpc-router";

@Module({
  imports: [TrpcModule],
  providers: [UserTrpcRouter],
  exports: [UserTrpcRouter],
})
export class UserModule {}
