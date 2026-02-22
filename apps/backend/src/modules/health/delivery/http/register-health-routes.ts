import type { Hono } from "hono";
import { getHealthStatus } from "@backend/modules/health/application/get-health-status";
import type { AppEnv } from "@backend/platform/http/app-env";
import { withTraceSpan } from "@backend/platform/observability/trace";

export const registerHealthRoutes = (app: Hono<AppEnv>): void => {
  app.get("/health", async (c) => {
    const traceId = c.get("traceId");
    const payload = await withTraceSpan(
      "usecase.getHealthStatus",
      traceId,
      { path: "/health" },
      () => getHealthStatus(),
    );
    return c.json(payload);
  });
};
