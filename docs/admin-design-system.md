# Admin design system and theming rules

This guide documents the semantic tokens, how the admin components consume them, the rules for status colors, and how to layer seasonal themes without breaking operational clarity.

## Semantic tokens
- **Defined in**: `src/styles/tokens.css` (semantic colors) and `src/style.css` (component-scoped tokens). Use these variables instead of raw hex values.
- **Canvas & surfaces**: `--color-bg-canvas`, `--color-bg-surface`, `--color-bg-subtle`, `--color-bg-muted` set page, card, and inset backgrounds.
- **Text**: `--color-text-primary`, `--color-text-strong`, `--color-text-muted`, `--color-text-inverse` handle body copy, headings, supportive text, and on-accent contrast.
- **Accent**: `--color-accent-primary`, `--color-accent-strong`, `--color-accent-soft`, `--color-accent-contrast` drive interactive states (primary buttons, active tabs, nav emphasis).
- **Borders & elevation**: `--color-border-subtle`, `--color-border-strong`, `--shadow-soft`, `--shadow-elevated` keep edges readable without heavy outlines.
- **Status palette (do not override)**: `--color-status-success-*`, `--color-status-warning-*`, `--color-status-error-*`, `--color-status-info-*` power badges, alerts, and table chips. These are year-round anchors and must remain stable across themes to preserve meaning.
- **Focus**: `--color-focus-ring` guarantees visible keyboard focus that meets contrast on both light and accented surfaces.

## Component usage rules
- **Buttons & tabs**: use `--button-*` and `--tab-*` tokens (from `src/style.css`) backed by accent variables. Never swap to status tokens for primary/secondary actions.
- **Cards, tables, nav**: consume `--card-*`, `--table-*`, `--nav-*` to keep radii, borders, and hover states consistent. Avoid per-component hex codes—extend the semantic layer instead.
- **Badges & pills**: status chips must map to the status palette; neutral tags can use `--badge-*`. Mixed states (e.g., “info + success”) should pick the dominant meaning and stick to that token set.
- **Spacing & radius**: preserve shared measurements (`--shell-radius`, `--shell-padding`, `--shell-gap`, `--nav-height`) to maintain operational density and alignment between legacy and shell layouts.
- **Readability**: ensure body text stays at least 14–16px with 1.4–1.6 line height; avoid lowering contrast below WCAG AA on tablet breakpoints. Use existing focus ring tokens for keyboard parity on touch-plus-keyboard devices.

## Status color guidance
- Success → confirmations/completions; Warning → pending/needs attention; Error → blockers/retries; Info → neutral updates. Do not repurpose accent colors for status semantics.
- Background-first: use `*-bg` for fills, `*-border` for outlines/dividers, and `*-text` for labels/icons. When stacking (e.g., badge inside alert), keep the inner element on the same status family.
- Charts/legends: if a status appears in a legend, match the badge text token for strokes/fills to keep cues consistent across widgets and tables.
- Never tint success/error tokens to match a seasonal palette; status colors remain stable even when accents change.

## Seasonal override guidelines
- Seasonal themes may override **only** accent and background groups (`--color-bg-*`, `--color-accent-*`) by applying a `data-theme` attribute and redefining those variables. Leave status and focus tokens untouched.
- Keep operational density: avoid adding padding or border radii beyond the shared tokens; seasonal changes should be palette swaps, not layout shifts.
- Contrast checks: verify that accent text still meets contrast with its background (`--color-accent-contrast` can be adjusted only if it preserves AA on buttons, tabs, and nav links).
- Assets: do not introduce binary assets (PNG/JPEG) for themes. Prefer CSS variables, gradients, or inline SVG that reuse the token set.

## Extending or overriding tokens safely
- Add new semantics (e.g., `--color-accent-alt`) in `src/styles/tokens.css` and wire component-level aliases in `src/style.css` so consumers do not import raw values.
- When adding component tokens, map them to existing semantic parents first; introduce new semantic primitives only when a new meaning is required (e.g., a tertiary surface).
- If a seasonal override needs a darker accent, adjust `--color-accent-primary` and `--color-accent-strong` together and confirm that dependent component tokens (`--button-primary-*`, `--tab-active-*`, nav active states) remain legible.
- Keep status tokens immutable. New status types should extend the status palette, not reuse accent colors.

## Do / Don’t examples
- **Do**: create `--table-row-highlight` that points to `--color-accent-soft` for hover consistency.
- **Do**: add a `data-theme="winter"` that redefines `--color-bg-canvas` and `--color-accent-primary` while leaving status tokens unchanged.
- **Do**: keep table row height and padding unchanged in seasonal modes to retain high information density.
- **Don’t**: hardcode `#ff8800` inside a component; add a semantic token and reuse it.
- **Don’t**: recolor success badges to match a holiday palette; status semantics are invariant.
- **Don’t**: ship background illustrations as PNGs; prefer tokenized gradients or inline SVG with token-driven fills.
