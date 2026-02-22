import { closeDatabase, createDatabase } from "../src/db/client";
import { migrateDatabase } from "../src/db/migrate";
import {
  createExpectation,
  createRating,
  createTitle,
  createUser,
  getExpectationDelta,
} from "../src/db/repositories/expectation-delta-repository";

describe("expectation delta repository", () => {
  it("computes expectation minus rating for a user and title", async () => {
    const database = await createDatabase({
      client: "sqlite",
      sqlitePath: ":memory:",
    });

    await migrateDatabase(database);

    await createUser(database, {
      id: "user-1",
      email: "user-1@example.com",
      displayName: "User One",
    });
    await createTitle(database, {
      id: "title-1",
      externalId: "tt0111161",
      title: "The Shawshank Redemption",
      mediaType: "movie",
      releaseYear: 1994,
    });
    await createExpectation(database, {
      id: "expectation-1",
      userId: "user-1",
      titleId: "title-1",
      score: 9,
      reason: "Great trailer",
    });
    await createRating(database, {
      id: "rating-1",
      userId: "user-1",
      titleId: "title-1",
      score: 7,
      review: "Good but not amazing",
    });

    const delta = await getExpectationDelta(database, "user-1", "title-1");

    expect(delta).toBe(2);

    await closeDatabase(database);
  });
});
