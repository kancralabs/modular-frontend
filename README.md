# Modular Frontend

A standalone, domain-oriented React application (modular monolith) built with Bun and Vite.

Engineering standards: [FRONTEND_ENGINEERING_GUIDELINES.md](FRONTEND_ENGINEERING_GUIDELINES.md) · Architecture decisions: [docs/adr/](docs/adr/)

## Prerequisites

- [Bun](https://bun.sh) 1.4.4 (`curl -fsSL https://bun.sh/install | bash`)
- Docker (optional, for container builds)

## Getting Started

```sh
bun install
cp .env.example .env    # adjust values as needed
bun run dev
```

## Scripts

| Script               | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `bun run dev`        | Start the Vite dev server                                           |
| `bun run lint`       | Lint with oxlint (warnings fail)                                    |
| `bun run typecheck`  | TypeScript project check                                            |
| `bun run test`       | Unit and component tests (Vitest + React Testing Library)           |
| `bun run test:watch` | Tests in watch mode                                                 |
| `bun run build`      | Type check and production build into `dist/`                        |
| `bun run preview`    | Serve the production build locally                                  |
| `bun run test:e2e`   | Playwright end-to-end tests (run `bunx playwright install chromium` once first) |

## Configuration

Configuration is validated at startup (`src/config/env.ts`). An invalid configuration shows an error screen instead of a broken app.

| Key          | Build time (`.env`) | Runtime (container env) | Required |
| ------------ | ------------------- | ----------------------- | -------- |
| `appName`    | `VITE_APP_NAME`     | `APP_NAME`              | yes      |
| `apiBaseUrl` | `VITE_API_BASE_URL` | `APP_API_BASE_URL`      | yes      |

- **Build-time** `VITE_*` values are embedded in the bundle. Never put secrets in them.
- **Runtime** values are written to `/config.js` when the container starts and override build-time values. This lets one image be promoted across environments without a rebuild.
- The Keycloak variables in `.env.example` are reserved and not read until authentication is implemented.

## Project Structure

```
src/
├── app/          App root, providers (TanStack Query), route table
├── config/       Validated runtime/build-time configuration
├── layouts/      Application layouts
├── pages/        App-level pages (lazy-loaded)
├── shared/
│   ├── components/  Generic UI (loader, error boundary, not-found)
│   └── lib/         API client
├── styles/       Design tokens and global styles
└── main.tsx
e2e/              Playwright tests
docker/           Container entrypoint scripts
nginx/            Nginx server configuration
```

### Adding a Feature Domain

Create `src/features/<domain>/` with only the folders it needs (`api/`, `components/`, `hooks/`, `pages/`, `schemas/`, `types/`). Register its pages in `src/app/routes.ts` with `lazy`. Features must not import each other's internals.

For server data, create a client with `createApiClient` (`src/shared/lib/api-client.ts`), define a Zod schema for each response, and wrap the calls in TanStack Query hooks inside the feature's `api/` folder.

## Docker

```sh
docker build -t modular-frontend:<git-sha> .
docker run --rm -p 8080:8080 \
  -e APP_NAME="Modular Frontend" \
  -e APP_API_BASE_URL=/api \
  modular-frontend:<git-sha>
```

The image is a multi-stage build: Bun + Vite build, then non-root Nginx serving static files on port 8080.

| Path        | Behavior                                         |
| ----------- | ------------------------------------------------ |
| `/healthz`  | `200 ok`, for readiness/liveness probes          |
| `/assets/*` | Content-hashed, `max-age=31536000, immutable`    |
| `/config.js`| Runtime config, `no-cache`                       |
| everything else | SPA fallback to `index.html`, `no-cache`     |

## CI

`.github/workflows/ci.yml` runs install (frozen lockfile), lint, type check, unit tests, build, E2E tests and a Docker build. The image push step is commented out until a container registry is chosen.

## Follow-ups

- Kubernetes manifests (Deployment with probes on `/healthz`, resources, rolling updates; Service; Ingress), once cluster details are known.
- Authentication (Keycloak, Authorization Code + PKCE) and permission-aware routing, once requirements are defined.
- A security scan stage in CI.
