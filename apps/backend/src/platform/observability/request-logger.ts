import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "@backend/platform/http/app-env";
import { createRequestId, createTraceId } from "@backend/platform/observability/trace";
import { recordHttpRequestMetrics } from "@backend/platform/observability/metrics";

export const createRequestLogger = (): MiddlewareHandler<AppEnv> => {
  return async (context, next) => {
    const startedAt = Date.now();
    const requestId = createRequestId();
    const traceId = createTraceId();

    context.set("requestId", requestId);
    context.set("traceId", traceId);
    context.header("x-request-id", requestId);

    await next();

    const durationMs = Date.now() - startedAt;
    recordHttpRequestMetrics({
      durationMs,
      method: context.req.method,
      path: context.req.path,
      status: context.res.status,
    });

    const payload = {
      event: "http.request",
      method: context.req.method,
      path: context.req.path,
      status: context.res.status,
      requestId,
      traceId,
      durationMs,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(payload));
  };
};
