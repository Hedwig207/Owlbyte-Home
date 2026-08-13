import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

interface Props {
  content: string; // markdown 字符串
  className?: string;
}

// 配置 marked：相对链接 + break
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * 轻量 Markdown 渲染：marked 解析 + DOMPurify 防 XSSI
 * 复用主题色与代码块样式
 */
export default function MarkdownRenderer({ content, className }: Props) {
  const html = useMemo(() => {
    if (!content) return '';
    const raw = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [content]);

  if (!content) return null;

  return (
    <div
      className={cn(
        'markdown-body max-w-none text-parchment/85',
        // 标题
        '[&_h1]:display-serif [&_h1]:text-3xl [&_h1]:font-light [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-parchment',
        '[&_h2]:display-serif [&_h2]:text-2xl [&_h2]:font-light [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-parchment',
        '[&_h3]:display-serif [&_h3]:text-xl [&_h3]:font-light [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-parchment',
        '[&_h4]:text-lg [&_h4]:font-medium [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-parchment',
        // 段落与列表
        '[&_p]:leading-relaxed [&_p]:my-3',
        '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1.5',
        '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1.5',
        '[&_li]:leading-relaxed',
        // 强调与链接
        '[&_strong]:text-parchment [&_strong]:font-medium',
        '[&_em]:text-parchment/90',
        '[&_a]:text-amber [&_a]:underline [&_a]:decoration-amber/40 [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:decoration-amber',
        // 行内代码
        '[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-ink-700/60 [&_code]:text-moon',
        // 代码块
        '[&_pre]:bg-ink-950/80 [&_pre]:border [&_pre]:border-parchment/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto',
        '[&_pre_code]:bg-transparent [&_pre_code]:text-parchment/90 [&_pre_code]:p-0 [&_pre_code]:text-[0.85em]',
        // 引用
        '[&_blockquote]:border-l-2 [&_blockquote]:border-amber/40 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-parchment/70',
        // 表格
        '[&_table]:w-full [&_table]:my-4 [&_table]:border-collapse',
        '[&_th]:border [&_th]:border-parchment/15 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-ink-800/40 [&_th]:font-mono [&_th]:text-xs [&_th]:uppercase [&_th]:text-amber/80',
        '[&_td]:border [&_td]:border-parchment/10 [&_td]:px-3 [&_td]:py-2',
        // 水平线
        '[&_hr]:border-parchment/10 [&_hr]:my-6',
        // 图片
        '[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-3',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
