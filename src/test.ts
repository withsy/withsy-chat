import { PubSub } from "@google-cloud/pubsub";
import "dotenv/config";

main();

async function main() {
  const pubsub = new PubSub();

  const [topic] = await pubsub.topic("test").get({ autoCreate: true });
  const [subscription] = await topic
    .subscription("test")
    .get({ autoCreate: true });
  subscription.on("error", (error) => {
    console.error("PubSub subscription error:", error);
  });
  subscription.on("message", (message) => {
    console.log("message", message.data.toString());
    message.ack();
  });

  {
    const [topic] = await pubsub.topic("test").get({ autoCreate: true });
    const messageId = await topic.publishMessage({ json: { hello: "world" } });
    console.log("message id", messageId);
  }
}
