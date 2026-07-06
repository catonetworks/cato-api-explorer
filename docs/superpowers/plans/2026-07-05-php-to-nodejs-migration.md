# PHP → Node.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the PHP 7 / Nginx / Apache / supervisord stack with the already-written Node.js server, wire up the frontend to the new proxy endpoint, and purge all PHP artifacts.

**Architecture:** The existing `server/server.js` (Node.js, no external deps) replaces both the static file server and `src/ajax/cato_api_post.php`. The frontend's `makeCall()` function changes its POST target from `/ajax/cato_api_post.php?server=...` to `/api/cato/graphql` with the GraphQL body wrapped in `{endpoint, includeUndocumented, request}`. The Dockerfile drops from ~50 lines of PHP/Nginx setup to a minimal Node.js image.

**Tech Stack:** Node.js 20 / Alpine Linux, jQuery $.ajax (frontend, unchanged library), Docker Compose for local dev

---

## File Map

| Action | Path | What changes |
|---|---|---|
| Rewrite | `Dockerfile` | Alpine+PHP+Nginx+supervisord → node:20-alpine + `node server/server.js` |
| Modify | `src/js/cato/cato_common.js` | `makeCall()`: URL, removed header, wrapped body |
| Modify | `.gitignore` | Add `reports/` and `node_modules/` |
| Modify | `CLAUDE.md` | Stack description, architecture diagram, key files table |
| Delete | `src/index.php` | Replaced by `src/index.html` |
| Delete | `src/ajax/cato_api_post.php` | Replaced by `server/server.js` |
| Delete | `src/ajax/parsed_pop_locations_uniq.csv` | Unused, no references in codebase |
| Delete | `src/functions.php` | Only included by `cato_api_post.php` |
| Delete | `config/nginx.conf` | Nginx config, no longer needed |
| Delete | `config/fpm-pool.conf` | PHP-FPM config, no longer needed |
| Delete | `config/php.ini` | PHP config, no longer needed |
| Delete | `config/supervisord.conf` | Supervisord config, no longer needed |
| Delete | `AGENTS.md` | Codex duplicate of CLAUDE.md, not needed |
| Delete | `tools/cato_executive_briefing.js` | Standalone utility, out of scope |

---

## Task 1: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add entries**

Open `.gitignore` and append two lines at the end:

```
reports/
node_modules/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add reports/ and node_modules/ to .gitignore"
```

---

## Task 2: Rewrite Dockerfile

**Files:**
- Rewrite: `Dockerfile`

The new Dockerfile drops all PHP/Nginx/supervisord layers. `server/server.js` uses only Node built-ins — no `npm install` needed. The healthcheck uses Node itself (guaranteed present) to hit the `/health` endpoint already implemented in `server/server.js`. The `ARG`/`LABEL` block is preserved for CI/CD pipeline compatibility — `server.js` reads `process.env.IMAGE_VERSION` as a version fallback.

- [ ] **Step 1: Replace Dockerfile entirely**

```dockerfile
FROM node:20-alpine

ENV VERSION=1.0.21

WORKDIR /app

COPY package.json ./
COPY server/ ./server/
COPY src/ ./src/

EXPOSE 8080

HEALTHCHECK --timeout=10s CMD node -e \
  "require('http').get('http://localhost:8080/health',r=>{process.exitCode=r.statusCode===200?0:1}).on('error',()=>process.exit(1))"

USER node

CMD ["node", "server/server.js"]

# Required build arguments (used by CI/CD release pipeline)
ARG NAME
ARG RELEASE_DATE
ARG GIT_SHA1
ARG TAGS

# Image build metadata
LABEL \
  vendor="Cato Networks, Inc." \
  maintainer="Brian Anderson <brian.anderson@catonetworks.com>" \
  com.catonetworks.image_name="${NAME}" \
  com.catonetworks.image_version="${VERSION}" \
  com.catonetworks.image_release_date="${RELEASE_DATE}" \
  com.catonetworks.image_tags="${TAGS}" \
  com.catonetworks.commit_id="${GIT_SHA1}"
```

- [ ] **Step 2: Verify it builds**

```bash
docker compose build
```

Expected: build completes with no errors. No PHP, no Nginx, no supervisord in the output.

- [ ] **Step 3: Commit**

```bash
git add Dockerfile
git commit -m "feat: replace PHP/Nginx/supervisord with Node.js 20 Alpine"
```

---

## Task 3: Update makeCall to use Node.js proxy

**Files:**
- Modify: `src/js/cato/cato_common.js:1303-1367`

Three surgical changes in `makeCall()`. The `isDevServer` variable (line 1303) is kept — it moves from a query param into the request body as `includeUndocumented`.

- [ ] **Step 1: Change the proxy URL (line 1304)**

Find:
```javascript
	var isDevServer = developmentServers[endpoint] ? true : false;
	var url = "/ajax/cato_api_post.php?server=" + endpoint + "&operation=" + operationName+"&isDevServer="+isDevServer;
```

Replace with:
```javascript
	var isDevServer = developmentServers[endpoint] ? true : false;
	var url = '/api/cato/graphql';
```

- [ ] **Step 2: Remove the x-account-id header (lines 1352-1357)**

Find:
```javascript
	var headers = {
		"Accept": "application/json",
		"x-api-key": api_key,
		"x-account-id": account_id,
		"User-Agent": "Cato-API-Explorer/v"+catoConfig.version
	};
```

Replace with:
```javascript
	var headers = {
		"Accept": "application/json",
		"x-api-key": api_key,
		"User-Agent": "Cato-API-Explorer/v"+catoConfig.version
	};
```

- [ ] **Step 3: Wrap the request body (line 1367)**

Find:
```javascript
		data: JSON.stringify(query),
```

Replace with:
```javascript
		data: JSON.stringify({endpoint: endpoint, includeUndocumented: isDevServer, request: query}),
```

Note: The `GET` branch for local schema loading (lines 1319-1323) sets `url = catoConfig.schema.fileName` and `method = "GET"` — jQuery ignores the body on GET requests, so this branch is unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/js/cato/cato_common.js
git commit -m "feat: update makeCall to use Node.js proxy endpoint /api/cato/graphql"
```

---

## Task 4: Delete PHP files and config directory

**Files:**
- Delete: `src/index.php`, `src/functions.php`, `src/ajax/cato_api_post.php`, `src/ajax/parsed_pop_locations_uniq.csv`
- Delete: `config/nginx.conf`, `config/fpm-pool.conf`, `config/php.ini`, `config/supervisord.conf`

- [ ] **Step 1: Remove PHP source files**

```bash
git rm src/index.php
git rm src/functions.php
git rm src/ajax/cato_api_post.php
git rm "src/ajax/parsed_pop_locations_uniq.csv"
```

- [ ] **Step 2: Remove config directory**

```bash
git rm config/nginx.conf
git rm config/fpm-pool.conf
git rm config/php.ini
git rm config/supervisord.conf
```

- [ ] **Step 3: Verify directories are empty (will be removed by git automatically)**

```bash
ls src/ajax/ 2>/dev/null && echo "not empty" || echo "empty/gone"
ls config/ 2>/dev/null && echo "not empty" || echo "empty/gone"
```

Expected: both show `empty/gone`

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove PHP proxy, config files, and unused data file"
```

---

## Task 5: Delete AGENTS.md and tools/

**Files:**
- Delete: `AGENTS.md`, `tools/cato_executive_briefing.js`

- [ ] **Step 1: Remove files**

```bash
git rm AGENTS.md
git rm tools/cato_executive_briefing.js
```

- [ ] **Step 2: Verify tools/ directory is gone**

```bash
ls tools/ 2>/dev/null && echo "not empty" || echo "empty/gone"
```

Expected: `empty/gone`

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove AGENTS.md and tools/cato_executive_briefing.js"
```

---

## Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

Six targeted edits — no full rewrite needed.

- [ ] **Step 1: Update stack line (line 9)**

Find:
```
**Stack:** PHP 7 (backend), JavaScript/jQuery (frontend), Nginx, Alpine Linux container
```
Replace with:
```
**Stack:** Node.js 20 (backend), JavaScript/jQuery (frontend), Alpine Linux container
```

- [ ] **Step 2: Remove Apache error log comment (line 29)**

Find and delete this line:
```
# Error logs: /var/log/apache2/error_log
```

- [ ] **Step 3: Update architecture diagram (lines 34-42)**

Find:
```
Browser UI (index.php + JavaScript)
         ↓
   AJAX requests
         ↓
src/ajax/cato_api_post.php (proxy handler)
         ↓
Cato GraphQL API (via CURL)
```
Replace with:
```
Browser UI (index.html + JavaScript)
         ↓
   AJAX requests
         ↓
server/server.js /api/cato/graphql (proxy handler)
         ↓
Cato GraphQL API (via Node fetch)
```

- [ ] **Step 4: Update proxy description (line 48)**

Find:
```
- PHP acts as CORS proxy, forwarding requests to Cato API with authentication headers
```
Replace with:
```
- Node.js acts as CORS proxy, forwarding requests to Cato API with authentication headers
- Static files served directly by Node.js from `src/`
- `/runtime-config.js` endpoint injects version and server list at runtime
```

- [ ] **Step 5: Update key files table (lines 54-55)**

Find:
```
| `src/index.php` | Main SPA entry point, renders tabbed UI |
| `src/ajax/cato_api_post.php` | API proxy - forwards GraphQL requests with auth headers |
```
Replace with:
```
| `src/index.html` | Main SPA entry point, renders tabbed UI |
| `server/server.js` | HTTP server - static files, API proxy, runtime config |
| `server/cato-endpoints.js` | Known Cato API endpoints and development server list |
```

- [ ] **Step 6: Update code examples note (line 93)**

Find:
```
3. Add corresponding HTML tab in index.php
```
Replace with:
```
3. Add corresponding HTML tab in `src/index.html`
```

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to reflect Node.js stack"
```

---

## Task 7: End-to-end verification

No code changes — this task verifies the full migration works.

- [ ] **Step 1: Rebuild and start container**

```bash
docker compose down && docker compose build && docker compose up -d
```

Expected: container starts. Check logs show `Cato API Explorer listening on http://0.0.0.0:8080`

```bash
docker logs cato-api-explorer
```

- [ ] **Step 2: Verify health endpoint**

```bash
curl -s http://localhost:8084/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 3: Verify runtime config is served**

```bash
curl -s http://localhost:8084/runtime-config.js | head -3
```

Expected: JavaScript starting with `window.CATO_API_EXPLORER_CONFIG = {...};`

- [ ] **Step 4: Verify app loads in browser**

Open `http://localhost:8084` — the app should load with the operations dropdown showing "Loading..." then populating with API operations. This confirms the full proxy round-trip (schema introspection via `/api/cato/graphql`) works.

- [ ] **Step 5: Verify proxy round-trip**

Select an API operation, fill in required fields, click Execute Query. Confirm a response appears in the API Response panel. This confirms the new proxy body format `{endpoint, includeUndocumented, request}` is accepted by `server/server.js`.

- [ ] **Step 6: Verify debug trace header**

Check the "Add Debug Trace-ID" checkbox, execute a query. Confirm a gritter notification appears with a Trace ID. This confirms `X-Trace-ID` header forwarding works end-to-end.

- [ ] **Step 7: Final commit (if any loose files)**

```bash
git status
```

All tracked files should be clean. If any untracked files remain unexpectedly, investigate before committing.
