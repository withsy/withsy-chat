import OpenAI from "openai";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";

export class OpenAiService {
  private openai: OpenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.openai = new OpenAI({ apiKey: envConfig.openaiApiKey });
  }
}
