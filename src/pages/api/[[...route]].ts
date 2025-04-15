import { restHandler } from "@/server/routers/rest";
import type { PageConfig } from "next";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export default restHandler;
