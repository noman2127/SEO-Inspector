# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (not used for current app)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **HTML parsing**: node-html-parser

## Application: SEO Meta Tag Analyzer

A web tool that analyzes any website's SEO meta tags. Enter a URL and it:
- Fetches the page HTML via the backend (avoids CORS)
- Extracts all SEO tags: title, meta description, Open Graph, Twitter Cards, canonical, viewport, robots, language
- Scores each tag against best practices (pass/warn/fail/info)
- Displays a Google Search preview (realistic SERP snippet mock)
- Shows Facebook and Twitter social card previews
- Provides actionable feedback for each tag

### Artifacts
- `artifacts/seo-analyzer` — React + Vite frontend (preview path: `/`)
- `artifacts/api-server` — Express 5 API server (preview path: `/api`)

### Key Routes
- `POST /api/seo/analyze` — Accepts `{ url }`, returns full SEO analysis
- `GET /api/healthz` — Health check

### SEO Scoring Weights
- General: 40%
- Open Graph: 25%
- Twitter: 20%
- Technical: 15%

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
