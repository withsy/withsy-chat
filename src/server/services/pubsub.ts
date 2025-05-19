import { Message, PubSub } from "@google-cloud/pubsub";
import { inspect } from "node:util";
import type { ServiceRegistry } from "../service-registry";

export class PubSubService {
  private pubsub: PubSub;
  private closeMap = new Map<string, Map<string, () => Promise<void>>>();

  constructor(private readonly service: ServiceRegistry) {
    if (process.env.NODE_ENV !== "production")
      if (!process.env.PUBSUB_EMULATOR_HOST)
        throw new Error("Please set PUBSUB_EMULATOR_HOST.");

    this.pubsub = new PubSub();

    if (process.env.NODE_ENV !== "production")
      console.log(inspect(this.pubsub.options, { depth: null }));

    process.on("SIGTERM", async () => {
      for (const map of this.closeMap.values()) {
        for (const close of map.values()) {
          await close();
        }
      }
    });
  }

  async publishMessage(input: { topicName: string; json: any }) {
    const { topicName, json } = input;
    const [topic] = await this.pubsub
      .topic(topicName)
      .get({ autoCreate: true });
    const messageId = await topic.publishMessage({ json });
    return messageId;
  }

  async subscribe(input: {
    topicName: string;
    subscriptionName: string;
    handler: (message: any) => Promise<void> | void;
  }) {
    const { topicName, subscriptionName, handler } = input;
    const [topic] = await this.pubsub
      .topic(topicName)
      .get({ autoCreate: true });
    const [subscription] = await topic
      .subscription(subscriptionName)
      .get({ autoCreate: true });

    const onMessage = async (message: Message) => {
      try {
        await handler(JSON.parse(message.data.toString()));
        message.ack();
      } catch (_e) {
        message.nack();
      }
    };

    subscription.on("close", () => {
      console.log(
        "PubSub subscription close.",
        "topic:",
        topicName,
        "subscription:",
        subscriptionName
      );
    });
    subscription.on("error", (error) => {
      console.error(
        "PubSub subscription error.",
        "topic:",
        topicName,
        "subscription:",
        subscriptionName,
        "error:",
        error
      );
    });
    subscription.on("debug", (msg) => {
      console.log(
        "PubSub subscription debug.",
        "topic:",
        topicName,
        "subscription:",
        subscriptionName,
        "debug message:",
        msg
      );
    });
    subscription.on("message", onMessage);

    const close = async () => {
      subscription.off("message", onMessage);
      await subscription.close();
    };

    if (!this.closeMap.has(topicName)) this.closeMap.set(topicName, new Map());
    const map = this.closeMap.get(topicName)!;
    if (map.has(subscriptionName))
      throw new Error(
        `topic: ${topicName} subscription: ${subscriptionName} already exist`
      );
    map.set(subscriptionName, close);

    const unsubscribe = async () => {
      const map = this.closeMap.get(topicName);
      if (!map) return;
      const close = map.get(subscriptionName);
      if (!close) return;
      map.delete(subscriptionName);
      await close();
    };

    console.log(
      "PubSub subscribed.",
      "topic:",
      topicName,
      "subscription:",
      subscriptionName
    );
    return unsubscribe;
  }
}
