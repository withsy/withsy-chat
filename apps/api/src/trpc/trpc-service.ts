import { Injectable } from "@nestjs/common";
import { initTRPC, TRPCErrorFormatter, TRPCErrorShape } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { Request } from "express";
import { DataError, getCodeKeyFromPrismaError } from "../error";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";

export interface Context {
  req: Request;
}

@Injectable()
export class TrpcService {
  readonly trpc;
  readonly publicProcedure;

  constructor() {
    this.trpc = initTRPC.context<Context>().create({
      errorFormatter: this.errorFormatter,
    });
    this.publicProcedure = this.trpc.procedure;
  }

  private errorFormatter: TRPCErrorFormatter<Context, TRPCErrorShape> = (
    opts,
  ) => {
    const { error, shape } = opts;
    const errorShape: TRPCErrorShape = shape;

    const { cause } = error;
    if (cause instanceof DataError) {
      errorShape.data = cause.data;
      return errorShape;
    }

    if (cause instanceof PrismaClientKnownRequestError) {
      const codeKey = getCodeKeyFromPrismaError(cause);
      errorShape.code = TRPC_ERROR_CODES_BY_KEY[codeKey];
      return errorShape;
    }

    return errorShape;
  };
}
