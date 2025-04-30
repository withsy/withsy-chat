import OpenAI from "openai";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";
import type { SendMessageToAiInput } from "./model-route";
import { OpenAiService } from "./open-ai";

const XAI_BASE_URL = "https://api.x.ai/v1";

export class XAiService {
  private openai: OpenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.openai = new OpenAI({
      apiKey: envConfig.xaiApiKey,
      baseURL: XAI_BASE_URL,
    });
  }

  async sendMessageToAi(input: SendMessageToAiInput) {
    return await OpenAiService.sendMessageToAi(this.openai, input);
  }
}
