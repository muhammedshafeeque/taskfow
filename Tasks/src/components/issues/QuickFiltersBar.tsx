import type { QuickFilterValue } from './constants';

export interface SavedFilter {
  id: string;
  name: string;
  filters: {
    project?: string[];
    status: string[];
    assignee: string[];
    reporter: string[];
    type: string[];
    priority: string[];
    labels: string[];
    storyPoints: string[];
    hasStoryPoints?: boolean;
  };
  quickFilter: QuickFilterValue;
  jql?: string;
  viewMode?: 'list' | 'table' | 'kanban';
}

interface QuickFiltersBarProps {
  quickFilter: QuickFilterValue;
  updateUrl: (updates: { quickFilter?: QuickFilterValue; page?: number }) => void;
  savedFilters: SavedFilter[];
  savedFiltersLoading: boolean;
  savedFiltersError: string | null;
  applySavedFilter: (sf: SavedFilter) => void;
  removeSavedFilter: (id: string) => void;
}

export function QuickFiltersBar({
  quickFilter,
  updateUrl,
  savedFilters,
  savedFiltersLoading,
  savedFiltersError,
  applySavedFilter,
  removeSavedFilter,
}: QuickFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 py-3 border-b border-[color:var(--border-subtle)]">
      <span className="text-[11px] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider">Quick filters</span>
      <div className="flex rounded-lg border border-[color:var(--border-subtle)] overflow-hidden bg-[color:var(--bg-surface)]">
        <button
          type="button"
          onClick={() => updateUrl({ quickFilter: 'my', page: 1 })}
          className={`px-3 py-1.5 text-xs transition ${
            quickFilter === 'my'
              ? 'bg-[color:var(--bg-page)] text-[color:var(--text-primary)]'
              : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)]'
          }`}
        >
          My open issues
        </button>
        <button
          type="button"
          onClick={() => updateUrl({ quickFilter: 'open', page: 1 })}
          className={`px-3 py-1.5 text-xs transition ${
            quickFilter === 'open'
              ? 'bg-[color:var(--bg-page)] text-[color:var(--text-primary)]'
              : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)]'
          }`}
        >
          Open issues
        </button>
        <button
          type="button"
          onClick={() => updateUrl({ quickFilter: 'all', page: 1 })}
          className={`px-3 py-1.5 text-xs transition ${
            quickFilter === 'all'
              ? 'bg-[color:var(--bg-page)] text-[color:var(--text-primary)]'
              : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)]'
          }`}
        >
          All issues
        </button>
      </div>
      {(savedFiltersLoading || savedFilters.length > 0 || savedFiltersError) ? (
        <>
          <span className="text-[11px] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider ml-2">Saved</span>
          {savedFiltersError && (
            <span className="text-xs text-red-500 ml-1">{savedFiltersError}</span>
          )}
          {savedFiltersLoading ? (
            <span className="text-xs text-[color:var(--text-muted)] ml-1">Loading…</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((sf) => (
                <span
                  key={sf.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] text-xs border border-[color:var(--border-subtle)]"
                >
                  <button
                    type="button"
                    onClick={() => applySavedFilter(sf)}
                    className="hover:text-white font-medium"
                  >
                    {sf.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSavedFilter(sf.id)}
                    className="text-[color:var(--text-muted)] hover:text-red-500 text-lg leading-none"
                    aria-label="Remove saved filter"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
