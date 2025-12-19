# Atlas Admin Design System

## Theme intent
The default admin theme pairs a warm linen canvas with a muted pastel blue accent to mirror the guest portal family while keeping the back-office experience calm, premium, and operationally clear for long working hours.

## Semantic tokens
- **Backgrounds:** `--bg-primary`, `--bg-surface`, `--bg-subtle`, `--bg-muted`
- **Text:** `--text-primary`, `--text-strong`, `--text-muted`, `--text-inverse`
- **Accent:** `--accent-primary`, `--accent-strong`, `--accent-soft`, `--accent-contrast`
- **CTAs:** `--cta-primary`, `--cta-primary-text`, `--cta-secondary`, `--cta-secondary-text`, `--cta-secondary-border`
- **Status (stable across themes):** `--status-success-*`, `--status-warning-*`, `--status-error-*`, `--status-info-*`
- **Structure:** `--border-subtle`, `--border-strong`, `--border-divider`, `--shadow-level1`, `--shadow-level2`, `--focus-ring`

Tokens are defined in `src/styles/tokens.css` and should be consumed via CSS variables (e.g., `var(--accent-primary)`) instead of hardcoded hex values.

## Usage rules
- Use semantic tokens for every color, border, and shadow; avoid raw hex, rgb, and named colors in components.
- Background hierarchy: `--bg-primary` (app shell), `--bg-surface` (cards/forms), `--bg-subtle` (stripes/headers), `--bg-muted` (hover or quiet emphasis).
- Text hierarchy: primary for body, strong for headings/labels, muted for helper copy; never reduce contrast below WCAG AA on the linen canvas.
- CTAs: primary actions use `--cta-primary`/`--cta-primary-text`; secondary actions use `--cta-secondary` with `--cta-secondary-border`.
- Status colors are fixed across themes; never override or desaturate them for seasonal palettes.
- Tables favor readability: clear borders (`--border-subtle`/`--border-strong`), zebra stripes with `--bg-subtle`, and minimal decoration.
- Avoid decorative gradients or blush tones; if separators need a hint of warmth, use `--border-divider` only.

## Allowed vs. forbidden
- **Allowed:** flat fills, light shadows from `--shadow-level*`, subtle accent chips, muted stripes for rows, focused outlines with `--focus-ring`.
- **Forbidden:** gradients, high-saturation pink/romantic tones, low-contrast text, off-token hex values, and decorative backgrounds behind data tables.

## Extending for future themes
- Seasonal themes should be applied by setting `data-theme="<name>"` on the `<body>` and overriding only the background and accent token group (`--bg-*`, `--accent-*`, `--cta-*`).
- Do **not** change status tokens or text contrast when introducing new palettes.
- Keep tokens centralized in `tokens.css`; component code should read from tokens so theme swaps do not require component changes.

## Implementation checklist
- Add or update styles using semantic tokens only.
- Validate contrast for headings, form labels, and table headers on both `--bg-primary` and `--bg-surface`.
- Use `--bg-muted`/`--accent-soft` for hover states instead of new color values.
- For charts, map series colors to accent or status tokens (e.g., success for earnings, warning/error for risk).
