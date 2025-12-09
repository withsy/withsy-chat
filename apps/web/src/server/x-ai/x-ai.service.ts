import { OpenAiService } from "../open-ai/open-ai.service";

const XAI_BASE_URL = "https://api.x.ai/v1";

export class XAiService extends OpenAiService {
  constructor() {
    const { XAI_API_KEY } = process.env;
    if (!XAI_API_KEY) {
      throw new Error("Invalid XAI_API_KEY.");
    }

    super({
      apiKey: XAI_API_KEY,
      baseURL: XAI_BASE_URL,
    });
  }
}
