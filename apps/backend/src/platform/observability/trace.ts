export type TraceAttributes = Record<string, string | number | boolean>;

const randomHex = (length: number): string => {
  const alphabet = "0123456789abcdef";
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
};

export const createRequestId = (): string => `req_${randomHex(16)}`;

export const createTraceId = (): string => randomHex(32);

export const createSpanId = (): string => randomHex(16);

export const withTraceSpan = async <T>(
  name: string,
  traceId: string,
  attributes: TraceAttributes,
  run: () => T | Promise<T>,
): Promise<T> => {
  const startedAt = Date.now();
  const spanId = createSpanId();

  try {
    const result = await run();
    console.log(
      JSON.stringify({
        event: "trace.span",
        traceId,
        spanId,
        name,
        attributes,
        status: "ok",
        durationMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      }),
    );
    return result;
  } catch (error) {
    console.log(
      JSON.stringify({
        event: "trace.span",
        traceId,
        spanId,
        name,
        attributes,
        status: "error",
        durationMs: Date.now() - startedAt,
        errorMessage: error instanceof Error ? error.message : "unknown",
        timestamp: new Date().toISOString(),
      }),
    );
    throw error;
  }
};
