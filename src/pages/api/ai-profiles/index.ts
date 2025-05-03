import { HttpServerError } from "@/server/error";
import {
  createNextPagesApiHandler,
  type Options,
} from "@/server/next-pages-api-handler";
import type { UserId } from "@/types/id";
import { Model } from "@/types/model";
import Busboy from "busboy";
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
 *               properties:
 *                 name:
 *                   type: string
 *                 model:
 *                   type: string
 *                 imageSource:
 *                   type: string
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

  let maybeModel: string | undefined = undefined;
  let name: string | undefined = undefined;
  let imagePath: string | undefined = undefined;
  let uploadPromise: Promise<void> | undefined = undefined;

  const busboy = Busboy({
    headers: req.headers,
    limits: {
      fields: 2,
      files: 1,
      fileSize: MAX_FILE_SIZE,
    },
  });

  busboy
    .on("field", (fieldname, value) => {
      if (fieldname === "model") maybeModel = value;
      if (fieldname === "name") name = value;
    })
    .on("file", (fieldname, readable, info) => {
      if (fieldname === "image") {
        const { mimeType } = info;
        if (!ALLOWED_MIME_TYPES.includes(mimeType))
          return res.status(400).json({ error: "Unsupported file type" });

        const ext = mime.extension(mimeType);
        const uuid = uuidv7();
        const fileName = `${uuid}.${ext}`;
        imagePath = createImagePath({ userId, fileName });

        const writable = service.firebase.bucket
          .file(imagePath)
          .createWriteStream({ metadata: { contentType: mimeType } });

        uploadPromise = new Promise<void>((resolve, reject) => {
          readable.pipe(writable).on("finish", resolve).on("error", reject);
        });
      }
    });

  await new Promise<void>((resolve, reject) => {
    busboy
      .on("finish", async () => {
        try {
          if (uploadPromise) await uploadPromise;
          resolve();
        } catch (e) {
          reject(e);
        }
      })
      .on("error", reject);

    req.pipe(busboy);
  });

  if (!maybeModel) return res.status(400).json({ error: "Invalid model" });

  const parseRes = Model.safeParse(maybeModel);
  if (!parseRes.success)
    return res.status(400).json({ error: "Invalid model" });

  const model = parseRes.data;

  const userAiProfile = await service.userAiProfile.update({
    userId,
    model,
    name,
    imagePath,
  });

  return res.status(200).json(userAiProfile);
}

export function createImagePath(input: { userId: UserId; fileName: string }) {
  const { userId, fileName } = input;
  return `users/${userId}/ai-profiles/${fileName}`;
}
