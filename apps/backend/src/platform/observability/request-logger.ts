import type { MiddlewareHandler } from "hono";

export const createRequestLogger = (): MiddlewareHandler => {
  return async (context, next) => {
    const startedAt = Date.now();

    await next();

    const durationMs = Date.now() - startedAt;
    const payload = {
      event: "http.request",
      method: context.req.method,
      path: context.req.path,
      status: context.res.status,
      durationMs,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(payload));
  };
};
