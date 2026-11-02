# Claude Code Project Instructions

Before making any changes, read `FRONTEND_ENGINEERING_GUIDELINES.md` completely.

All implementation, architecture, coding conventions, security practices, testing, and deployment configuration must follow that document.

Additional rules:

1. Inspect the existing repository before making architectural decisions.
2. Do not assume this project belongs to a specific business domain.
3. Do not introduce unnecessary dependencies or abstractions.
4. Do not invent API endpoints, business logic, or environment configuration.
5. Preserve existing functionality unless explicitly instructed otherwise.
6. Verify dependency compatibility before installation.
7. Run lint, type checks, tests, and production builds before completing implementation.
8. Update documentation when introducing architectural changes.

If a project requirement conflicts with the engineering guidelines, explain the conflict and propose the simplest maintainable solution before proceeding.

Keep the implementation practical, secure, and maintainable.

---

## Project Context

- **Application type:** standalone modular monolith (see `docs/adr/0001-modular-monolith.md`). No Module Federation. Introducing it requires a new ADR.
- **Business domains:** none defined yet. Create `src/features/<domain>/` only when real requirements exist.
- **Stack:** React 19, TypeScript 7 (`tsc` is the native compiler), Vite 8, React Router 8, TanStack Query 5, Zod 4, Vitest 5, Playwright, oxlint, Bun 1.4. All versions are pinned exactly in `package.json`. Install with `bun add --exact`.
- **Not installed yet:** React Hook Form (add with the first form) and a Keycloak client (add when authentication is implemented, behind an app-level auth module that sets `getAccessToken` / `onUnauthorized` on the API client).

### Commands

```sh
bun run dev        # dev server
bun run lint       # oxlint (warnings fail)
bun run typecheck  # tsc -b
bun run test       # vitest unit/component tests (src/**/*.test.ts[x])
bun run build      # type check + production build
bun run test:e2e   # playwright (builds + previews automatically)
```

### Conventions in this repo

- Import from `src` with the `@/` alias.
- Routes live in `src/app/routes.ts`. Pages are lazy-loaded with the route `lazy` option. `RouteErrorBoundary` handles failed chunk loads.
- Configuration is read only through `getConfig()` (`src/config/env.ts`, Zod-validated). Runtime values from `window.__APP_CONFIG__` (`/config.js`, written by `docker/40-app-config.sh` from `APP_*` env vars) override build-time `VITE_*` values. Add new keys to the schema, `vite-env.d.ts`, the entrypoint script, and `.env.example` together.
- HTTP goes through `createApiClient` (`src/shared/lib/api-client.ts`). Every request needs a Zod `schema`. Errors are `ApiError` with a `kind` (`unauthorized`, `forbidden`, `http`, `network`, `timeout`, `invalid-response`).
- Styling uses CSS Modules plus the tokens in `src/styles/tokens.css`. Do not hardcode values a token already covers.
