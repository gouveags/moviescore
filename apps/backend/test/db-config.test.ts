import { resolveDatabaseConfig } from "../src/db/config";

describe("resolveDatabaseConfig", () => {
  it("defaults to sqlite with local file path", () => {
    const config = resolveDatabaseConfig({});

    expect(config).toEqual({
      client: "sqlite",
      sqlitePath: "./.data/moviescore.db",
    });
  });

  it("throws when postgres is selected without DATABASE_URL", () => {
    expect(() => resolveDatabaseConfig({ DB_CLIENT: "postgres" })).toThrow(
      "DATABASE_URL is required when DB_CLIENT=postgres",
    );
  });

  it("uses DATABASE_URL when postgres is selected", () => {
    const config = resolveDatabaseConfig({
      DB_CLIENT: "postgres",
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/moviescore",
    });

    expect(config).toEqual({
      client: "postgres",
      databaseUrl: "postgres://postgres:postgres@localhost:5432/moviescore",
    });
  });
});
