// GET  /api/bug-reports      → list all bug reports (public)
// POST /api/bug-reports      → submit a new bug report (public, rate-limited)
// @ts-nocheck

import {
  jsonResponse, errorResponse, checkRateLimit,
  dbListBugReports, dbAddBugReport, isMockMode,
} from '../../_shared/utils';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 3600; // 1 hour

export async function onRequest(context: { request: Request; env: any; next: () => Promise<Response>; }): Promise<Response> {
  const { request, env } = context;
  if (request.method === 'GET') {
    const reports = await dbListBugReports(env, 100);
    return jsonResponse({ reports, mode: isMockMode(env) ? 'mock' : 'db' });
  }

  if (request.method === 'POST') {
    // Rate limiting by IP
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
    const rateKey = `rate_bug_${ip}`;
    if (!checkRateLimit(env, rateKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      return errorResponse('请求过于频繁，请稍后再试', 429);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body');
    }

    const { category, occurTime, reproduce, summary, contact } = body || {};

    // Validate required fields
    if (!category || !occurTime || !reproduce || !summary) {
      return errorResponse('Missing required fields: category, occurTime, reproduce, summary');
    }

    const item = {
      id: crypto.randomUUID(),
      category: String(category).slice(0, 50),
      occurTime: String(occurTime).slice(0, 200),
      reproduce: String(reproduce).slice(0, 2000),
      summary: String(summary).slice(0, 500),
      contact: contact ? String(contact).slice(0, 200) : undefined,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    const ok = await dbAddBugReport(env, item);
    if (!ok) {
      return errorResponse('Bug 报告存储失败，请稍后重试', 500);
    }

    return jsonResponse({ message: 'Bug 报告已提交', id: item.id }, 201);
  }

  return errorResponse('Method not allowed', 405);
}
