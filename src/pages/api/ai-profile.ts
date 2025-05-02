import { service } from "@/server/service-registry";
import { User } from "@/types";
import { Model } from "@/types/model";
import Busboy from "busboy";
import mime from "mime-types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { uuidv7 } from "uuidv7";
import { authOptions } from "./auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * @swagger
 * /api/ai-profile:
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
 *                 imageUrl:
 *                   type: string
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userSession = User.Session.parse(session);
  const userId = userSession.user.id;

  let maybeModel: string | undefined = undefined;
  let name: string | undefined = undefined;
  let imagePath: string | undefined = undefined;
  let uploadPromise: Promise<void> | undefined = undefined;

  const busboy = Busboy({ headers: req.headers });
  busboy
    .on("field", (fieldname, value) => {
      if (fieldname === "model") maybeModel = value;
      if (fieldname === "name") name = value;
    })
    .on("file", (fieldname, readable, info) => {
      if (fieldname === "image") {
        const { mimeType } = info;
        const ext = mime.extension(mimeType);
        const uuid = uuidv7();
        imagePath = `users/${userId}/ai-profiles/${uuid}.${ext}`;

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
