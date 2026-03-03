import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Issue } from '../../lib/api';

interface TaskDescriptionProps {
  issue: Issue;
}

function DescriptionBody({ body }: { body: string }) {
  const parts: { type: 'text' | 'video'; content: string }[] = [];
  const videoRegex = /\[video\]\((https?:\/\/[^)]+)\)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = videoRegex.exec(body)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: body.slice(lastIndex, m.index) });
    }
    parts.push({ type: 'video', content: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < body.length) {
    parts.push({ type: 'text', content: body.slice(lastIndex) });
  }
  if (parts.length === 0) {
    parts.push({ type: 'text', content: body });
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none break-words [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-[color:var(--border-subtle)]">
      {parts.map((part, i) =>
        part.type === 'video' ? (
          <video
            key={i}
            controls
            className="w-full max-w-lg my-2 rounded-lg border border-[color:var(--border-subtle)]"
            src={part.content}
          />
        ) : (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
            {part.content}
          </ReactMarkdown>
        )
      )}
    </div>
  );
}

export default function TaskDescription({ issue }: TaskDescriptionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold text-[color:var(--text-muted)] uppercase tracking-wider mb-2">
        Description
      </h2>
      <div className="rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-4">
        {issue.description ? (
          <DescriptionBody body={issue.description} />
        ) : (
          <p className="text-xs text-[color:var(--text-muted)] italic">Add a description…</p>
        )}
      </div>
    </section>
  );
}
