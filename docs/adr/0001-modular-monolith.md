# ADR 0001: Start as a Modular Monolith

- **Status:** Accepted
- **Date:** 2026-11-02

## Problem

The project needs a frontend foundation before any business domains, team boundaries or deployment constraints are known.

## Decision

Build a single deployable React + Vite application, organized by domain under `src/features/<domain>/`. Load pages lazily at the route boundary. Do not use Module Federation.

## Trade-offs

- One build and one deployment: simple CI/CD, a single shared runtime, and no remote contract versioning.
- Domains cannot be deployed independently. Domain boundaries are kept by convention only (no cross-feature internal imports), not by repository separation.

## Operational Impact

- One Docker image (Nginx + static assets) and one pipeline.
- Runtime configuration (`/config.js`) lets the same image move between environments without a rebuild.

## Alternatives Considered

- **Microfrontend (Shell + Remotes via Module Federation):** rejected for now. There is no requirement yet for independent ownership or deployment, and it adds remote versioning, shared-dependency and caching complexity (guidelines §3.3, §17).

## Revisit When

- Several teams need to release domains independently, or
- one domain's release cadence or scale clearly diverges from the rest.

Moving later is easier if each feature exposes a small public entry point and other features never import its internals.
