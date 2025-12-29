import { inspect as nodeInspect } from "node:util";

export function checkTimeZoneUtc() {
  const offset = new Date().getTimezoneOffset();
  if (offset !== 0) {
    throw new Error(`The time zone must be UTC. offset: ${offset}`);
  }
}

export function inspect(x: unknown): string {
  return nodeInspect(x, { depth: 5 });
}
