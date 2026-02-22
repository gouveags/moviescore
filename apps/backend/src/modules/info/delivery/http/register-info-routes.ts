import type { Hono } from "hono";
import { getInfo } from "@backend/modules/info/application/get-info";
import type { AppEnv } from "@backend/platform/http/app-env";
import { withTraceSpan } from "@backend/platform/observability/trace";

export const registerInfoRoutes = (app: Hono<AppEnv>): void => {
  app.get("/api/info", async (c) => {
    const traceId = c.get("traceId");
    const payload = await withTraceSpan("usecase.getInfo", traceId, { path: "/api/info" }, () =>
      getInfo(),
    );
    return c.json(payload);
  });
};
