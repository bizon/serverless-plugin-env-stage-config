# CLAUDE.md

> **Maintenance rule**: when editing this file, ensure every rule is unambiguous, non-redundant, and non-contradictory. Keep sections focused — each rule belongs in exactly one place. Remove or merge anything that overlaps. The goal is a single source of truth that leaves zero room for interpretation.

## Project overview

Plugin for [**osls**](https://github.com/oss-serverless/osls) (the community-maintained fork of Serverless Framework v3), published to npm as `serverless-plugin-env-stage-config`. Provides the `$esc` resolver for per-stage environment configuration files. Built against the osls / Serverless Framework v3 configuration-variables-sources API. Written in TypeScript (ESM), managed with pnpm.

## Checks (run after every change)

```bash
pnpm xo          # linter (ESLint-based via XO)
pnpm check:ts    # type checker (tsc --noEmit)
pnpm test        # tests (Jest with SWC)
```

- `pnpm xo --fix <path>` to auto-fix lint issues in a specific file
- Build: `pnpm build` (tsdown, ESM-only output)

## Commit and PR conventions

- Use semantic commit messages (Conventional Commits)
- Subject line under 55 characters, body lines under 72 characters
- No `Co-Authored-By` trailer
- PR titles follow the same conventions as commit subjects
- No "Generated with Claude Code" footer in PR descriptions
- Branch names prefixed with GitHub username (use `gh api user --jq '.login'`)

## Project structure

```text
src/
  index.ts                  # Serverless plugin — registers the `$esc` variable resolver
  cloudformation-schema.ts  # js-yaml schema for CloudFormation intrinsic tags (!Ref, !GetAtt, …)
__tests__/
  index.spec.ts             # Resolver tests
  cloudformation-schema.spec.ts
  fixtures/                 # Sample serverless.env.<stage>.yml files
dist/                       # Build output (tsdown): index.mjs (ESM) + type declarations
```

## Code patterns

- **Node version**: 24 (see `.node-version`)
- **Package runner**: use `pnpx` instead of `npx`
- **Module format**: ESM (`"type": "module"`)
- **Build**: tsdown, ESM-only (`dist/index.mjs` + `dist/index.d.mts`)
- **Tests**: Jest with SWC; import the test API from `@jest/globals` (not `@types/jest`)
- **YAML**: pinned to `js-yaml` v4 — the plugin uses the v3/v4 `Type` / `DEFAULT_SCHEMA` API, which was removed in the v5 rewrite

## CI/CD

- **Tests** (`tests.yml`): lint + type check + Jest on every PR and push to master
- **Release** (`release.yml`): builds, then semantic-release + npm publish
- **PR validation** (`pr.yml`): enforces semantic PR titles

## Documentation

- Keep `README.md` in sync with the codebase (resolver behavior, configuration, usage).
