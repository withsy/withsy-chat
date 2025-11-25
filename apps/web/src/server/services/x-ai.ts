import OpenAI from "openai";
import type { SendMessageToAiInput } from "./model-route";
import { OpenAiService } from "./open-ai";

const XAI_BASE_URL = "https://api.x.ai/v1";

export class XAiService {
  private openai: OpenAI;

  constructor() {
    const { XAI_API_KEY } = process.env;
    if (!XAI_API_KEY) {
      throw new Error("Invalid XAI_API_KEY.");
    }

    this.openai = new OpenAI({
      apiKey: XAI_API_KEY,
      baseURL: XAI_BASE_URL,
    });
  }

  async sendMessageToAi(input: SendMessageToAiInput) {
    return await OpenAiService.sendMessageToAi(this.openai, input);
  }
}
