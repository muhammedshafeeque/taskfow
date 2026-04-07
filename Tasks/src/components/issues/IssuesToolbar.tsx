import {
  FiBookmark,
  FiCode,
  FiColumns,
  FiDownload,
  FiFilter,
  FiLayout,
  FiList,
  FiPlus,
  FiSliders,
} from 'react-icons/fi';
import { issuesApi } from '../../lib/api';
import type { ViewModeValue } from './constants';

const iconSm = 'h-3.5 w-3.5 shrink-0';

type FilterDropdownKey = 'status' | 'type' | 'priority' | 'assignee' | 'reporter' | 'labels' | 'storyPoints' | 'project';

interface IssuesToolbarProps {
  viewMode: ViewModeValue;
  updateUrl: (updates: { viewMode?: ViewModeValue }) => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  useJql: boolean;
  setFiltersOpen: (open: boolean) => void;
  setColumnsOpen: (open: boolean) => void;
  setJqlOpen: (fn: (o: boolean) => boolean) => void;
  setOpenFilterDropdown: (d: FilterDropdownKey | null) => void;
  buildListParams: (params: { page: number }) => Record<string, unknown>;
  openCreate: () => void;
  projectId: string | undefined;
  token: string | null;
  jql: string;
  canSaveFilter: boolean;
  onSaveFilterClick: () => void;
}

export function IssuesToolbar({
  viewMode,
  updateUrl,
  hasActiveFilters,
  activeFilterCount,
  useJql,
  setFiltersOpen,
  setColumnsOpen,
  setJqlOpen,
  setOpenFilterDropdown,
  buildListParams,
  openCreate,
  projectId,
  token,
  jql,
  canSaveFilter,
  onSaveFilterClick,
}: IssuesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 className="text-2xl font-bold tracking-tight shrink-0">Issues</h1>
      <div className="flex flex-wrap items-center justify-end gap-2 flex-1 min-w-0 ml-auto">
        <div className="flex rounded-md border border-[color:var(--border-subtle)] overflow-hidden bg-[color:var(--bg-surface)]" role="group" aria-label="View mode">
          <button
            type="button"
            onClick={() => updateUrl({ viewMode: 'table' })}
            title="View: Table"
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium transition ${viewMode === 'table' ? 'bg-[color:var(--accent)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-elevated)] hover:text-[color:var(--text-primary)]'}`}
          >
            <FiLayout className={iconSm} aria-hidden />
            Table
          </button>
          <button
            type="button"
            onClick={() => updateUrl({ viewMode: 'list' })}
            title="View: List"
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium transition ${viewMode === 'list' ? 'bg-[color:var(--accent)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-elevated)] hover:text-[color:var(--text-primary)]'}`}
          >
            <FiList className={iconSm} aria-hidden />
            List
          </button>
          <button
            type="button"
            onClick={() => updateUrl({ viewMode: 'kanban' })}
            title="View: Kanban"
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium transition ${viewMode === 'kanban' ? 'bg-[color:var(--accent)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-elevated)] hover:text-[color:var(--text-primary)]'}`}
          >
            <FiColumns className={iconSm} aria-hidden />
            Kanban
          </button>
        </div>
        {viewMode === 'table' && (
          <div className="relative">
            <button
              type="button"
              onClick={() => { setColumnsOpen(true); setOpenFilterDropdown(null); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-xs font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--bg-elevated)] hover:text-[color:var(--text-primary)] transition"
              title="Customize columns"
            >
              <FiSliders className={iconSm} aria-hidden />
              Columns
            </button>
          </div>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setFiltersOpen(true); setOpenFilterDropdown(null); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition ${
              hasActiveFilters
                ? 'bg-[color:var(--accent-subtle)] border-[color:var(--accent)] text-[color:var(--accent)]'
                : 'bg-[color:var(--bg-surface)] border-[color:var(--border-subtle)] text-[color:var(--text-muted)] hover:bg-[color:var(--bg-elevated)] hover:text-[color:var(--text-primary)]'
            }`}
          >
            <FiFilter className={iconSm} aria-hidden />
            Filter
            {activeFilterCount > 0 && (
              <span className="min-w-[1.25rem] h-5 px-1 rounded-full border border-[color:var(--accent)] text-[10px] font-medium text-[color:var(--text-primary)] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={onSaveFilterClick}
            disabled={!canSaveFilter}
            title={canSaveFilter ? 'Save current filters as a named filter' : 'Apply filters first to save'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition ${
              canSaveFilter
                ? 'bg-[color:var(--bg-surface)] border-[color:var(--border-subtle)] text-[color:var(--text-primary)] hover:bg-[color:var(--bg-page)]'
                : 'bg-[color:var(--bg-surface)] border-[color:var(--border-subtle)] text-[color:var(--text-muted)] cursor-not-allowed opacity-60'
            }`}
          >
            <FiBookmark className={iconSm} aria-hidden />
            Save filter
          </button>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setJqlOpen((o) => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition ${
              useJql
                ? 'bg-[color:var(--bg-page)] border-[color:var(--accent)] text-[color:var(--text-primary)]'
                : 'bg-[color:var(--bg-surface)] border-[color:var(--border-subtle)] text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)] hover:text-[color:var(--text-primary)]'
            }`}
            title='JQL: project = X, status = Done, assignee = me, text ~ "search", order by created DESC'
          >
            <FiCode className={iconSm} aria-hidden />
            Advanced search
            {useJql && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-[color:var(--accent)]/20 text-[color:var(--accent)]">
                JQL
              </span>
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (!token) return;
            const params: Record<string, string> = {};
            if (projectId) params.project = projectId;
            if (useJql && jql.trim()) {
              params.jql = jql.trim();
            } else {
              const lp = buildListParams({ page: 1 }) as Record<string, string | number | undefined>;
              if (lp.project) params.project = String(lp.project);
              if (lp.status) params.status = String(lp.status);
              if (lp.assignee) params.assignee = String(lp.assignee);
              if (lp.reporter) params.reporter = String(lp.reporter);
              if (lp.type) params.type = String(lp.type);
              if (lp.priority) params.priority = String(lp.priority);
              if (lp.labels) params.labels = String(lp.labels);
              if (lp.storyPoints) params.storyPoints = String(lp.storyPoints);
              if (lp.hasStoryPoints) params.hasStoryPoints = String(lp.hasStoryPoints);
            }
            const res = await issuesApi.downloadExcel(params, token);
            if (!res.success) {
              alert(res.message ?? 'Export failed');
            }
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] text-xs text-[color:var(--text-primary)] hover:bg-[color:var(--bg-page)]"
        >
          <FiDownload className={iconSm} aria-hidden />
          Export Excel
        </button>
        <button
          type="button"
          onClick={() => openCreate()}
          className="btn-primary btn-primary-sm shadow-md inline-flex items-center justify-center gap-1.5 font-semibold"
        >
          <FiPlus className={iconSm} aria-hidden />
          New issue
        </button>
      </div>
    </div>
  );
}
