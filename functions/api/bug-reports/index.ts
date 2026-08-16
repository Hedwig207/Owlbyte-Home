// GET  /api/bug-reports      → list all bug reports (public)
// POST /api/bug-reports      → submit a new bug report (public, rate-limited)
// @ts-nocheck

import {
  jsonResponse, errorResponse, checkRateLimit, isMockMode,
} from '../../_shared/utils';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 3600; // 1 hour

// In-memory mock store (per-isolate, ephemeral)
const mockBugReports: Array<{
  id: string;
  category: string;
  occurTime: string;
  reproduce: string;
  summary: string;
  contact?: string;
  createdAt: string;
  status: string;
}> = [];

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  if (request.method === 'GET') {
    return jsonResponse({ reports: mockBugReports });
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

    mockBugReports.unshift(item);

    return jsonResponse({ message: 'Bug 报告已提交', id: item.id }, 201);
  }

  return errorResponse('Method not allowed', 405);
}
