# sadayamuthu.com

Pre-rendered React/Vite/Tailwind academic homepage.

## Commands

- `npm run dev` start the dev server
- `npm run build` production build into `dist/`
- `npm test` run the test suite (`npx vitest run` for a single pass)
- `npm run lint` run ESLint
- `npm run content-check` list content still to fill (advisory; always exits 0, not part of `build`)

## Content checklist

`npm run content-check` prints the gaps in `src/data/research.json` (missing bio, DOIs, project problem/novelty/role, experience dates, scope and outcomes, peer-review proof links and dates, Scholar ID) as `content-check: N item(s) to fill` followed by one `- item` line each. It is advisory: it exits 0 and is not part of `npm run build`. Sections that are intentionally empty (publications, coverage, talks, metrics) are not reported.

## Deploy

Pushes to `main` build and deploy to GitHub Pages through the `gh-pages` branch (`.github/workflows/deploy.yml`). The repo secret `FORBIDDEN_TERMS` supplies extra leak-check patterns, newline-separated, for the test and build steps. Pages must be set to serve from the `gh-pages` branch.
