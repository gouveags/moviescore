import app from "../src/index";
import { platformTagline } from "@moviescore/shared";

describe("GET /api/info", () => {
  it("returns product info payload", async () => {
    const response = await app.request("/api/info");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      name: "MovieScore",
      tagline: platformTagline,
    });
  });
});
