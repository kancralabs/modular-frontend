# Frontend Engineering Guidelines

## 1. Purpose

This document defines the engineering standards, architecture principles, development conventions, and deployment practices for frontend applications.

The guidelines are technology-oriented but domain-agnostic.

They must be applicable to:

- Business applications.
- ERP, CRM, WMS, TMS, and management systems.
- Internal dashboards.
- SaaS applications.
- Customer-facing web applications.
- Administrative portals.
- Other scalable web platforms.

Do not assume a specific business domain, backend framework, database, or product requirement unless explicitly provided.

The primary goals are:

1. Maintainable and scalable frontend architecture.
2. Clear separation of application domains.
3. Independent development and deployment where needed.
4. Consistent UI and user experience.
5. Secure authentication and authorization.
6. Predictable development and deployment workflows.
7. Avoid unnecessary architectural complexity.

---

## 2. Technology Standards

### Core Stack

| Category                  | Standard                                      |
| ------------------------- | --------------------------------------------- |
| UI Framework              | React                                         |
| Language                  | TypeScript                                    |
| Package Manager / Runtime | Bun                                           |
| Build Tool                | Vite                                          |
| Routing                   | React Router                                  |
| Frontend Integration      | Module Federation                             |
| Authentication            | Keycloak-compatible architecture              |
| Server State              | TanStack Query                                |
| Form Management           | React Hook Form                               |
| Validation                | Zod                                           |
| Styling                   | CSS Modules or approved shared styling system |
| Testing                   | Vitest, React Testing Library, Playwright     |
| Containerization          | Docker                                        |
| Web Server                | Nginx or equivalent                           |
| Orchestration             | Kubernetes                                    |
| CI/CD                     | Repository-specific pipelines                 |

Use stable and compatible versions.

Before installing dependencies, verify compatibility between React, Vite, Bun, and the selected Module Federation implementation.

Bun should be used for dependency management, scripts, and supported tooling.

Vite is responsible for frontend development and production builds.

Do not assume Bun's native bundler is interchangeable with Vite or that every Vite plugin is compatible with it.

---

## 3. Architecture Principles

### 3.1 Domain-Oriented Architecture

Organize application code by business domain or functional capability.

Examples of possible domains:

- Authentication.
- User Management.
- Billing.
- Inventory.
- Reporting.
- Administration.
- Payments.
- Notifications.

Domain names must come from actual project requirements.

Each domain should own its implementation, including:

- Pages.
- Components.
- Hooks.
- API clients.
- Validation schemas.
- Domain types.
- Domain utilities.

Avoid organizing the entire application only by technical file type.

### 3.2 Modular Monolith

Use a modular monolith as the default starting architecture when a single deployable frontend is sufficient.

Characteristics:

- One application.
- One main build.
- One deployment.
- Clear domain boundaries.
- Independent internal modules.
- Route-level lazy loading.

A modular monolith should be the preferred choice when the primary requirement is code organization rather than independent deployment.

### 3.3 Microfrontend

Use microfrontend architecture when independently developed or deployed frontend applications provide meaningful operational benefits.

Characteristics:

- Multiple frontend applications.
- Separate repositories when required.
- Independent build pipelines.
- Independent deployments.
- Runtime integration through a host application.
- Explicit integration contracts.

Microfrontend must not be introduced solely to create more repositories or folders.

### 3.4 Architecture Selection

| Requirement                            | Recommended Architecture      |
| -------------------------------------- | ----------------------------- |
| Organize a large codebase              | Modular Monolith              |
| Improve initial loading                | Lazy Loading / Code Splitting |
| Independent domain deployment          | Microfrontend                 |
| Multiple teams with separate ownership | Microfrontend                 |
| Shared components and consistency      | Shared UI Kit                 |
| Complex business domain boundaries     | Domain-Oriented Architecture  |
| Small or medium frontend               | Modular Monolith              |

Architecture decisions must be documented when they introduce meaningful operational complexity.

---

## 4. Microfrontend Architecture

### 4.1 Host / Shell Application

The Shell is responsible for application-level concerns:

- Global layout.
- Navigation.
- Routing integration.
- Authentication initialization.
- User session management.
- Permission-aware navigation.
- Remote application registration.
- Remote application loading.
- Global error handling.
- Shared application context.

The Shell must not contain domain-specific business logic belonging to remote applications.

### 4.2 Remote Applications

Each remote application should represent a cohesive functional domain.

A remote application owns:

- Domain pages.
- Domain components.
- Domain API clients.
- Domain validation.
- Domain state.
- Domain-specific routing.

Remote applications must expose only explicitly supported public entry points.

Do not import internal source files from another remote application.

### 4.3 Module Federation

Use Module Federation or an equivalent runtime integration mechanism.

Requirements:

- Shell acts as the host.
- Domain applications act as remotes.
- Remote entry URLs must be configurable.
- Remote modules must expose stable public interfaces.
- Shared dependencies must be explicitly configured.
- React and React DOM should use compatible shared runtime instances.
- Remote loading failures must be isolated.
- Remote versions must be compatible with the Shell integration contract.
- Production asset paths must be deterministic.

Do not assume different Module Federation implementations have identical configuration or runtime APIs.

Verify the chosen implementation before generating the integration code.

### 4.4 Repository Strategy

Separate repositories are appropriate when domains require independent ownership and deployment.

Example:

```
platform-shell/
platform-identity/
platform-feature-a/
platform-feature-b/
platform-ui-kit/
platform-contracts/
```

Repository names must reflect actual project responsibilities.

Do not create a repository for every small feature or UI component.

### 4.5 Cross-Application Communication

Prefer explicit contracts over direct implementation dependencies.

Supported mechanisms may include:

- Shared TypeScript interfaces.
- Shell-provided context.
- Browser Custom Events.
- URL navigation.
- Shared API contracts.

Avoid introducing a global event bus unless a real cross-application use case requires it.

Communication must be documented, typed, and versioned.

---

## 5. Project Structure

Use domain-oriented organization.

Example:

```
src/
├── app/
│   ├── App.tsx
│   ├── providers.tsx
│   └── router.tsx
│
├── features/
│   ├── feature-a/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── feature-b/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── schemas/
│       ├── types/
│       └── utils/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
│
├── auth/
├── config/
├── layouts/
├── styles/
└── main.tsx
```

Keep the structure proportional to project complexity.

Do not create empty abstractions or unnecessary folders.

---

## 6. Lazy Loading and Performance

Lazy loading must be applied primarily at route or domain boundaries.

Requirements:

- Load domain code only when needed.
- Use React.lazy and Suspense or an equivalent supported mechanism.
- Split large bundles.
- Avoid eagerly importing every domain.
- Provide loading fallbacks.
- Handle failed dynamic imports.
- Avoid unnecessary dependencies.
- Optimize large lists and tables.
- Use server-side pagination for large datasets where appropriate.
- Avoid unnecessary re-renders.

Distinguish between:

- Lazy loading: defer loading code.
- Conditional rendering: determine whether UI is rendered.
- Memoization: reduce unnecessary recalculation or rendering.
- Code splitting: divide application bundles.

Do not use React.memo indiscriminately.

---

## 7. Authentication

Authentication must be centralized at the application level.

Keycloak is the preferred identity provider when the project requires centralized identity management, SSO, or integration with an existing Keycloak environment.

The authentication architecture should remain replaceable and should not couple every business component directly to a Keycloak SDK.

### Responsibilities

- Login.
- Logout.
- Session initialization.
- Token renewal.
- Authentication state.
- User identity.
- Session expiration.
- Authentication failure handling.

### Security Requirements

- Prefer Authorization Code Flow with PKCE.
- Use HTTPS in production.
- Configure exact redirect URIs.
- Configure trusted web origins.
- Never expose client secrets in browser applications.
- Do not store access tokens in localStorage.
- Do not log access tokens.
- Handle expired sessions safely.
- Avoid multiple independent authentication instances across remotes.

The Shell should provide a typed authentication contract to remote applications.

---

## 8. Authorization and Access Control

Authentication and authorization must remain separate concerns.

Authentication answers:

Who is the user?

Authorization answers:

What is the user allowed to do?

The backend is the trusted source of effective permissions.

Frontend responsibilities:

- Permission-aware navigation.
- Route guards.
- Component-level visibility.
- Action visibility.
- User experience based on permissions.

Backend responsibilities:

- Validate identity.
- Validate permissions.
- Enforce resource-level access.
- Enforce tenant boundaries.
- Protect every sensitive API operation.

Example permission identifiers:

```
resource.read
resource.create
resource.update
resource.delete
resource.approve
```

Use consistent permission naming conventions.

Never treat a hidden menu or disabled button as a security boundary.

---

## 9. Shared UI Kit

Create a shared UI Kit for reusable visual components.

Examples:

- Buttons.
- Inputs.
- Selects.
- Tables.
- Pagination.
- Dialogs.
- Modals.
- Dropdowns.
- Date pickers.
- Toast notifications.
- Loading states.
- Empty states.
- Error states.

Requirements:

- Consistent design tokens.
- Consistent typography.
- Consistent spacing.
- Accessible components.
- Responsive behavior.
- Documented component APIs.
- Versioned releases.

Do not put domain-specific business logic in generic UI components.

Distribute the UI Kit through a private package registry or an approved workspace strategy.

---

## 10. Shared Contracts

Use a shared contracts package for stable public interfaces.

Examples:

- Authentication context.
- User identity.
- Permission types.
- Remote application interfaces.
- Navigation metadata.
- Cross-application event contracts.

Requirements:

- Explicit TypeScript interfaces.
- Backward-compatible changes where possible.
- Semantic versioning.
- Documented breaking changes.

Do not turn shared contracts into a repository containing all domain models.

---

## 11. API Integration

Use a centralized API client per application.

Requirements:

- Configurable API base URL.
- Consistent error handling.
- Latest valid access token.
- Request cancellation.
- Timeout handling where appropriate.
- Separate handling for 401 and 403.
- Typed request and response contracts.
- No hardcoded environment-specific URLs.

Use TanStack Query for server state.

Keep API clients separate from UI components.

Example:

```
features/
└── feature-a/
    └── api/
        ├── feature-a.api.ts
        └── feature-a.queries.ts
```

Never invent backend API endpoints when requirements are unavailable.

---

## 12. State Management

Choose state management based on the actual state lifecycle.

| State                    | Recommended Approach     |
| ------------------------ | ------------------------ |
| Component state          | React useState           |
| Shared application state | React Context            |
| Server state             | TanStack Query           |
| URL state                | Router search parameters |
| Form state               | React Hook Form          |
| Complex client state     | Zustand when justified   |

Avoid unnecessary global state.

Do not duplicate server state in a client-side global store without a clear reason.

---

## 13. TypeScript and Coding Standards

Enable strict TypeScript.

Requirements:

- Avoid any.
- Prefer explicit types for public interfaces.
- Use unknown for genuinely unknown values.
- Avoid unnecessary type assertions.
- Avoid deeply nested conditional logic.
- Keep components focused.
- Keep business logic out of presentation components.
- Use descriptive names.
- Avoid premature abstractions.

Naming conventions:

| Element                     | Convention                                            |
| --------------------------- | ----------------------------------------------------- |
| Components                  | PascalCase                                            |
| Hooks                       | camelCase with use prefix                             |
| Utilities                   | camelCase                                             |
| Types                       | PascalCase                                            |
| Constants                   | UPPER_SNAKE_CASE                                      |
| Files containing components | PascalCase                                            |
| Configuration files         | descriptive kebab-case or established tool convention |

---

## 14. Styling and Design System

Use a consistent styling approach across applications.

Requirements:

- Reusable design tokens.
- Consistent colors.
- Consistent spacing.
- Consistent typography.
- Responsive layouts.
- Accessible contrast.
- Consistent interactive states.
- Avoid global CSS leakage across microfrontends.

Prefer CSS Modules or another scoped styling solution.

Shared design tokens should be distributed through the UI Kit.

Avoid arbitrary styling values when an approved design token exists.

---

## 15. Environment Configuration

All environment-specific values must be configurable.

Example:

```
VITE_APP_NAME=Application
VITE_API_BASE_URL=/api
VITE_KEYCLOAK_URL=https://auth.example.com
VITE_KEYCLOAK_REALM=example
VITE_KEYCLOAK_CLIENT_ID=frontend
```

Rules:

- Never hardcode production URLs.
- Never expose server secrets through VITE variables.
- Provide `.env.example`.
- Validate required configuration at application startup.
- Separate build-time configuration from runtime configuration.
- Use runtime configuration when deployment environments must change without rebuilding frontend assets.

Remember that Vite environment variables are embedded into the generated frontend bundle.

---

## 16. Docker and Deployment

Each independently deployed frontend application must have its own build pipeline and deployable artifact.

Recommended production architecture:

```
Frontend Repository
        |
        v
CI Pipeline
        |
        v
Bun Install
        |
        v
Lint / Type Check / Test
        |
        v
Vite Build
        |
        v
Docker Build
        |
        v
Container Registry
        |
        v
Kubernetes Deployment
        |
        v
Kubernetes Service
        |
        v
Ingress / Gateway
```

Use multi-stage Docker builds.

The production image should contain only the generated static assets and required web server.

Nginx or an equivalent static web server should:

- Serve static files.
- Configure SPA fallback routing.
- Set correct MIME types.
- Configure cache headers.
- Support remote application assets.
- Provide a health endpoint where appropriate.

Kubernetes deployment requirements:

- Readiness probes.
- Liveness probes.
- Resource requests and limits.
- Configurable replicas.
- Rolling updates.
- Immutable image tags.
- Rollback capability.
- Environment-specific configuration.

Do not assume Ingress automatically serves static assets.

---

## 17. Remote Asset Caching

Microfrontend deployments require special attention to asset caching.

Requirements:

- Content-hashed static assets may use long-lived immutable caching.
- Remote entry files must use revalidation or short-lived caching.
- Avoid indefinite caching of remote manifests or entry files.
- Keep old hashed chunks available during deployment transitions when necessary.
- Ensure Shell and remote contract compatibility.
- Test remote deployment and rollback scenarios.

Never allow a new remote entry file to reference assets that have already been removed from the server.

---

## 18. Testing

Use:

- Vitest for unit tests.
- React Testing Library for component tests.
- Playwright for end-to-end tests.

At minimum, cover:

- Authentication initialization.
- Permission handling.
- Route protection.
- API error handling.
- Loading states.
- Remote loading.
- Remote failure handling.
- Important application workflows.

Test shared integration contracts and compatibility between host and remote applications.

---

## 19. Error Handling and Observability

Handle errors consistently.

Categories:

- API errors.
- Network errors.
- Authentication errors.
- Authorization errors.
- Remote application failures.
- Unexpected application errors.

Requirements:

- Global Shell error boundary.
- Remote-level error boundaries.
- User-friendly error messages.
- Structured logging when available.
- No sensitive information in logs.
- No access token logging.
- Remote failures must not crash the entire application.

---

## 20. CI/CD and Code Quality

Each repository must have an independent CI/CD pipeline.

Recommended stages:

```
Install Dependencies
        |
        v
Lint
        |
        v
Type Check
        |
        v
Unit Tests
        |
        v
Production Build
        |
        v
Security Scan
        |
        v
Docker Build
        |
        v
Push Image
        |
        v
Deploy
```

Requirements:

- Commit lockfiles.
- Use frozen dependency installation in CI.
- Pin dependency versions.
- Enforce lint and type checking.
- Fail builds on errors.
- Use immutable production image tags.
- Keep deployment configuration version-controlled.

---

## 21. Development Workflow

Before implementing a feature:

1. Understand the feature requirements.
2. Identify its domain ownership.
3. Identify whether it belongs in Shell, a Remote, or a shared package.
4. Review existing architecture and contracts.
5. Reuse existing components and utilities.
6. Define API requirements.
7. Define permissions when applicable.
8. Implement the feature.
9. Add tests.
10. Verify production build.

Do not introduce architectural changes without a clear requirement.

---

## 22. Anti-Patterns

Avoid:

- Giant components.
- Giant global state stores.
- Unnecessary microfrontends.
- Microfrontend per small feature.
- Duplicated UI components.
- Duplicated authentication clients.
- Direct imports between remote internals.
- Unnecessary event buses.
- Uncontrolled global CSS.
- Hardcoded URLs.
- Secrets in frontend environment variables.
- Frontend-only authorization.
- Indefinite remote entry caching.
- Unversioned production images.
- Premature abstractions.
- Unnecessary dependencies.

---

## 23. Architecture Decision Principle

Always choose the simplest architecture that satisfies the actual requirements.

Use modular monolith by default.

Introduce microfrontend only when independent ownership, deployment, or runtime integration provides measurable value.

Do not optimize for theoretical future requirements at the cost of current maintainability.

Every major architectural decision should include:

- Problem being solved.
- Proposed approach.
- Trade-offs.
- Operational impact.
- Alternatives considered.

---

# Claude Code Instructions

This document is the engineering standard for the project.

Claude Code must follow these guidelines when generating, modifying, or reviewing frontend code.

Before starting implementation:

1. Inspect the existing repository.
2. Identify the application type: Shell, Remote, standalone application, or shared package.
3. Identify the existing technology versions.
4. Verify compatibility before installing dependencies.
5. Understand the project requirements.
6. Propose the implementation structure when architecture is not yet established.

During implementation:

- Follow domain-oriented organization.
- Reuse established project patterns.
- Avoid unnecessary abstractions.
- Do not invent business requirements or API endpoints.
- Do not generate unused modules.
- Do not create empty placeholder implementations.
- Keep changes focused.
- Preserve existing behavior unless explicitly asked to change it.

Before completing a task:

- Run lint.
- Run TypeScript checks.
- Run tests.
- Run production build.
- Fix errors introduced by the changes.
- Update documentation when architecture or developer workflows change.

The goal is maintainable, secure, consistent, and independently deployable frontend applications without unnecessary complexity.
