// GET /api/health
// Simple health check endpoint
// Returns: { status: "ok", time: ISO timestamp }
// @ts-nocheck

export function onRequest(context: { request: Request; env: any; next: () => Promise<Response>; ctx: any }): Response {
  const { request, env, ctx } = context;
  return new Response(JSON.stringify({
    status: 'ok',
    time: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
