# Agent instructions (atlas-admin-portal)

For AI assistants (Cursor, Codex, etc.) working in this repo:

- **PRs and CI:** Run the same checks locally before suggesting a PR (see [CONTRIBUTING.md](CONTRIBUTING.md) for the full checklist including `npm ci`). The **CI** workflow (`.github/workflows/ci.yml`) must pass before merge. Status check name for branch protection: **CI**.
- **Feature work:** This repo is the admin UI; backend feature roadmap and execution workflow live in **atlas-api** — see `atlas-api/docs/ATLAS-HIGH-VALUE-BACKLOG.md` and `atlas-api/docs/ATLAS-FEATURE-EXECUTION-PROMPT.md` when changes span API and admin.
- **Docs:** Update README or `docs/` when adding features; see `docs/admin-design-system.md`, `docs/admin-calendar.md`, and `docs/messaging-templates-implementation-plan.md` for UI/calendar/messaging behavior.
