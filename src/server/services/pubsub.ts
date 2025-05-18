import { PubSub } from "@google-cloud/pubsub";
import type { ServiceRegistry } from "../service-registry";

export class PubSubService {
  private pubsub: PubSub;

  constructor(private readonly service: ServiceRegistry) {
    this.pubsub = new PubSub();
  }
}
