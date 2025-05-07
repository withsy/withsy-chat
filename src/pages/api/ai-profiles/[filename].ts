import { HttpServerError } from "@/server/error";
import {
  createNextPagesApiHandler,
  type Options,
} from "@/server/next-pages-api-handler";
import { UserAiProfileService } from "@/server/services/user-ai-profile";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * @openapi
 * /api/ai-profiles/{filename}:
 *   get:
 *     summary: Download AI profile
 *     parameters:
 *       - name: filename
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *     responses:
 *       200:
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
export default createNextPagesApiHandler({ get });

async function get(opts: Options) {
  const { req, res, ctx } = opts;
  const { service, userId } = ctx;

  const fileName = req.query["filename"];
  if (typeof fileName !== "string" || fileName.length === 0)
    throw new HttpServerError(
      StatusCodes.BAD_REQUEST,
      getReasonPhrase(StatusCodes.BAD_REQUEST)
    );

  const imagePath = UserAiProfileService.createImagePath({ userId, fileName });
  const result = await service.aiProfileStorage.getStream({ imagePath });
  if (!result)
    throw new HttpServerError(
      StatusCodes.NOT_FOUND,
      getReasonPhrase(StatusCodes.NOT_FOUND)
    );

  const { stream, contentType } = result;
  res.setHeader("Content-Type", contentType || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
  res.setHeader("Cache-Control", `public, max-age=${365 * 24 * 60 * 60}`); // 1 years
  res.status(StatusCodes.OK);

  stream.on("error", (e) => {
    if (res.headersSent) {
      stream.destroy();
      res.end();
      console.error("Unexpected error occurred. error:", e);
      return;
    }

    throw e;
  });

  stream.on("end", () => res.end());
  stream.pipe(res);
}
