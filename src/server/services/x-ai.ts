import OpenAI from "openai";
import type { SendMessageToAiInput } from "./model-route";
import { OpenAiService } from "./open-ai";

const XAI_BASE_URL = "https://api.x.ai/v1";

export class XAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: XAI_BASE_URL,
    });
  }

  async sendMessageToAi(input: SendMessageToAiInput) {
    return await OpenAiService.sendMessageToAi(this.openai, input);
  }
}
