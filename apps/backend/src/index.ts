import { Hono } from "hono";
import { platformTagline } from "@moviescore/shared";

const app = new Hono();

app.get("/health", (c) =>
  c.json({
    status: "ok",
    service: "moviescore-api",
  }),
);

app.get("/api/info", (c) =>
  c.json({
    name: "MovieScore",
    tagline: platformTagline,
  }),
);

export default app;
