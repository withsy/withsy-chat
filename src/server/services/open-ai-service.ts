import util from "node:util";
import OpenAI from "openai";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";

export class OpenAiService {
  private openai: OpenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.openai = new OpenAI({ apiKey: envConfig.openaiApiKey });
  }

  async test() {
    console.log("@@@ start");
    const stream = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "안녕, 오늘 날씨 어때?" },
      ],
    });
    for await (const chunk of stream) {
      console.log(util.inspect(chunk, { depth: null }));
    }
    console.log("@@@ done");
  }
}
