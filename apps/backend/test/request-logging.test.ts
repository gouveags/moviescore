import app from "../src/index";

describe("request logging", () => {
  it("logs structured request metadata for successful requests", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const response = await app.request("/health");

    expect(response.status).toBe(200);
    const payloads = logSpy.mock.calls
      .map((call) => call[0])
      .filter((value): value is string => typeof value === "string")
      .map((value) => JSON.parse(value) as Record<string, unknown>);
    const payload = payloads.find((item) => item.event === "http.request");

    expect(payload).toBeDefined();
    expect(payload).toMatchObject({
      event: "http.request",
      method: "GET",
      path: "/health",
      status: 200,
    });
    expect(typeof payload?.durationMs).toBe("number");
    expect(typeof payload?.requestId).toBe("string");
    expect(typeof payload?.traceId).toBe("string");

    logSpy.mockRestore();
  });

  it("emits trace span logs for key backend use-cases", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const response = await app.request("/api/info");

    expect(response.status).toBe(200);

    const payloads = logSpy.mock.calls
      .map((call) => call[0])
      .filter((value): value is string => typeof value === "string")
      .map((value) => JSON.parse(value) as Record<string, unknown>);
    const tracePayload = payloads.find((item) => item.event === "trace.span");

    expect(tracePayload).toBeDefined();
    expect(tracePayload).toMatchObject({
      event: "trace.span",
      name: "usecase.getInfo",
    });
    expect(typeof tracePayload?.traceId).toBe("string");
    expect(typeof tracePayload?.durationMs).toBe("number");

    logSpy.mockRestore();
  });
});
