import { Hono } from "hono";
import { registerHealthRoutes } from "@backend/modules/health/delivery/http/register-health-routes";
import { registerInfoRoutes } from "@backend/modules/info/delivery/http/register-info-routes";

const app = new Hono();

registerHealthRoutes(app);
registerInfoRoutes(app);

export default app;
