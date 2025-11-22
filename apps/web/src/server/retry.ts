export async function retry<Return>(
  fn: () => Promise<Return>,
  options?: {
    maxAttempts?: number;
    initialDelayInMs?: number;
    factor?: number;
    condition?: (e: any) => boolean;
  }
): Promise<Return> {
  const {
    maxAttempts = 3,
    initialDelayInMs = 500,
    factor = 1.8,
    condition = () => true,
  } = options ?? {};

  if (!(maxAttempts > 0)) {
    throw new Error(
      `Max attempts must be greater than 0. maxAttempts: ${maxAttempts}`
    );
  }

  let delayInMs = initialDelayInMs;
  let lastError = undefined;
  for (let attempt = 1; attempt <= maxAttempts; ++attempt) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < maxAttempts) {
        if (condition(e)) {
          await new Promise((resolve) => setTimeout(resolve, delayInMs));
          delayInMs *= factor;
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
}
