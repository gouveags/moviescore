import type { Database } from "../client";

type UserInput = {
  id: string;
  email: string;
  displayName: string;
};

type TitleInput = {
  id: string;
  externalId: string;
  title: string;
  mediaType: "movie" | "series";
  releaseYear: number;
};

type ExpectationInput = {
  id: string;
  userId: string;
  titleId: string;
  score: number;
  reason?: string;
};

type RatingInput = {
  id: string;
  userId: string;
  titleId: string;
  score: number;
  review?: string;
};

const createUser = async (database: Database, input: UserInput): Promise<void> => {
  await database.run(
    "INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)",
    [input.id, input.email, input.displayName],
  );
};

const createTitle = async (database: Database, input: TitleInput): Promise<void> => {
  await database.run(
    "INSERT INTO titles (id, external_id, title, media_type, release_year) VALUES (?, ?, ?, ?, ?)",
    [input.id, input.externalId, input.title, input.mediaType, input.releaseYear],
  );
};

const createExpectation = async (database: Database, input: ExpectationInput): Promise<void> => {
  await database.run(
    "INSERT INTO expectations (id, user_id, title_id, score, reason) VALUES (?, ?, ?, ?, ?)",
    [input.id, input.userId, input.titleId, input.score, input.reason ?? null],
  );
};

const createRating = async (database: Database, input: RatingInput): Promise<void> => {
  await database.run(
    "INSERT INTO ratings (id, user_id, title_id, score, review) VALUES (?, ?, ?, ?, ?)",
    [input.id, input.userId, input.titleId, input.score, input.review ?? null],
  );
};

const getExpectationDelta = async (
  database: Database,
  userId: string,
  titleId: string,
): Promise<number | null> => {
  const rows = await database.query<{ delta: number | string | null }>(
    `
      SELECT e.score - r.score AS delta
      FROM expectations e
      INNER JOIN ratings r ON r.user_id = e.user_id AND r.title_id = e.title_id
      WHERE e.user_id = ? AND e.title_id = ?
      ORDER BY e.created_at DESC, r.created_at DESC
      LIMIT 1
    `,
    [userId, titleId],
  );
  const firstDelta = rows[0]?.delta;

  if (firstDelta === null || firstDelta === undefined) {
    return null;
  }

  return Number(firstDelta);
};

export { createUser, createTitle, createExpectation, createRating, getExpectationDelta };
export type { UserInput, TitleInput, ExpectationInput, RatingInput };
