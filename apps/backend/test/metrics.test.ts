import app from "../src/index";

describe("GET /metrics", () => {
  it("exposes Prometheus-style request metrics", async () => {
    await app.request("/health");

    const metricsResponse = await app.request("/metrics");
    const body = await metricsResponse.text();

    expect(metricsResponse.status).toBe(200);
    expect(body).toContain("moviescore_http_requests_total");
    expect(body).toContain('path="/health"');
  });
});
