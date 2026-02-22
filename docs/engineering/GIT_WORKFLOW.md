# Git Workflow

## Protected Main Branch

`main` is protected and blocks direct pushes.

All changes must follow:

1. Create a feature branch from `main`
2. Commit work on that branch
3. Open a pull request to `main`
4. Get at least 1 approval
5. Merge only after review and checks

## Required Practice

- Never commit directly to `main`.
- Keep pull requests focused and small enough for effective review.
- Include tests and documentation updates in each PR.
- Use descriptive branch names (for example: `feat/recommendation-feed`, `fix/rating-validation`).

## Local Quality Hooks

Git hooks are part of the default workflow and are configured with Husky.

Pre-commit (`.husky/pre-commit`):

- `pnpm check:commit`
- Runs staged-file format checks (Prettier) and staged lint checks (ESLint)
- Runs backend architecture linter (`pnpm lint:architecture`) to enforce dependency direction

Pre-push (`.husky/pre-push`):

- `pnpm check:push`
- Runs `lint`, `typecheck`, `test`, and `build` via Turborepo

Performance expectations:

- Keep pre-commit checks scoped and fast (staged files only where possible).
- Keep test and build pipelines optimized to preserve tight feedback loops.
