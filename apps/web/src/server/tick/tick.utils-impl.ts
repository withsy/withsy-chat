import { TickService } from "./tick.service";

export function createService(context: {}): TickService {
  return new TickService();
}
