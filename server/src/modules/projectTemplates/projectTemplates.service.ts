import { ProjectTemplate } from './projectTemplate.model';

const DEFAULT_STATUSES = [
  { id: 'backlog', name: 'Backlog', order: 0 },
  { id: 'todo', name: 'Todo', order: 1 },
  { id: 'inprogress', name: 'In Progress', order: 2 },
  { id: 'done', name: 'Done', order: 3 },
];

const DEFAULT_ISSUE_TYPES = [
  { id: 'task', name: 'Task', order: 0 },
  { id: 'bug', name: 'Bug', order: 1 },
  { id: 'story', name: 'Story', order: 2 },
  { id: 'epic', name: 'Epic', order: 3 },
];

const DEFAULT_PRIORITIES = [
  { id: 'lowest', name: 'Lowest', order: 0 },
  { id: 'low', name: 'Low', order: 1 },
  { id: 'medium', name: 'Medium', order: 2 },
  { id: 'high', name: 'High', order: 3 },
  { id: 'highest', name: 'Highest', order: 4 },
];

export async function list(): Promise<unknown[]> {
  const list = await ProjectTemplate.find().sort({ name: 1 }).lean();
  if (list.length === 0) {
    const defaultConfig = getDefaultConfig();
    return [{
      _id: 'default',
      name: 'Default',
      description: 'Standard project with Backlog, Todo, In Progress, Done',
      statuses: defaultConfig.statuses,
      issueTypes: defaultConfig.issueTypes,
      priorities: defaultConfig.priorities,
    }];
  }
  return list;
}

export async function getById(templateId: string): Promise<unknown | null> {
  if (templateId === 'default') {
    const config = getDefaultConfig();
    return { _id: 'default', name: 'Default', description: '', ...config };
  }
  const doc = await ProjectTemplate.findById(templateId).lean();
  return doc;
}

export function getDefaultConfig(): {
  statuses: typeof DEFAULT_STATUSES;
  issueTypes: typeof DEFAULT_ISSUE_TYPES;
  priorities: typeof DEFAULT_PRIORITIES;
} {
  return {
    statuses: DEFAULT_STATUSES,
    issueTypes: DEFAULT_ISSUE_TYPES,
    priorities: DEFAULT_PRIORITIES,
  };
}
