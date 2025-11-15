import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  // NOTE: This is an endpoint called to check start up during deployment.
  // Please do not change the API path.
  return res.status(200).send("ok");
}
