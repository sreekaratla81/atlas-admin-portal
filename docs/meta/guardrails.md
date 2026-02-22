# Docs Guardrails (atlas-admin-portal)

**Purpose:** Prevent admin portal documentation (UX notes, API alignment, architecture) from drifting away from the codebase.

**Audience:** Developer

**Owner:** Atlas Tech Solutions

**Last updated:** 2026-02-22

**Related:** [repo README](../../README.md) | [canonical system docs](../../../atlas-e2e/docs/README.md)

---

## Non-negotiable rules

- **Do not delete docs.** Use **DEPRECATED** banners + canonical links.
- Keep repo-local docs repo-local; canonical system docs live in `atlas-e2e/docs/`.
- Relative links within `docs/**` must work.

## Freshness rules

- If UI flows change (calendar, templates, navigation) → update the corresponding `docs/*.md` page.
- If API integration points change → update `docs/api/rest-endpoints.md` and ensure canonical API docs are referenced.

## Guardrails checks

See [progress-ledger](progress-ledger.md).

