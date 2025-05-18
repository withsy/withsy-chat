import { PubSub } from "@google-cloud/pubsub";
import type { ServiceRegistry } from "../service-registry";

export class PubSubService {
  private pubsub: PubSub;

  constructor(private readonly service: ServiceRegistry) {
    this.pubsub = new PubSub();
  }

  async publishMessage(input: { topicName: string; json: any }) {
    const { topicName, json } = input;
    const [topic] = await this.pubsub
      .topic(topicName)
      .get({ autoCreate: true });
    const messageId = await topic.publishMessage({ json });
    return messageId;
  }

  async getSubscription(input: {
    topicName: string;
    subscriptionName: string;
  }) {
    const { topicName, subscriptionName } = input;
    const [topic] = await this.pubsub
      .topic(topicName)
      .get({ autoCreate: true });
    const [subscription] = await topic
      .subscription(subscriptionName)
      .get({ autoCreate: true });
    return subscription;
  }
}
