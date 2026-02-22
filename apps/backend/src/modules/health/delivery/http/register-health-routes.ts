import type { Hono } from "hono";
import { getHealthStatus } from "@backend/modules/health/application/get-health-status";

export const registerHealthRoutes = (app: Hono): void => {
  app.get("/health", (c) => c.json(getHealthStatus()));
};
