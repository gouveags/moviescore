import { Hono } from "hono";
import { registerHealthRoutes } from "@backend/modules/health/delivery/http/register-health-routes";
import { registerInfoRoutes } from "@backend/modules/info/delivery/http/register-info-routes";
import { createRequestLogger } from "@backend/platform/observability/request-logger";
import { renderPrometheusMetrics } from "@backend/platform/observability/metrics";
import type { AppEnv } from "@backend/platform/http/app-env";

const app = new Hono<AppEnv>();
app.use("*", createRequestLogger());
app.get("/metrics", (c) =>
  c.text(renderPrometheusMetrics(), 200, { "Content-Type": "text/plain; version=0.0.4" }),
);

registerHealthRoutes(app);
registerInfoRoutes(app);

export default app;
