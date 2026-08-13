// GET /api/health
// Simple health check endpoint
// Returns: { status: "ok", time: ISO timestamp }
// @ts-nocheck

export default function handler(request: Request, env: any, ctx: any): Response {
  return new Response(JSON.stringify({
    status: 'ok',
    time: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}