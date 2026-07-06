# PHP → Node.js Migration Design

**Date:** 2026-07-05  
**Status:** Approved

## Context

The app currently runs PHP 7 + Apache + Nginx + supervisord inside an Alpine 3.13 container. A Node.js replacement (`server/server.js`) was written but never wired up — the Dockerfile still starts PHP, the volume mount path doesn't match what Node serves from, and the frontend still POSTs to the PHP proxy endpoint. This migration completes the cutover and purges all PHP artifacts.

## Architecture

**Before:**
```
Browser → nginx (8080) → PHP-FPM → src/ajax/cato_api_post.php → Cato API
                       ↘ Apache serves src/index.php as HTML
```

**After:**
```
Browser → Node.js (8080) → /api/cato/graphql handler → Cato API
                         ↘ static file handler serves src/index.html
                         ↘ /runtime-config.js handler injects version + servers
```

## Components

### 1. Dockerfile rewrite

Replace the entire Dockerfile with a Node.js image:

```dockerfile
FROM node:20-alpine
ENV VERSION=1.0.21
WORKDIR /app
COPY package.json ./
COPY server/ ./server/
COPY src/ ./src/
EXPOSE 8080
HEALTHCHECK --timeout=10s CMD wget -qO- http://127.0.0.1:8080/health || exit 1
USER node
CMD ["node", "server/server.js"]
```

- `STATIC_ROOT` defaults to `path.join(__dirname, '..', 'src')` = `/app/src` ✓
- Volume mount in docker-compose (`./src/:/app/src:ro`) already correct
- Healthcheck uses the `/health` endpoint already in `server/server.js`
- No npm install needed — `server/server.js` uses only Node built-ins

### 2. Frontend: `makeCall` in `src/js/cato/cato_common.js`

**Current (lines 1303–1367):**
- URL: `POST /ajax/cato_api_post.php?server=<url>&operation=<name>&isDevServer=<bool>`
- Headers: `x-api-key`, `x-account-id`, `User-Agent`, optionally `x-force-tracing`
- Body: raw GraphQL object `{query, variables, operationName}`

**New:**
- URL: `POST /api/cato/graphql`
- Headers: `x-api-key`, optionally `x-force-tracing` (drop `x-account-id` — not forwarded upstream, not needed)
- Body: `{endpoint: <url>, includeUndocumented: <bool>, request: {query, variables, operationName}}`

The `GET` branch for local schema loading (`catoConfig.schema.loadFromLocal`) is unchanged.

### 3. Files to delete

| Path | Reason |
|---|---|
| `AGENTS.md` | Duplicate of CLAUDE.md for Codex; not needed in repo |
| `src/index.php` | Replaced by `src/index.html` |
| `src/ajax/cato_api_post.php` | Replaced by `server/server.js` proxy handler |
| `src/functions.php` | PHP utility; no longer needed |
| `config/nginx.conf` | Nginx config; no longer needed |
| `config/fpm-pool.conf` | PHP-FPM config; no longer needed |
| `config/php.ini` | PHP config; no longer needed |
| `config/supervisord.conf` | Supervisord config; no longer needed |
| `tools/cato_executive_briefing.js` | Standalone utility; out of scope for this repo |
| `src/ajax/parsed_pop_locations_uniq.csv` | Not referenced anywhere in codebase |

### 4. `.gitignore` additions

```
reports/
node_modules/
```

### 5. CLAUDE.md update

Update stack description from PHP 7 / Nginx / Apache to Node.js 20 / Alpine. Update error log path from `/var/log/apache2/error_log` to `docker logs cato-api-explorer`.

## Data Flow: Proxy Request

```
Frontend makeCall()
  → POST /api/cato/graphql
  → Headers: { x-api-key, [x-force-tracing] }
  → Body: { endpoint, includeUndocumented, request: {query, variables, operationName} }

server.js handleCatoProxy()
  → validates x-api-key header
  → resolves endpoint against allowedEndpoints map
  → POSTs request body to Cato API with X-Api-Key header
  → returns upstream JSON response
  → sets X-Trace-ID and X-Upstream-Status response headers
```

## Error Handling

- `server.js` already returns structured JSON errors (`{errors: [{message}]}`) matching GraphQL error format — the existing `error` callback in `makeCall` handles these correctly
- 401 if `x-api-key` missing, 400 if endpoint not in allowlist, 504 on upstream timeout

## Verification

1. `docker compose build && docker compose up -d` — container starts, no PHP/Nginx in logs
2. `curl http://localhost:8084/health` → `{"status":"ok"}`
3. `curl http://localhost:8084/runtime-config.js` → JS with version and server list
4. Open `http://localhost:8084` → app loads, operations dropdown populates (schema introspection succeeds via new proxy)
5. Execute a query → response appears (full proxy round-trip works)
6. Enable Debug Trace-ID, execute → trace ID notification appears (header forwarding works)
