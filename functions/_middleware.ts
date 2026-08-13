// Global middleware for Cloudflare Pages Functions
// Handles CORS and OPTIONS preflight for all API routes
// @ts-nocheck

function getCorsHeaders(request: Request): Record<string,string> {
  const origin = (request as any).headers?.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Content-Type, Set-Cookie',
  };
}

export default function handler(request: Request, env: any, ctx: any): Response | Promise<Response> {
  const corsHeaders = getCorsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...getCorsHeaders(request),
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  return ctx.next().then((response: Response) => {
    const newResponse = new Response(response.body, response);
    const customHeaders: Record<string, string> = {};
    for (const [key, value] of response.headers.entries()) {
      customHeaders[key] = value;
    }
    const mergedHeaders = { ...getCorsHeaders(request), ...customHeaders };
    for (const [key, value] of Object.entries(mergedHeaders)) {
      newResponse.headers.set(key, value);
    }
    return newResponse;
  });
}
