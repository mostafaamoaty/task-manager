Run the full quality check suite: build, then tests with coverage.

Steps:

1. Run `npm run build` and report any TypeScript or build errors
2. Run `npm run test:coverage` and report:
   - Total pass/fail count
   - Any failing tests with their error messages
   - Coverage percentages for statements, branches, functions, and lines
   - Flag if any metric is below 80%
3. Summarize what passed, what failed, and what needs attention before committing
