import { HttpServerError } from "@/server/error";
import {
  createNextPagesApiHandler,
  type Options,
} from "@/server/next-pages-api-handler";
import { UserAiProfileService } from "@/server/services/user-ai-profile";
import { UserUsageLimitService } from "@/server/services/user-usage-limit";
import { Model } from "@/types/model";
import { busboy } from "busboy-async";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import mime from "mime-types";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * @openapi
 * /api/ai-profiles:
 *   post:
 *     summary: Update AI profile
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 example: "gemini-2.0-flash"
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export default createNextPagesApiHandler({ post });

const Input = z.object({
  model: Model,
  name: z.optional(z.string()),
  imagePath: z.optional(z.string()),
});

async function post(opts: Options) {
  const { req, res, ctx } = opts;
  const { service, userId } = ctx;

  const idempotencyKey = req.headers["idempotency-key"];
  if (typeof idempotencyKey != "string" || idempotencyKey.length === 0)
    throw new HttpServerError(
      StatusCodes.BAD_REQUEST,
      "Idempotency-Key is required."
    );

  try {
    await service.idempotencyInfo.checkDuplicateRequest(idempotencyKey);
  } catch (_e) {
    throw new HttpServerError(
      StatusCodes.CONFLICT,
      getReasonPhrase(StatusCodes.CONFLICT)
    );
  }

  const stream = busboy(req, {
    allowedFileNames: ["image"],
    limits: {
      fields: 2,
      files: 1,
      fileSize: 1 * 1024 * 1024, // 1MB
    },
  });

  const inputRaw: Record<string, string> = {};
  for await (const event of stream) {
    if (event.type === "field") {
      if (event.name === "model") inputRaw["model"] = event.value;
      if (event.name === "name") inputRaw["name"] = event.value;
    }

    if (event.type === "file") {
      if (event.name === "image") {
        await UserUsageLimitService.checkAiProfileImage(service.db, {
          userId,
        });

        const { mimeType } = event.info;
        if (!mimeType.startsWith("image/"))
          throw new HttpServerError(
            StatusCodes.BAD_REQUEST,
            "Invalid file type."
          );

        const ext = mime.extension(mimeType);
        const uuid = uuidv7();
        const fileName = `${uuid}.${ext}`;
        const imagePath = UserAiProfileService.createImagePath({
          userId,
          fileName,
        });

        await service.aiProfileStorage.putStream({
          imagePath,
          contentType: mimeType,
          stream: event.stream,
        });

        inputRaw["imagePath"] = imagePath;
      }
    }
  }

  const inputRes = Input.safeParse(inputRaw);
  if (!inputRes.success) {
    throw new HttpServerError(StatusCodes.BAD_REQUEST, "Invalid input.", {
      details: {
        issues: inputRes.error.issues.map((x) => ({
          code: x.code,
          fatal: x.fatal ?? null,
          message: x.message,
          path: x.path,
        })),
      },
    });
  }

  const { model, name, imagePath } = inputRes.data;
  try {
    const data = await service.userAiProfile.update({
      userId,
      model,
      name,
      imagePath,
    });

    return res.status(200).json(data);
  } catch (e) {
    if (imagePath) await service.aiProfileStorage.delete({ imagePath });

    throw e;
  }
}
