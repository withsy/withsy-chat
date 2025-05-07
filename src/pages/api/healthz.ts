import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  // NOTE: Since the AWS service checks the server status with this endpoint,
  // you should not change the /api/healthz path.
  return res.status(200).send("ok");
}
