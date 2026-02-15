# Agent instructions (atlas-admin-portal)

For AI assistants (Cursor, Codex, etc.) working in this repo:

- **PRs and gates:** Run the gate locally before suggesting a PR (see [CONTRIBUTING.md](CONTRIBUTING.md)). The **Gate** workflow (`.github/workflows/gate.yml`) must pass before merge. Status check name for branch protection: **gate**.
- **Feature work:** This repo is the admin UI; backend feature roadmap and execution workflow live in **atlas-api** — see `atlas-api/docs/ATLAS-HIGH-VALUE-BACKLOG.md` and `atlas-api/docs/ATLAS-FEATURE-EXECUTION-PROMPT.md` when changes span API and admin.
- **Docs:** Update README or `docs/` when adding features; see `docs/admin-design-system.md` and `docs/admin-calendar.md` for UI/calendar behavior.
