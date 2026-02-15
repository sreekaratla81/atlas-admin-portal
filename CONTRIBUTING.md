# Contributing

## Branching & Workflow

- Fork or branch from `main`.
- Use short-lived feature branches named `feat/<summary>` or `chore/<summary>`.
- Rebase frequently to stay current with upstream `main`.

## Commit Style

- Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add bank account export`).
- Group related changes per commit; avoid mixing refactors with feature work.

## Pull Request Checklist

Before requesting review:

1. **Self-review** – scan the diff for accidental debug logs or secrets.
2. **Update documentation** when behavior changes (README, RUNBOOK, or inline comments).
3. **Run automated checks**

   ```bash
   npm test -- --run
   npm run lint
   npm run format
   ```

   The **CI** workflow (`.github/workflows/ci.yml`) runs the same checks on push/PR; it must pass before merge.
   - Tests use Vitest and jsdom. 【F:package.json†L6-L12】
   - Linting relies on ESLint with React and TypeScript rules. 【F:.eslintrc.cjs†L1-L27】
   - Formatting checks Markdown/JSON/YAML with Prettier. 【F:package.json†L6-L12】

4. **Never commit `.env` or `.env.local`** – they may contain secrets (API keys, Auth0). Keep them in `.env.local` and rely on `.gitignore`. 【F:.gitignore†L1-L40】

## Code Style Highlights

- Prefer the shared Axios instance from `src/lib/api.ts` for REST calls so interceptors and base URL logic apply consistently. 【F:src/lib/api.ts†L1-L32】
- Use the guest hydration service (`hydrateGuests`) instead of manual IndexedDB writes to keep normalization consistent. 【F:src/services/guests.local.ts†L1-L25】
- Wrap new protected views with `<ProtectedRoute>` and, if needed, add navigation metadata in `src/router/routes.tsx`. 【F:src/router/routes.tsx†L1-L37】【F:src/auth/ProtectedRoute.tsx†L1-L24】

## Review Expectations

- Two approvals or an approval plus QA sign-off are recommended for feature work.
- Expect feedback on accessibility, performance, auth flows, and API contract usage.
- Ship small, incremental PRs when touching critical flows such as bookings or payments.
