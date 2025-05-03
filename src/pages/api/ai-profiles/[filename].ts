import { HttpServerError } from "@/server/error";
import {
  createNextPagesApiHandler,
  type Options,
} from "@/server/next-pages-api-handler";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { createImagePath } from ".";

export const config = {
  api: {
    bodyParser: false,
  },
};

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

  const imagePath = createImagePath({ userId, fileName });
  const file = service.firebase.bucket.file(imagePath);
  const [exists] = await file.exists();
  if (!exists)
    throw new HttpServerError(
      StatusCodes.NOT_FOUND,
      getReasonPhrase(StatusCodes.NOT_FOUND)
    );

  const [metadata] = await file.getMetadata();
  const contentType = metadata.contentType || "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
  res.setHeader("Cache-Control", `public, max-age=${365 * 24 * 60 * 60}`); // 1 years
  res.status(StatusCodes.OK);

  const readable = file.createReadStream();
  readable.on("error", (e) => {
    if (res.headersSent) {
      readable.destroy();
      res.end();
      console.error("Unexpected error occurred. error:", e);
      return;
    }

    throw e;
  });
  readable.on("end", () => res.end());
  readable.pipe(res);
}
