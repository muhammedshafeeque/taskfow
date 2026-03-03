import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Issue } from '../../lib/api';

type MetaGetter = (name: string) => { icon?: string; color?: string } | undefined;

interface IssuesKanbanViewProps {
  issues: Issue[];
  statusList: string[];
  projectId: string | undefined;
  getIssueKey: (issue: Issue) => string;
  getStatusMeta: MetaGetter;
  getTypeMeta: MetaGetter;
  getPriorityMeta: MetaGetter;
  openEdit: (issue: Issue) => void;
  setConfirmDeleteIssue: (issue: Issue | null) => void;
  kanbanUpdatingId: string | null;
  kanbanError: string | null;
  handleKanbanDragEnd: (ev: DragEndEvent) => void;
  kanbanSensors: ReturnType<typeof import('@dnd-kit/core').useSensors>;
  watchingStatus: Record<string, boolean>;
  watchingLoadingId: string | null;
  handleToggleWatch: (issueId: string) => void;
}

export function IssuesKanbanView({
  issues,
  statusList,
  projectId,
  getIssueKey,
  getStatusMeta,
  getTypeMeta,
  getPriorityMeta,
  openEdit,
  setConfirmDeleteIssue,
  kanbanUpdatingId,
  kanbanError,
  handleKanbanDragEnd,
  kanbanSensors,
  watchingStatus,
  watchingLoadingId,
  handleToggleWatch,
}: IssuesKanbanViewProps) {
  return (
    <div className="space-y-2">
      {kanbanError && (
        <p className="text-sm text-red-400" role="alert">{kanbanError}</p>
      )}
      <DndContext sensors={kanbanSensors} onDragEnd={handleKanbanDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1">
          {statusList.map((status) => {
            const columnIssues = issues.filter((i) => i.status === status);
            return (
              <KanbanColumn key={status} status={status} count={columnIssues.length} getStatusMeta={getStatusMeta}>
                {columnIssues.map((issue) => (
                  <KanbanCard
                    key={issue._id}
                    issue={issue}
                    projectId={projectId}
                    getIssueKey={getIssueKey}
                    getTypeMeta={getTypeMeta}
                    getPriorityMeta={getPriorityMeta}
                    openEdit={openEdit}
                    setConfirmDeleteIssue={setConfirmDeleteIssue}
                    isUpdating={kanbanUpdatingId === issue._id}
                    watching={watchingStatus[issue._id]}
                    watchingLoading={watchingLoadingId === issue._id}
                    onToggleWatch={() => handleToggleWatch(issue._id)}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
