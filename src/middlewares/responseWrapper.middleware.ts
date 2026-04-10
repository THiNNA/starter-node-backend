import { Request, Response, NextFunction } from 'express';
import { API_PREFIX } from '../constants';

/**
 * Extract model name from the request URL.
 * e.g. /api/v1/auth/login → "auth", /api/v1/products/123 → "products"
 */
function extractModel(req: Request): string {
  // req.baseUrl for sub-routers: "/api/v1/auth", "/api/v1/users", etc.
  const base = req.baseUrl || '';
  const prefix = API_PREFIX + '/'; // "/api/v1/"
  const afterPrefix = base.startsWith(prefix) ? base.slice(prefix.length) : base.replace(/^\//, '');
  const segments = afterPrefix.split('/').filter(Boolean);

  if (segments.length > 0) {
    return segments[0];
  }

  // Fallback for routes mounted directly on the main router (e.g. /health)
  const routePath = req.route?.path || req.path || '';
  const routeSegments = routePath.split('/').filter(Boolean);
  return routeSegments[0] || 'unknown';
}

/**
 * Extract method/action name from the route path and HTTP method.
 * Named routes: /login → "login", /register → "register"
 * RESTful routes: GET / → "list", GET /:id → "detail", POST / → "create", etc.
 */
function extractMethod(req: Request): string {
  const routePath = req.route?.path || '';
  const httpMethod = req.method.toUpperCase();

  // Split route path into parts, e.g. "/admin/all" → ["admin", "all"], "/:id" → [":id"]
  const parts = routePath.split('/').filter(Boolean);

  // Find the first non-parameter segment as the action name
  const action = parts.find((p: string) => !p.startsWith(':'));
  if (action) {
    return action;
  }

  // RESTful fallback based on HTTP method
  const hasParam = parts.some((p: string) => p.startsWith(':'));
  switch (httpMethod) {
    case 'GET':
      return hasParam ? 'detail' : 'list';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return httpMethod.toLowerCase();
  }
}

/**
 * Fallback model/method extraction from URL path when req.route is unavailable
 * (e.g. inside the error handler).
 */
function extractFromUrl(url: string): { model: string; method: string } {
  const prefixPattern = /^\/api\/v\d+\//;
  const path = url.split('?')[0].replace(prefixPattern, '');
  const segments = path.split('/').filter(Boolean);
  const model = segments[0] || 'unknown';
  const method = segments[1] || segments[0] || 'unknown';
  return { model, method };
}

/**
 * Middleware that intercepts res.json() and wraps every JSON response
 * in the standard { head, body } envelope.
 *
 * - `model` is derived from the route module (auth, users, products, …)
 * - `method` is derived from the route action (login, list, detail, create, …)
 * - For error responses (status >= 400), errorflag is "Y" and errordesc
 *   is taken from the body's `message` property.
 */
export const responseWrapper = (_req: Request, res: Response, next: NextFunction): void => {
  const req = _req;
  const originalJson = res.json.bind(res);

  res.json = function wrappedJson(data?: unknown): Response {
    // Avoid double-wrapping if something already sends head/body
    if (data && typeof data === 'object' && 'head' in data && 'body' in data) {
      return originalJson(data);
    }

    // Extract model & method — prefer route-based when available, fall back to URL parsing
    let model: string;
    let method: string;

    if (req.route) {
      model = extractModel(req);
      method = extractMethod(req);
    } else {
      const fromUrl = extractFromUrl(req.originalUrl || req.url);
      model = fromUrl.model;
      method = fromUrl.method;
    }

    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    if (isError) {
      const dataObj = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
      const errordesc = typeof dataObj.message === 'string' ? dataObj.message : '';

      // Build the body without the `message` field (it goes into head.errordesc)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { message: _msg, ...rest } = dataObj;
      const body = Object.keys(rest).length > 0 ? rest : null;

      return originalJson({
        head: {
          model,
          method,
          errorcode: String(statusCode),
          errorflag: 'Y',
          errordesc,
        },
        body,
      });
    }

    return originalJson({
      head: {
        model,
        method,
        errorcode: '0',
        errorflag: 'N',
        errordesc: '',
      },
      body: data ?? null,
    });
  } as typeof res.json;

  next();
};
