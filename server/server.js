'use strict';

const fs = require('node:fs');
const { stat } = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const port = Number.parseInt(process.env.PORT || '8080', 10);
const host = process.env.HOST || '0.0.0.0';
const version = process.env.VERSION || process.env.IMAGE_VERSION || '1.0.21';
const staticRoot = path.resolve(process.env.STATIC_ROOT || path.join(__dirname, '..', 'src'));
const bodyLimitBytes = Number.parseInt(process.env.REQUEST_BODY_LIMIT_BYTES || `${1024 * 1024}`, 10);
const upstreamTimeoutMs = Number.parseInt(process.env.UPSTREAM_TIMEOUT_MS || '30000', 10);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.csv', 'text/csv; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8']
]);

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}


function securityHeaders(extraHeaders = {}) {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "base-uri 'self'",
      "connect-src 'self' https://api.github.com",
      "frame-ancestors 'none'",
      "form-action 'none'",
      "img-src 'self' https://www.catonetworks.com data:",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'"
    ].join('; '),
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    ...extraHeaders
  };
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, securityHeaders({
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    ...headers
  }));
  res.end(JSON.stringify(payload));
}

function sendJsonError(res, error) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = statusCode === 500 ? 'Internal server error.' : error.message;
  sendJson(res, statusCode, { errors: [{ message }] });
}

async function readJsonBody(req) {
  const chunks = [];
  let bytes = 0;

  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > bodyLimitBytes) {
      throw new HttpError(413, 'Request body is too large.');
    }
    chunks.push(chunk);
  }

  if (bytes === 0) {
    throw new HttpError(400, 'Request body is required.');
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
}

function resolveTargetUrl(endpointValue) {
  if (typeof endpointValue !== 'string' || endpointValue.trim() === '') {
    throw new HttpError(400, 'A Cato API endpoint is required.');
  }

  let parsed;
  try {
    parsed = new URL(endpointValue.trim());
  } catch {
    throw new HttpError(400, 'Endpoint is not a valid URL.');
  }

  if (parsed.protocol !== 'https:') {
    throw new HttpError(400, 'Endpoint must use HTTPS.');
  }

  return parsed;
}

function validateGraphqlRequest(requestBody) {
  if (!requestBody || typeof requestBody !== 'object' || Array.isArray(requestBody)) {
    throw new HttpError(400, 'GraphQL request must be a JSON object.');
  }
  if (typeof requestBody.query !== 'string' || requestBody.query.trim() === '') {
    throw new HttpError(400, 'GraphQL request must include a query string.');
  }
  if (
    requestBody.variables !== undefined &&
    requestBody.variables !== null &&
    (typeof requestBody.variables !== 'object' || Array.isArray(requestBody.variables))
  ) {
    throw new HttpError(400, 'GraphQL variables must be a JSON object.');
  }
  if (
    requestBody.operationName !== undefined &&
    requestBody.operationName !== null &&
    typeof requestBody.operationName !== 'string'
  ) {
    throw new HttpError(400, 'GraphQL operationName must be a string.');
  }
}

function requestHeader(req, name) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

async function handleCatoProxy(req, res) {
  if (req.method !== 'POST') {
    throw new HttpError(405, 'Only POST is allowed.');
  }

  const apiKey = requestHeader(req, 'x-api-key');
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new HttpError(401, 'The x-api-key header is required.');
  }
  if (apiKey.length > 4096 || /[\r\n]/.test(apiKey)) {
    throw new HttpError(400, 'The x-api-key header is invalid.');
  }

  const payload = await readJsonBody(req);
  const targetUrl = resolveTargetUrl(payload.endpoint);
  validateGraphqlRequest(payload.request);

  const forceTracing = requestHeader(req, 'x-force-tracing');
  const upstreamHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': `Cato-API-Explorer/${version}`,
    'X-Api-Key': apiKey
  };

  if (forceTracing === 'true') {
    upstreamHeaders['x-force-tracing'] = 'true';
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), upstreamTimeoutMs);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(payload.request),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new HttpError(504, 'Cato API request timed out.');
    }
    throw new HttpError(502, 'Unable to reach the Cato API.');
  } finally {
    clearTimeout(timeout);
  }

  const responseText = await upstreamResponse.text();
  const traceId = upstreamResponse.headers.get('trace_id') || upstreamResponse.headers.get('x-trace-id');
  const durationMs = Date.now() - startedAt;

  console.info(JSON.stringify({
    event: 'cato_api_proxy',
    endpoint: targetUrl.origin,
    status: upstreamResponse.status,
    durationMs,
    traceId: traceId || undefined
  }));

  const headers = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Upstream-Status': String(upstreamResponse.status)
  };
  if (traceId) {
    headers['X-Trace-ID'] = traceId;
  }

  if (!isJson(responseText)) {
    sendJson(res, 502, {
      errors: [{ message: 'Cato API returned a non-JSON response.' }]
    }, headers);
    return;
  }

  res.writeHead(200, securityHeaders(headers));
  res.end(responseText);
}

function isJson(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function runtimeConfigScript() {
  const json = JSON.stringify({ version }).replace(/</g, '\\u003c');
  return `window.CATO_API_EXPLORER_CONFIG = ${json};\nwindow.DOCKER_VERSION = ${JSON.stringify(version)};\n`;
}

function safeStaticPath(urlPathname) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPathname);
  } catch {
    throw new HttpError(400, 'Invalid URL path.');
  }

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const filePath = path.resolve(staticRoot, `.${pathname}`);
  if (filePath !== staticRoot && !filePath.startsWith(`${staticRoot}${path.sep}`)) {
    throw new HttpError(403, 'Path is not allowed.');
  }
  return filePath;
}

async function handleStatic(req, res, parsedUrl) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    throw new HttpError(405, 'Only GET and HEAD are allowed.');
  }

  const filePath = safeStaticPath(parsedUrl.pathname);
  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    throw new HttpError(404, 'Not found.');
  }

  if (!fileStat.isFile()) {
    throw new HttpError(404, 'Not found.');
  }

  const extension = path.extname(filePath).toLowerCase();
  const isIndex = path.basename(filePath) === 'index.html';
  const headers = securityHeaders({
    'Cache-Control': isIndex ? 'no-store' : 'public, max-age=432000',
    'Content-Length': fileStat.size,
    'Content-Type': mimeTypes.get(extension) || 'application/octet-stream'
  });

  res.writeHead(200, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  fs.createReadStream(filePath).pipe(res);
}

async function handleRequest(req, res) {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (parsedUrl.pathname === '/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }
    if (parsedUrl.pathname === '/runtime-config.js') {
      const script = runtimeConfigScript();
      res.writeHead(200, securityHeaders({
        'Cache-Control': 'no-store',
        'Content-Length': Buffer.byteLength(script),
        'Content-Type': 'application/javascript; charset=utf-8'
      }));
      res.end(script);
      return;
    }
    if (parsedUrl.pathname === '/api/cato/graphql') {
      await handleCatoProxy(req, res);
      return;
    }
    await handleStatic(req, res, parsedUrl);
  } catch (error) {
    sendJsonError(res, error);
  }
}

const server = http.createServer(handleRequest);

server.listen(port, host, () => {
  console.info(`Cato API Explorer listening on http://${host}:${port}`);
});
