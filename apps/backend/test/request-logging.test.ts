import app from "../src/index";

describe("request logging", () => {
  it("logs structured request metadata for successful requests", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const response = await app.request("/health");

    expect(response.status).toBe(200);
    expect(logSpy).toHaveBeenCalledTimes(1);

    const [rawLog] = logSpy.mock.calls[0] ?? [];
    expect(typeof rawLog).toBe("string");

    const payload = JSON.parse(String(rawLog)) as Record<string, unknown>;
    expect(payload).toMatchObject({
      event: "http.request",
      method: "GET",
      path: "/health",
      status: 200,
    });
    expect(typeof payload.durationMs).toBe("number");

    logSpy.mockRestore();
  });
});
