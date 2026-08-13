import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}

export function EmailField({ value, onChange, placeholder, autoComplete, error }: EmailFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="email" className="mono-label block text-parchment/60">
        邮箱
      </label>
      <input
        id="email"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'watchman@owlbyte.dev'}
        autoComplete={autoComplete ?? 'email'}
        required
        className={cn(
          'w-full rounded-full border bg-ink-800/60 px-5 py-3 text-sm text-parchment placeholder:text-parchment/30 outline-none transition-all duration-300',
          'focus:border-amber/60 focus:bg-ink-800 focus:shadow-glow-amber/30',
          error ? 'border-red-500/60' : 'border-parchment/15 hover:border-parchment/25'
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface PasswordFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  showToggle?: boolean;
  error?: string;
  label?: string;
}

export function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
  showToggle = true,
  error,
  label = '密码',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor="password" className="mono-label block text-parchment/60">
        {label}
      </label>
      <div className="relative">
        <input
          id="password"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••••'}
          autoComplete={autoComplete ?? 'current-password'}
          required
          className={cn(
            'w-full rounded-full border bg-ink-800/60 px-5 py-3 pr-12 text-sm text-parchment placeholder:text-parchment/30 outline-none transition-all duration-300',
            'focus:border-amber/60 focus:bg-ink-800 focus:shadow-glow-amber/30',
            error ? 'border-red-500/60' : 'border-parchment/15 hover:border-parchment/25'
          )}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-parchment/40 transition-colors hover:bg-parchment/5 hover:text-parchment/80"
            aria-label={visible ? '隐藏密码' : '显示密码'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface NicknameFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}

export function NicknameField({ value, onChange, placeholder, error }: NicknameFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="displayName" className="mono-label block text-parchment/60">
        昵称
      </label>
      <input
        id="displayName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '如何称呼你'}
        autoComplete="nickname"
        required
        className={cn(
          'w-full rounded-full border bg-ink-800/60 px-5 py-3 text-sm text-parchment placeholder:text-parchment/30 outline-none transition-all duration-300',
          'focus:border-amber/60 focus:bg-ink-800 focus:shadow-glow-amber/30',
          error ? 'border-red-500/60' : 'border-parchment/15 hover:border-parchment/25'
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}