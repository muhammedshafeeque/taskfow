import { createPortal } from 'react-dom';
import { MetaIconGlyph, type MetaIconKey } from '../../pages/ProjectSettings';
import { STORY_POINT_OPTIONS } from './constants';
import type { FiltersShape } from './constants';
import type { User, Project } from '../../lib/api';

type FilterDropdownKey = 'status' | 'type' | 'priority' | 'assignee' | 'reporter' | 'labels' | 'storyPoints' | 'project';

type MetaGetter = (name: string) => { icon?: string; color?: string } | undefined;

interface IssuesFilterModalProps {
  filtersOpen: boolean;
  setFiltersOpen: (v: boolean) => void;
  openFilterDropdown: FilterDropdownKey | null;
  setOpenFilterDropdown: (d: FilterDropdownKey | null) => void;
  filters: FiltersShape;
  toggleFilter: <K extends keyof FiltersShape>(key: K, value: string) => void;
  setHasStoryPointsFilter: (noStoryPoints: boolean) => void;
  statusList: string[];
  typeList: string[];
  priorityList: string[];
  users: User[];
  allLabels: string[];
  getStatusMeta: MetaGetter;
  getTypeMeta: MetaGetter;
  getPriorityMeta: MetaGetter;
  updateUrl: (updates: { filters: FiltersShape; page?: number }) => void;
  saveFilterName: string;
  setSaveFilterName: (v: string) => void;
  saveCurrentFilter: (name: string) => void;
  hasActiveFilters: boolean;
  projects?: Project[];
}

const EMPTY_FILTERS: FiltersShape = {
  project: [],
  status: [],
  assignee: [],
  reporter: [],
  type: [],
  priority: [],
  labels: [],
  storyPoints: [],
  hasStoryPoints: undefined,
};

function FilterOption({
  label,
  selected,
  onClick,
  meta,
  metaKey,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  meta?: { icon?: string; color?: string };
  metaKey?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs ${
        selected ? 'bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-surface)]'
      }`}
    >
      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] ${selected ? 'border-[color:var(--accent)]' : 'border-[color:var(--border-subtle)]'}`}>
        {selected && '✓'}
      </span>
      {meta?.icon && metaKey && (
        <span style={meta.color ? { color: meta.color } : undefined}>
          <MetaIconGlyph icon={meta.icon as MetaIconKey} className="w-3.5 h-3.5" />
        </span>
      )}
      {meta?.color && <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: meta.color }} />}
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  selectedCount,
  allLabel,
  isOpen,
  onToggle,
  children,
}: {
  label?: string;
  selectedCount: number;
  allLabel: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {label && <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">{label}</label>}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-left text-xs text-[color:var(--text-primary)]"
      >
        <span>{selectedCount ? `${selectedCount} selected` : allLabel}</span>
        <span className="text-[color:var(--text-muted)]">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full py-1 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] shadow-xl max-h-48 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

export function IssuesFilterModal(props: IssuesFilterModalProps) {
  const {
    filtersOpen,
    setFiltersOpen,
    openFilterDropdown,
    setOpenFilterDropdown,
    filters,
    toggleFilter,
    setHasStoryPointsFilter,
    statusList,
    typeList,
    priorityList,
    users,
    allLabels,
    getStatusMeta,
    getTypeMeta,
    getPriorityMeta,
    updateUrl,
    saveFilterName,
    setSaveFilterName,
    saveCurrentFilter,
    hasActiveFilters,
    projects = [],
  } = props;

  const showProjectFilter = projects.length > 0;

  if (!filtersOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={() => { setFiltersOpen(false); setOpenFilterDropdown(null); }}
    >
      <div
        className="w-full max-w-sm bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] rounded-2xl p-6 shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-[color:var(--text-primary)] mb-3">Filter issues</h2>
        <div className="space-y-3">
          {showProjectFilter && (
            <FilterSelect label="Project" selectedCount={filters.project?.length ?? 0} allLabel="All projects" isOpen={openFilterDropdown === 'project'} onToggle={() => setOpenFilterDropdown(openFilterDropdown === 'project' ? null : 'project')}>
              {projects.map((p) => (
                <FilterOption key={p._id} label={`${p.name} (${p.key})`} selected={(filters.project ?? []).includes(p._id)} onClick={() => toggleFilter('project', p._id)} />
              ))}
            </FilterSelect>
          )}
          <FilterSelect label="Status" selectedCount={filters.status.length} allLabel="All statuses" isOpen={openFilterDropdown === 'status'} onToggle={() => setOpenFilterDropdown(openFilterDropdown === 'status' ? null : 'status')}>
            {statusList.map((s) => (
              <FilterOption key={s} label={s} selected={filters.status.includes(s)} onClick={() => toggleFilter('status', s)} meta={getStatusMeta(s)} metaKey={getStatusMeta(s)?.icon} />
            ))}
          </FilterSelect>
          <FilterSelect label="Type" selectedCount={filters.type.length} allLabel="All types" isOpen={openFilterDropdown === 'type'} onToggle={() => setOpenFilterDropdown(openFilterDropdown === 'type' ? null : 'type')}>
            {typeList.map((t) => (
              <FilterOption key={t} label={t} selected={filters.type.includes(t)} onClick={() => toggleFilter('type', t)} meta={getTypeMeta(t)} metaKey={getTypeMeta(t)?.icon} />
            ))}
          </FilterSelect>
          <FilterSelect label="Priority" selectedCount={filters.priority.length} allLabel="All priorities" isOpen={openFilterDropdown === 'priority'} onToggle={() => setOpenFilterDropdown(openFilterDropdown === 'priority' ? null : 'priority')}>
            {priorityList.map((p) => (
              <FilterOption key={p} label={p} selected={filters.priority.includes(p)} onClick={() => toggleFilter('priority', p)} meta={getPriorityMeta(p)} metaKey={getPriorityMeta(p)?.icon} />
            ))}
          </FilterSelect>
          <FilterSelect label="Assignee" selectedCount={filters.assignee.length} allLabel="All assignees" isOpen={openFilterDropdown === 'assignee'} onToggle={() => setOpenFilterDropdown(openFilterDropdown === 'assignee' ? null : 'assignee')}>
            {users.map((u) => (
              <FilterOption key={u._id} label={u.name} selected={filters.assignee.includes(u._id)} onClick={() => toggleFilter('assignee', u._id)} />
            ))}
          </FilterSelect>
          <FilterSelect label="Reporter" selectedCount={filters.reporter.length} allLabel="All reporters" isOpen={openFilterDropdown === 'reporter'} onToggle={() => setOpenFilterDropdown(openFilterDropdown === 'reporter' ? null : 'reporter')}>
            {users.map((u) => (
              <FilterOption key={u._id} label={u.name} selected={filters.reporter.includes(u._id)} onClick={() => toggleFilter('reporter', u._id)} />
            ))}
          </FilterSelect>
          <FilterSelect label="Labels" selectedCount={filters.labels.length} allLabel="All labels" isOpen={openFilterDropdown === 'labels'} onToggle={() => setOpenFilterDropdown(openFilterDropdown === 'labels' ? null : 'labels')}>
            {allLabels.length === 0 ? (
              <div className="px-3 py-2 text-[color:var(--text-muted)] text-xs">No labels in issues yet</div>
            ) : (
              allLabels.map((label) => (
                <FilterOption key={label} label={label} selected={filters.labels.includes(label)} onClick={() => toggleFilter('labels', label)} />
              ))
            )}
          </FilterSelect>
          <div className="relative">
            <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Story points</label>
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasStoryPoints === false}
                  onChange={(e) => setHasStoryPointsFilter(e.target.checked)}
                  className="rounded border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-[color:var(--accent)]"
                />
                <span className="text-xs text-[color:var(--text-primary)]">No story points</span>
              </label>
            </div>
            <FilterSelect selectedCount={filters.storyPoints.length} allLabel="Any story points" isOpen={openFilterDropdown === 'storyPoints'} onToggle={() => setOpenFilterDropdown(openFilterDropdown === 'storyPoints' ? null : 'storyPoints')}>
              {STORY_POINT_OPTIONS.map((sp) => (
                <FilterOption key={sp} label={sp} selected={filters.storyPoints.includes(sp)} onClick={() => toggleFilter('storyPoints', sp)} />
              ))}
            </FilterSelect>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                updateUrl({ filters: EMPTY_FILTERS, page: 1 });
                setFiltersOpen(false);
                setOpenFilterDropdown(null);
              }}
              className="px-3 py-1.5 rounded-md text-xs text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)] hover:text-[color:var(--text-primary)]"
            >
              Clear all
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              placeholder="Save as..."
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              className="px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-xs w-32 placeholder-[color:var(--text-muted)]"
            />
            <button
              type="button"
              onClick={() => saveCurrentFilter(saveFilterName)}
              disabled={!saveFilterName.trim()}
              className="px-3 py-2 rounded-lg text-sm text-[color:var(--text-primary)] hover:bg-[color:var(--bg-button-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save filter
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setFiltersOpen(false); setOpenFilterDropdown(null); }}
            className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-xs text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface)] font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
