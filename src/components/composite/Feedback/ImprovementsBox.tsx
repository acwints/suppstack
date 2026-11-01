'use client';

import { FormEvent, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/app/supabase';
import { cn } from '@/lib/design-system';

const MAX_MESSAGE = 2000;

/**
 * Always-visible improvements prompt. One field, Enter or Send. No dialog.
 * Mounted by the app shell so it shows on the website and in the iOS shell.
 */
export function ImprovementsBox() {
  const pathname = usePathname();
  const bareChrome = pathname === '/login' || pathname === '/welcome';
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || message.trim().length === 0) return;
    setPending(true);
    setError(null);
    setSent(false);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          email,
          pagePath: pathname,
          companyUrl,
        }),
      });
      if (response.status === 429) {
        setError('Too many notes from this network. Try again later.');
        return;
      }
      if (!response.ok) {
        setError('Could not send that. Try again in a moment.');
        return;
      }
      setMessage('');
      setEmail('');
      setCompanyUrl('');
      setSent(true);
    } catch {
      setError('Could not send that. Try again in a moment.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      aria-label="Improvements"
      className={cn(
        'border-b border-gray-200 bg-white px-3 py-3 sm:px-6',
        bareChrome && 'pt-[max(0.75rem,env(safe-area-inset-top))]'
      )}
    >
      <form onSubmit={(event) => void submit(event)} className="mx-auto w-full max-w-3xl">
        <label htmlFor="improvements-note" className="block text-sm font-medium text-gray-900">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Improvements
          </span>
          How should SuppStack be different?
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="improvements-note"
            name="message"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              if (sent) setSent(false);
            }}
            maxLength={MAX_MESSAGE}
            required
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 rounded border border-gray-300 bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <button
            type="submit"
            disabled={pending || message.trim().length === 0}
            className="inline-flex min-h-11 shrink-0 items-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {pending ? 'Sending' : 'Send'}
          </button>
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-900">
            Email, if you want a reply
          </summary>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            maxLength={320}
            aria-label="Email, optional"
            className="mt-2 min-h-11 w-full rounded border border-gray-300 px-3 text-base text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </details>
        <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="improvements-company-url">Company URL</label>
          <input
            id="improvements-company-url"
            name="companyUrl"
            tabIndex={-1}
            autoComplete="off"
            value={companyUrl}
            onChange={(event) => setCompanyUrl(event.target.value)}
          />
        </div>
        {sent ? (
          <p className="mt-2 text-sm text-gray-700" role="status">
            Thanks. Noted.
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm text-error-700" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
