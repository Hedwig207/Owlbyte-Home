import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bug, ArrowLeft, Send, Trash2, Calendar, Tag, FileText, User, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

type BugCategory =
  | '首页'
  | '其他项目'
  | '登录系统'
  | '更新页'
  | '设置'
  | '命令面板'
  | '其他';

interface BugReportItem {
  id: string;
  category: BugCategory;
  occurTime: string;
  reproduce: string;
  summary: string;
  contact?: string;
  createdAt: string;
  status: 'open' | 'seen' | 'resolved';
}

const STORAGE_KEY = 'owlbyte:bug_reports';

const CATEGORIES: BugCategory[] = ['首页', '其他项目', '登录系统', '更新页', '设置', '命令面板', '其他'];

const CATEGORY_STYLE: Record<BugCategory, string> = {
  首页: 'border-amber/40 bg-amber/10 text-amber',
  其他项目: 'border-moon/40 bg-moon/10 text-moon',
  登录系统: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
  更新页: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  设置: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
  命令面板: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
  其他: 'border-parchment/30 bg-parchment/5 text-parchment/70',
};

const STATUS_STYLE: Record<BugReportItem['status'], { label: string; cls: string }> = {
  open: { label: '待处理', cls: 'border-rose-500/30 bg-rose-500/10 text-rose-400' },
  seen: { label: '已查看', cls: 'border-amber/30 bg-amber/10 text-amber' },
  resolved: { label: '已修复', cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
};

function loadReports(): BugReportItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BugReportItem[]) : [];
  } catch {
    return [];
  }
}

function saveReports(list: BugReportItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  const mo = Math.floor(day / 30);
  return `${mo} 个月前`;
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'bug-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function BugReportPage() {
  const [reports, setReports] = useState<BugReportItem[]>([]);
  const [category, setCategory] = useState<BugCategory>('首页');
  const [occurTime, setOccurTime] = useState('');
  const [reproduce, setReproduce] = useState('');
  const [summary, setSummary] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [cloudMode, setCloudMode] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    // 先加载本地数据（即时显示）
    setReports(loadReports());
    // 尝试从云端拉取
    fetch('/api/bug-reports')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.reports?.length) {
          setReports(data.reports);
          setCloudMode(true);
        }
      })
      .catch(() => { /* 后端不可用，保持本地模式 */ });
  }, []);

  const stats = useMemo(() => {
    const open = reports.filter(r => r.status === 'open').length;
    const seen = reports.filter(r => r.status === 'seen').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    return { total: reports.length, open, seen, resolved };
  }, [reports]);

  const isValid = category && occurTime.trim() && reproduce.trim() && summary.trim();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitMsg(null);
    const payload = {
      category,
      occurTime: occurTime.trim(),
      reproduce: reproduce.trim(),
      summary: summary.trim(),
      contact: contact.trim() || undefined,
    };
    try {
      // 尝试云端提交
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const item: BugReportItem = {
          id: data.id || uuid(),
          ...payload,
          createdAt: new Date().toISOString(),
          status: 'open',
        };
        setReports(prev => [item, ...prev]);
        setCloudMode(true);
        setSubmitMsg({ type: 'ok', text: 'Bug 已提交至云端，感谢你的守夜观察。' });
      } else {
        throw new Error('云端提交失败');
      }
    } catch {
      // Fallback: localStorage
      const item: BugReportItem = {
        id: uuid(),
        ...payload,
        createdAt: new Date().toISOString(),
        status: 'open',
      };
      const next = [item, ...reports];
      setReports(next);
      saveReports(next);
      setSubmitMsg({ type: 'ok', text: '云端不可用，已保存到本地。感谢你的守夜观察。' });
    } finally {
      setSubmitting(false);
      setCategory('首页');
      setOccurTime('');
      setReproduce('');
      setSummary('');
      setContact('');
      setTimeout(() => setSubmitMsg(null), 5000);
    }
  };

  const onDelete = (id: string) => {
    if (!confirm('确定要删除这条 Bug 报告吗？')) return;
    const next = reports.filter(r => r.id !== id);
    setReports(next);
    saveReports(next);
  };

  const onToggleStatus = (id: string) => {
    const order: BugReportItem['status'][] = ['open', 'seen', 'resolved'];
    const next = reports.map(r => {
      if (r.id !== id) return r;
      const idx = order.indexOf(r.status);
      return { ...r, status: order[(idx + 1) % order.length] };
    });
    setReports(next);
    saveReports(next);
  };

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-28 pb-24">
        <div className="container max-w-4xl">
          <Link
            to="/"
            className="mb-10 inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
          >
            <ArrowLeft className="h-4 w-4" />
            回到首页
          </Link>

          {/* Header */}
          <section className="mb-10">
            <div className="glass-panel rounded-3xl p-8 md:p-12">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                    <Bug className="h-6 w-6" />
                  </div>
                  <p className="mono-label text-rose-400/80">§ Bug Tracker</p>
                  <h1 className="mt-3 display-serif text-4xl font-light text-parchment md:text-6xl">
                    异常报告
                  </h1>
                  <p className="mt-5 text-sm leading-relaxed text-parchment/60 md:text-base">
                    守夜人在巡视中发现异常？留下记录，让我们共同修复。
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
                  <div className="inline-flex items-center gap-2 rounded-full border border-parchment/10 bg-ink-800/50 px-3 py-1.5 backdrop-blur-sm">
                    <span className="font-mono text-sm text-parchment">{stats.total}</span>
                    <span className="mono-label text-slate-fog">总报告</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/[0.05] px-3 py-1.5 backdrop-blur-sm">
                    <span className="font-mono text-sm text-rose-400">{stats.open}</span>
                    <span className="mono-label text-slate-fog">待处理</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/[0.05] px-3 py-1.5 backdrop-blur-sm">
                    <span className="font-mono text-sm text-amber">{stats.seen}</span>
                    <span className="mono-label text-slate-fog">已查看</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-1.5 backdrop-blur-sm">
                    <span className="font-mono text-sm text-emerald-400">{stats.resolved}</span>
                    <span className="mono-label text-slate-fog">已修复</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Submit Form */}
          <section className="mb-14">
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <h2 className="display-serif mb-6 text-2xl font-light text-parchment md:text-3xl">
                提交新报告
              </h2>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="mono-label flex items-center gap-1.5 text-parchment/60">
                      <Tag className="h-3.5 w-3.5" /> 类别 <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 font-mono text-xs transition-all',
                            category === c
                              ? CATEGORY_STYLE[c]
                              : 'border-parchment/10 bg-ink-800/30 text-parchment/50 hover:border-parchment/20 hover:text-parchment/70'
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="mono-label flex items-center gap-1.5 text-parchment/60">
                      <Calendar className="h-3.5 w-3.5" /> 出现时间 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={occurTime}
                      onChange={e => setOccurTime(e.target.value)}
                      className="w-full rounded-lg border border-parchment/10 bg-ink-800/40 px-4 py-2.5 text-sm text-parchment outline-none transition-colors focus:border-amber/50 placeholder:text-parchment/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="mono-label flex items-center gap-1.5 text-parchment/60">
                    <AlertTriangle className="h-3.5 w-3.5" /> 概述 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    placeholder="一句话描述遇到的问题，如：在作品详情页返回按钮会导致命令面板卡死"
                    maxLength={200}
                    className="w-full rounded-lg border border-parchment/10 bg-ink-800/40 px-4 py-2.5 text-sm text-parchment outline-none transition-colors focus:border-amber/50 placeholder:text-parchment/20"
                  />
                  <p className="mono-label text-right text-parchment/20">{summary.length}/200</p>
                </div>

                <div className="space-y-2">
                  <label className="mono-label flex items-center gap-1.5 text-parchment/60">
                    <FileText className="h-3.5 w-3.5" /> 复现方法 <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={reproduce}
                    onChange={e => setReproduce(e.target.value)}
                    placeholder={`1. 进入首页\n2. 点击右上角头像\n3. 下拉菜单无法弹出\n...`}
                    rows={6}
                    maxLength={2000}
                    className="w-full resize-y rounded-lg border border-parchment/10 bg-ink-800/40 px-4 py-3 text-sm leading-relaxed text-parchment outline-none transition-colors focus:border-amber/50 placeholder:text-parchment/20"
                  />
                  <p className="mono-label text-right text-parchment/20">{reproduce.length}/2000</p>
                </div>

                <div className="space-y-2">
                  <label className="mono-label flex items-center gap-1.5 text-parchment/60">
                    <User className="h-3.5 w-3.5" /> 联系方式（可选）
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="邮箱 / QQ / GitHub 账号等，方便我们进一步沟通"
                    maxLength={100}
                    className="w-full rounded-lg border border-parchment/10 bg-ink-800/40 px-4 py-2.5 text-sm text-parchment outline-none transition-colors focus:border-amber/50 placeholder:text-parchment/20"
                  />
                </div>

                {submitMsg && (
                  <div
                    className={cn(
                      'rounded-lg border px-4 py-3 text-sm',
                      submitMsg.type === 'ok'
                        ? 'border-emerald-500/30 bg-emerald-500/[0.05] text-emerald-400'
                        : 'border-rose-500/30 bg-rose-500/[0.05] text-rose-400'
                    )}
                  >
                    {submitMsg.text}
                  </div>
                )}

                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <p className="mono-label max-w-md text-parchment/30">
                    {cloudMode
                      ? '数据存储于云端服务器，所有访客共享。'
                      : '云端未连接，数据仅存储于本地浏览器（localStorage）。'}
                  </p>
                  <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-6 py-2.5 font-mono text-sm transition-all duration-300',
                      isValid && !submitting
                        ? 'border-amber/50 bg-amber/10 text-amber hover:bg-amber/20'
                        : 'cursor-not-allowed border-parchment/10 bg-parchment/[0.02] text-parchment/20'
                    )}
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? '提交中…' : '提交 Bug 报告'}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Report List */}
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="display-serif text-2xl font-light text-parchment md:text-3xl">
                历史记录
              </h2>
              {reports.length === 0 && (
                <span className="mono-label text-parchment/30">尚未收到报告</span>
              )}
            </div>

            {reports.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center">
                <Bug className="mx-auto h-10 w-10 text-parchment/20" />
                <p className="mt-4 text-sm text-parchment/40">
                  尚无记录 · 成为第一个观察到异常的守夜人
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(r => {
                  const statusStyle = STATUS_STYLE[r.status];
                  return (
                    <div
                      key={r.id}
                      className="glass-panel group rounded-2xl border p-5 transition-all duration-300 hover:border-amber/15 md:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn('rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem]', CATEGORY_STYLE[r.category])}>
                            {r.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleStatus(r.id)}
                            className={cn('rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] transition-colors hover:brightness-125', statusStyle.cls)}
                            title="点击切换状态：待处理 → 已查看 → 已修复"
                          >
                            {statusStyle.label}
                          </button>
                          <time className="mono-label text-slate-fog" dateTime={r.occurTime}>
                            出现于 {r.occurTime}
                          </time>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="mono-label text-parchment/30">
                            {timeAgo(r.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDelete(r.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-parchment/10 text-parchment/30 transition-all hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                            aria-label="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="mt-4 text-base font-medium text-parchment md:text-lg">
                        {r.summary}
                      </h3>

                      <details className="mt-3 group/details">
                        <summary className="mono-label flex cursor-pointer list-none items-center gap-1.5 text-parchment/40 transition-colors group-hover/details:text-parchment/60">
                          <span>复现方法 & 详情</span>
                          <span className="text-parchment/20">▾</span>
                        </summary>
                        <div className="mt-3 rounded-lg border border-parchment/8 bg-ink-800/30 p-4">
                          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-parchment/70">
{r.reproduce}
                          </pre>
                          {r.contact && (
                            <p className="mono-label mt-3 border-t border-parchment/8 pt-3 text-parchment/40">
                              联系方式：{r.contact}
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
