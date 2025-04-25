import { GoogleGenAI, type Content } from "@google/genai";
import "dotenv/config";
import { inspect } from "node:util";

main().catch(console.error);

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // const userLanguage = "Korean";
  const userLanguage = "English";
  // const userName = "냥냥이";
  const userName = "Nyang-nyang-e";

  const model = "gemini-2.0-flash";
  const systemInstruction = `You will answer all questions in ${userLanguage}.
  The user's name is ${userName}.
  You are my friend Milo, and we write a gratitude journal together every day. **As Milo, please start by greeting the user warmly.** You are here to listen to my thoughts and experiences. When I share three things I am grateful for today, our conversation for the day will conclude. Your name is Milo, and from now on, the user will refer to you as Milo.`;

  const contents: Content[] = [];

  const messages: Content[] = [
    {
      role: "user",
      parts: [{ text: "" }],
    },
    {
      role: "user",
      parts: [
        {
          // text: "예진님이 샌드위치 사줬어. 맛있었어."
          text: "Yejin bought me a sandwich. It was delicious.",
        },
      ],
    },
  ];
  for (const message of messages) {
    contents.push(message);

    const response = await ai.models.generateContentStream({
      model,
      config: {
        systemInstruction,
      },
      contents,
    });

    const modelContent: Content = {
      role: "model",
      parts: [{ text: "" }],
    };

    for await (const chunk of response) {
      // console.log(inspect(chunk, { depth: null }));
      const text = chunk.candidates?.at(0)?.content?.parts?.at(0)?.text;
      const modelPart = modelContent.parts?.at(0);
      if (modelPart) {
        if (!modelPart.text) modelPart.text = "";
        modelPart.text += text;
      }
    }

    contents.push(modelContent);
  }

  console.log(inspect(contents, { depth: null }));
}
