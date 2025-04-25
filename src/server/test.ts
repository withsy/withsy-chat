import { trpc, trpcOptions } from "@/lib/trpc";
import { GoogleGenAI, type Content } from "@google/genai";
import { createTRPCClient, httpLink } from "@trpc/client";
import "dotenv/config";
import { inspect } from "node:util";
import superjson from "superjson";
import { type AppRouter } from "./trpc/routers/_app";

main().catch(console.error);

async function main() {
  // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  // // const userLanguage = "Korean";
  // const userLanguage = "English";
  // // const userName = "냥냥이";
  // const userName = "Nyang-nyang-e";
  // const model = "gemini-2.0-flash";
  // const systemInstruction = `You will answer all questions in ${userLanguage}.
  // The user's name is ${userName}.
  // You are my friend Milo, and we write a gratitude journal together every day. **As Milo, please start by greeting the user warmly.** You are here to listen to my thoughts and experiences. When I share three things I am grateful for today, our conversation for the day will conclude. Your name is Milo, and from now on, the user will refer to you as Milo.`;
  // const contents: Content[] = [];
  // const messages: Content[] = [
  //   {
  //     role: "user",
  //     parts: [{ text: "" }],
  //   },
  //   {
  //     role: "user",
  //     parts: [
  //       {
  //         // text: "예진님이 샌드위치 사줬어. 맛있었어."
  //         text: "Yejin bought me a sandwich. It was delicious.",
  //       },
  //     ],
  //   },
  // ];
  // for (const message of messages) {
  //   contents.push(message);
  //   const response = await ai.models.generateContentStream({
  //     model,
  //     config: {
  //       systemInstruction,
  //     },
  //     contents,
  //   });
  //   const modelContent: Content = {
  //     role: "model",
  //     parts: [{ text: "" }],
  //   };
  //   for await (const chunk of response) {
  //     // console.log(inspect(chunk, { depth: null }));
  //     const text = chunk.candidates?.at(0)?.content?.parts?.at(0)?.text;
  //     const modelPart = modelContent.parts?.at(0);
  //     if (modelPart) {
  //       if (!modelPart.text) modelPart.text = "";
  //       modelPart.text += text;
  //     }
  //   }
  //   contents.push(modelContent);
  // }
  // console.log(inspect(contents, { depth: null }));

  const token =
    "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..xwHxY0LKbHOBPtWD.MR7Eu-Z18LtSE4SF_OBU0DDugXZnIYnwaDy6hGlxcynSXlru6THqB1I8aOTxcjYKUkowMIeQyDaaLeisqn_aaSZ7GaJpH7ol8Jgem1hPMGfUc7P-0QbCurAjIvYiu_9kjuiU4uoLQz8i3RGYYurPLKWIlmsWGT5Oa-pQKwI.mib3za9KG040XiSL9ovGTA";
  const client = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: "http://localhost:3000/api/trpc",
        transformer: superjson,
        headers: () => {
          return {
            Authorization: `Bearer ${token}`,
          };
        },
      }),
    ],
  });

  let chatId = "";
  {
    const res = await client.gratitudeJournal.startChat.mutate({
      idempotencyKey: "7a6daeaa-9189-4486-be05-3b785cda8623",
    });
    chatId = res.chat.id;
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  {
    const res = await client.message.send.mutate({
      chatId,
      idempotencyKey: "99c5d650-65d2-4db6-ba09-33016806cb4c",
      model: "gemini-2.0-flash",
      text: "오늘 예진님이 팀홀튼 커피랑 샌드위치 사줬어. 맛있었어.",
    });
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  {
    const res = await client.message.send.mutate({
      chatId,
      idempotencyKey: "3a8e38d1-8975-49ac-b30f-6b17a8404f68",
      model: "gemini-2.0-flash",
      text: "그리구 예진님이 참치 샌드위치 사줬어. 맛있었어.",
    });
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  {
    const res = await client.message.send.mutate({
      chatId,
      idempotencyKey: "29a9fcce-ef8b-46b4-af7e-0fb060d9f569",
      model: "gemini-2.0-flash",
      text: "그리구 예진님이 버블티 사줬어. 맛있었어.",
    });
  }
}
