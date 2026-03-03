interface IssuesPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  updateUrl: (updates: { page: number }) => void;
}

export function IssuesPagination({
  page,
  totalPages,
  total,
  updateUrl,
}: IssuesPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => updateUrl({ page: page - 1 })}
        className="px-3 py-1.5 rounded-lg btn-secondary border text-[color:var(--text-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Previous
      </button>
      <span className="px-3 py-1.5 text-[color:var(--text-muted)] text-sm">
        Page {page} of {totalPages} · {total} total
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => updateUrl({ page: page + 1 })}
        className="px-3 py-1.5 rounded-lg btn-secondary border text-[color:var(--text-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Next
      </button>
    </div>
  );
}
