import { Hono } from "hono";
import { registerHealthRoutes } from "@backend/modules/health/delivery/http/register-health-routes";
import { registerInfoRoutes } from "@backend/modules/info/delivery/http/register-info-routes";
import { createRequestLogger } from "@backend/platform/observability/request-logger";

const app = new Hono();
app.use("*", createRequestLogger());

registerHealthRoutes(app);
registerInfoRoutes(app);

export default app;
