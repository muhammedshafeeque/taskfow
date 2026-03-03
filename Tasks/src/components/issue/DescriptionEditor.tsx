import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadFile } from '../../lib/api';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { marked } from 'marked';

interface DescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type JSONNode = {
  type?: string;
  text?: string;
  marks?: { type: string }[];
  content?: JSONNode[];
  attrs?: Record<string, unknown>;
};

function serializeNode(node: JSONNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content || []).map(serializeNode).filter(Boolean).join('\n\n');
    case 'paragraph': {
      const text = (node.content || []).map(serializeNode).join('');
      return text;
    }
    case 'text': {
      let text = node.text || '';
      const marks = node.marks || [];
      for (const mark of marks) {
        if (mark.type === 'bold') text = `**${text}**`;
        else if (mark.type === 'italic') text = `*${text}*`;
        else if (mark.type === 'strike') text = `~~${text}~~`;
        else if (mark.type === 'code') text = `\`${text}\``;
      }
      return text;
    }
    case 'bulletList':
      return (node.content || [])
        .map((item) => {
          const inner = serializeNode(item).replace(/\n/g, '\n  ');
          return `- ${inner}`;
        })
        .join('\n');
    case 'orderedList': {
      let index = 1;
      return (node.content || [])
        .map((item) => {
          const inner = serializeNode(item).replace(/\n/g, '\n   ');
          const line = `${index}. ${inner}`;
          index += 1;
          return line;
        })
        .join('\n');
    }
    case 'listItem':
      return (node.content || []).map(serializeNode).join('\n');
    case 'blockquote':
      return (node.content || [])
        .map(serializeNode)
        .join('\n')
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    case 'horizontalRule':
      return '---';
    case 'image': {
      const attrs = node.attrs || {};
      const alt = (attrs.alt as string) || '';
      const src = (attrs.src as string) || '';
      if (!src) return '';
      return `![${alt}](${src})`;
    }
    case 'table': {
      const rows = node.content || [];
      const lines: string[] = [];
      let isFirstRow = true;
      for (const row of rows) {
        if (row.type !== 'tableRow') continue;
        const cells = (row.content || []).map((c) => {
          const cellText = (c.content || [])
            .map(serializeNode)
            .join('')
            .trim()
            .replace(/\|/g, '\\|')
            .replace(/\n/g, ' ');
          return cellText;
        });
        lines.push('| ' + cells.join(' | ') + ' |');
        if (isFirstRow && cells.length > 0) {
          lines.push('| ' + cells.map(() => '---').join(' | ') + ' |');
          isFirstRow = false;
        }
      }
      return lines.join('\n');
    }
    case 'tableRow':
    case 'tableHeader':
    case 'tableCell':
      return (node.content || []).map(serializeNode).join('');
    default:
      return (node.content || []).map(serializeNode).join('\n');
  }
}

function getMarkdownFromEditor(editor: Editor | null): string {
  if (!editor) return '';
  const json = editor.getJSON() as JSONNode;
  return serializeNode(json).trim();
}

const FORMAT_BUTTONS = [
  { label: 'B', action: 'bold', title: 'Bold' },
  { label: 'I', action: 'italic', title: 'Italic' },
  { label: 'S', action: 'strike', title: 'Strikethrough' },
  { label: '</>', action: 'code', title: 'Code' },
  { label: '•', action: 'bulletList', title: 'Bullet list' },
  { label: '1.', action: 'orderedList', title: 'Numbered list' },
  { label: '""', action: 'blockquote', title: 'Quote' },
  { label: '—', action: 'divider', title: 'Divider' },
  { label: '⊞', action: 'table', title: 'Insert table' },
];

export default function DescriptionEditor({
  value,
  onChange,
  placeholder = 'Add a description…',
}: DescriptionEditorProps) {
  const { token } = useAuth();
  const lastSetValueRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'border-collapse w-full my-2 text-sm [&_th]:border [&_th]:border-[color:var(--border-subtle)] [&_th]:bg-[color:var(--bg-elevated)] [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_td]:border [&_td]:border-[color:var(--border-subtle)] [&_td]:px-2 [&_td]:py-1.5',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      attributes: {
        class:
          'min-h-[80px] px-3 py-1.5 bg-[color:var(--bg-page)] text-[color:var(--text-primary)] text-xs leading-relaxed outline-none rounded-b-md',
      },
      handleDrop(_view, event) {
        const dt = event.dataTransfer;
        const files = dt?.files;
        if (!files || files.length === 0) return false;
        event.preventDefault();
        const file = Array.from(files)[0];
        if (!file?.type.startsWith('image/')) return false;
        (async () => {
          const res = await uploadFile(file, token || undefined);
          if (res.success && res.data) {
            editor
              ?.chain()
              .focus()
              .setImage({ src: res.data.url, alt: res.data.originalName })
              .run();
          }
        })();
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor || value === undefined) return;
    if (value === lastSetValueRef.current) return;
    const html = value ? (marked.parse(value, { async: false }) as string) : '';
    editor.commands.setContent(html || '', false);
    lastSetValueRef.current = value;
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      const md = getMarkdownFromEditor(editor);
      lastSetValueRef.current = md;
      onChange(md);
    };
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, onChange]);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (!input.files || !input.files[0]) return;
      const res = await uploadFile(input.files[0], token || undefined);
      if (res.success && res.data) {
        editor
          ?.chain()
          .focus()
          .setImage({ src: res.data.url, alt: res.data.originalName })
          .run();
      }
    };
    input.click();
  };

  return (
    <div className="rounded-md border border-[color:var(--border-subtle)] overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)]">
        {FORMAT_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            onClick={() => {
              if (!editor) return;
              const chain = editor.chain().focus();
              switch (btn.action) {
                case 'bold':
                  chain.toggleBold().run();
                  break;
                case 'italic':
                  chain.toggleItalic().run();
                  break;
                case 'strike':
                  chain.toggleStrike().run();
                  break;
                case 'code':
                  chain.toggleCode().run();
                  break;
                case 'bulletList':
                  chain.toggleBulletList().run();
                  break;
                case 'orderedList':
                  chain.toggleOrderedList().run();
                  break;
                case 'blockquote':
                  chain.toggleBlockquote().run();
                  break;
                case 'divider':
                  chain.setHorizontalRule().run();
                  break;
                case 'table':
                  chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  break;
                default:
                  break;
              }
            }}
            className="w-7 h-7 rounded text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-page)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40 text-[10px] font-medium"
          >
            {btn.label}
          </button>
        ))}
        <div className="w-px h-4 bg-[color:var(--border-subtle)]/70 mx-1" />
        <button
          type="button"
          title="Insert image"
          onClick={handleImageUpload}
          className="w-7 h-7 rounded text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-page)] flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
