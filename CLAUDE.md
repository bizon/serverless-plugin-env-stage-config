# CLAUDE.md

> **Maintenance rule**: when editing this file, ensure every rule is unambiguous, non-redundant, and non-contradictory. Keep sections focused — each rule belongs in exactly one place. Remove or merge anything that overlaps. The goal is a single source of truth that leaves zero room for interpretation.

## Project overview

Serverless Framework v3 plugin, published to npm as `serverless-plugin-env-stage-config`. Provides the `$esc` resolver for per-stage environment configuration files. Written in JavaScript (ESM), managed with pnpm.

## Checks (run after every change)

```bash
pnpm xo        # linter (ESLint-based via XO)
```

- `pnpm xo --fix <path>` to auto-fix lint issues in a specific file
- No build, type-check, or test step — this is a plain JS plugin

## Commit and PR conventions

- Use semantic commit messages (Conventional Commits)
- Subject line under 55 characters, body lines under 72 characters
- No `Co-Authored-By` trailer
- PR titles follow the same conventions as commit subjects
- No "Generated with Claude Code" footer in PR descriptions
- Branch names prefixed with GitHub username (use `gh api user --jq '.login'`)

## Project structure

- `index.js` — the Serverless plugin (registers the `$esc` variable resolver)

## Code patterns

- **Node version**: 24 (see `.node-version`)
- **Package runner**: use `pnpx` instead of `npx`
- **Module format**: ESM (`"type": "module"`)

## CI/CD

- **Tests** (`tests.yml`): lint on every PR and push to master
- **Release** (`release.yml`): semantic-release + npm publish
- **PR validation** (`pr.yml`): enforces semantic PR titles

## Documentation

- Keep `README.md` in sync with the codebase (resolver behavior, configuration, usage).
