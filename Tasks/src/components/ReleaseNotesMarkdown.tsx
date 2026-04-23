import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Strip legacy "set to status" line from stored release notes for display */
export function sanitizeReleaseNotesForDisplay(notes: string): string {
  if (!notes || typeof notes !== 'string') return '';
  return notes
    .replace(/\*?Issues in this release have been set to status:[^\n]*\n?/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const ISSUE_KEY_REGEX = /^[A-Z][A-Z0-9]*-\d+$/;

export function ReleaseNotesMarkdownBody({
  notes,
  projectId,
  contentRef,
  className = '',
}: {
  notes: string;
  projectId?: string;
  contentRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  const sanitized = sanitizeReleaseNotesForDisplay(notes);
  const pid = projectId ?? '';

  return (
    <div
      ref={contentRef}
      className={`release-notes-markdown text-[color:var(--text-primary)] text-[14px] leading-relaxed ${className}`.trim()}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-[color:var(--text-primary)] mt-6 mb-2 first:mt-0 border-b border-[color:var(--border-subtle)] pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-[color:var(--text-primary)] mt-5 mb-2">{children}</h2>
          ),
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-[color:var(--border-subtle)]">
              <table className="w-full border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] font-medium">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[color:var(--border-subtle)]/70">{children}</tbody>
          ),
          tr: ({ children }) => <tr className="hover:bg-[color:var(--bg-surface)] transition">{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-[color:var(--text-primary)] font-semibold whitespace-nowrap">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-[color:var(--text-primary)] align-top max-w-md">{children}</td>
          ),
          ul: ({ children }) => <ul className="list-none space-y-2 my-3">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-baseline gap-2 pl-0">
              <span className="text-[color:var(--text-muted)] shrink-0">–</span>
              <span className="min-w-0">{children}</span>
            </li>
          ),
          strong: ({ children }) => {
            const raw = Array.isArray(children) ? children : [children];
            const text = raw.every((c) => typeof c === 'string')
              ? raw.join('').trim()
              : typeof children === 'string'
                ? children
                : null;
            if (text && ISSUE_KEY_REGEX.test(text) && pid) {
              return (
                <Link
                  to={`/projects/${pid}/issues/${encodeURIComponent(text)}`}
                  className="font-semibold text-[color:var(--text-primary)] underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {text}
                </Link>
              );
            }
            return <strong className="font-semibold text-[color:var(--text-primary)]">{children}</strong>;
          },
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
  );
}
