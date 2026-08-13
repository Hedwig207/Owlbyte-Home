import { Component, type ReactNode, type ErrorInfo } from 'react';
import { useErrorLogStore } from '@/stores/errorLogStore';
import { cn } from '@/lib/utils';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const context = info.componentStack ?? 'ErrorBoundary.catch';
    useErrorLogStore.getState().addLog({
      level: 'error',
      message: `[${context}] ${error.message}`,
      stack: error.stack,
      url: window.location.href,
    });
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-ink-900/80 p-8 text-center">
            <p className="mono-label text-red-400">§ RUNTIME ERROR</p>
            <h2 className="mt-3 display-serif text-2xl font-light text-parchment">
              夜间观察中断
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-parchment/70">
              这部分页面发生了意外错误。错误已被记录到调试日志中，你可以：
            </p>
            <details className="mt-4 rounded-lg border border-parchment/10 bg-ink-950/50 p-3 text-left text-xs">
              <summary className="cursor-pointer text-parchment/60">查看错误详情</summary>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-slate-mist break-words">
                {this.state.error?.stack ?? this.state.error?.message}
              </pre>
            </details>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button className="btn-ghost !text-xs" onClick={() => location.reload()}>
                刷新页面
              </button>
              <button className="btn-primary !text-xs" onClick={this.handleReset}>
                尝试重试
              </button>
            </div>
            <p className="mt-4 font-mono text-[0.6rem] text-slate-fog/60">
              在 /settings 错误日志页查看完整记录
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
