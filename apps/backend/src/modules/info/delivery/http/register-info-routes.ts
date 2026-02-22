import type { Hono } from "hono";
import { getInfo } from "@backend/modules/info/application/get-info";

export const registerInfoRoutes = (app: Hono): void => {
  app.get("/api/info", (c) => c.json(getInfo()));
};
