/**
 * Extracts user IDs from @mention patterns in text.
 * Supports:
 * - Markdown style: @[Display Name](userId)
 * - HTML/TipTap style: data-type="mention" data-id="userId" or data-id="userId"
 */
const MARKDOWN_MENTION_REGEX = /@\[[^\]]*\]\(([a-fA-F0-9]{24})\)/g;
const HTML_MENTION_REGEX = /data-(?:type="mention"[^>]*data-id|id)="([a-fA-F0-9]{24})"/g;

export function extractMentionedUserIds(body: string): string[] {
  if (!body || typeof body !== 'string') return [];
  const ids = new Set<string>();

  let m: RegExpExecArray | null;
  const mdRegex = new RegExp(MARKDOWN_MENTION_REGEX.source, 'g');
  while ((m = mdRegex.exec(body)) !== null) {
    ids.add(m[1]);
  }

  const htmlRegex = new RegExp(HTML_MENTION_REGEX.source, 'g');
  while ((m = htmlRegex.exec(body)) !== null) {
    ids.add(m[1]);
  }

  return Array.from(ids);
}
