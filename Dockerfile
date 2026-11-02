# syntax=docker/dockerfile:1

# ---- Build stage -------------------------------------------------------------
FROM oven/bun:1.4.4 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---- Runtime stage -----------------------------------------------------------
# Static assets + Nginx only. Runs as non-root and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/snippets/ /etc/nginx/snippets/
# Scripts in /docker-entrypoint.d/ run before Nginx starts.
COPY --chmod=0755 docker/40-app-config.sh /docker-entrypoint.d/40-app-config.sh
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080
