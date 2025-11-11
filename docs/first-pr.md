# First PR: Clean Up Unused Report Imports

**Why it matters:** `src/pages/Reports.jsx` still imports several report components that are currently commented out. ESLint reports these as unused variables, cluttering CI output and hiding real issues. Removing the dead imports is a safe, high-leverage starter change.

## Steps

1. Open `src/pages/Reports.jsx`.
2. Delete the unused imports (`DailyPayoutReport`, `MonthlyEarningsReport`, `CustomReportGenerator`, `LocalizationProvider`, `AdapterDayjs`, `MultiCalendarEarningsReport`). 【F:src/pages/Reports.jsx†L1-L26】
3. Keep the commented section intact so future reinstatement is easy, but add a note explaining why it is disabled.
4. Ensure the remaining imports (`EarningsReport`, `SingleCalendarEarningsReport`) stay in place. 【F:src/pages/Reports.jsx†L1-L20】

## Tests

Run the standard checks before opening your PR:

```bash
npm test -- --run
npm run lint
npm run format
```

Expect `npm run lint` to return without unused-import warnings after your change. 【F:package.json†L6-L12】【F:.eslintrc.cjs†L1-L27】

## Submit

Open a PR titled **"chore: remove unused report imports"** describing:

- The imports you removed.
- The reasoning (cleaner lint output, easier future refactors).
- Confirmation that tests and linting pass.
