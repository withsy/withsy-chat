export function checkTimeZoneUtc() {
  const offset = new Date().getTimezoneOffset();
  if (offset !== 0) {
    throw new Error(`The time zone must be UTC. offset: ${offset}`);
  }
}
