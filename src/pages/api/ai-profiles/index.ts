import { HttpServerError } from "@/server/error";
import {
  createNextPagesApiHandler,
  type Options,
} from "@/server/next-pages-api-handler";
import { UserUsageLimitService } from "@/server/services/user-usage-limit";
import type { UserId } from "@/types/id";
import { Model } from "@/types/model";
import { busboy } from "@harryplusplus/busboy-async";
import { TRPCError } from "@trpc/server";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import mime from "mime-types";
import { uuidv7 } from "uuidv7";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

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
    limits: {
      fields: 2,
      files: 1,
      fileSize: MAX_FILE_SIZE,
    },
  });

  let model: Model | undefined = undefined;
  let name: string | undefined = undefined;
  let imagePath: string | undefined = undefined;

  for await (const event of stream) {
    if (event.type === "field") {
      if (event.name === "model") {
        const parseRes = Model.safeParse(event.value);
        if (!parseRes.success)
          return res.status(400).json({ error: "Invalid model" });
        model = parseRes.data;
      }

      if (event.name === "name") {
        name = event.value;
      }
    }

    if (event.type === "file") {
      if (event.name === "image") {
        try {
          await UserUsageLimitService.checkAiProfileImage(service.db, {
            userId,
          });
        } catch (e) {
          // TODO: TRPCError to HttpServerError
          if (e instanceof TRPCError && e.code === "TOO_MANY_REQUESTS") {
            return res
              .status(StatusCodes.TOO_MANY_REQUESTS)
              .json({ error: "AI Profile image usage limit exceeded." });
          }
        }

        const { mimeType } = event.info;
        if (!ALLOWED_MIME_TYPES.includes(mimeType))
          return res.status(400).json({ error: "Unsupported file type" });

        const ext = mime.extension(mimeType);
        const uuid = uuidv7();
        const fileName = `${uuid}.${ext}`;
        imagePath = createImagePath({ userId, fileName });

        const writable = service.firebase.bucket
          .file(imagePath)
          .createWriteStream({ metadata: { contentType: mimeType } });

        await new Promise<void>((resolve, reject) => {
          event.stream.pipe(writable).on("finish", resolve).on("error", reject);
        });

        await UserUsageLimitService.decreaseAiProfileImage(service.db, {
          userId,
        });
      } else {
        event.stream.resume();
      }
    }
  }

  if (!model) return res.status(400).json({ error: "Invalid model" });

  const data = await service.userAiProfile.update({
    userId,
    model,
    name,
    imagePath,
  });

  return res.status(200).json(data);
}

export function createImagePath(input: { userId: UserId; fileName: string }) {
  const { userId, fileName } = input;
  return `users/${userId}/ai-profiles/${fileName}`;
}
