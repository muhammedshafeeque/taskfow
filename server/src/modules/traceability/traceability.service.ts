import mongoose from 'mongoose';
import { Issue } from '../issues/issue.model';
import { TestCase } from '../testCases/testCase.model';
import { ProjectMember } from '../projects/projectMember.model';
import { ApiError } from '../../utils/ApiError';

export interface TraceabilityRow {
  issueId: string;
  issueKey: string;
  issueTitle: string;
  linkedTestCases: Array<{
    testCaseId: string;
    title: string;
    status: string;
    latestResult?: 'pass' | 'fail' | 'pending' | 'skip' | 'blocked';
  }>;
}

export async function getTraceability(projectId: string, userId: string): Promise<TraceabilityRow[]> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');

  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  const [issues, testCases] = await Promise.all([
    Issue.find({ project: projectObjectId }).select('key title').sort({ key: 1 }).lean(),
    TestCase.find({ project: projectObjectId }).select('title status linkedIssueId').lean(),
  ]);

  const testCasesByIssue = new Map<string, Array<{ testCaseId: string; title: string; status: string }>>();
  for (const tc of testCases as Array<{ _id: mongoose.Types.ObjectId; title: string; status: string; linkedIssueId?: mongoose.Types.ObjectId }>) {
    const issueId = tc.linkedIssueId ? String(tc.linkedIssueId) : null;
    if (!issueId) continue;
    const arr = testCasesByIssue.get(issueId) ?? [];
    arr.push({
      testCaseId: String(tc._id),
      title: tc.title,
      status: tc.status,
    });
    testCasesByIssue.set(issueId, arr);
  }

  const rows: TraceabilityRow[] = issues.map((i) => {
    const issueId = String((i as { _id: mongoose.Types.ObjectId })._id);
    const linked = testCasesByIssue.get(issueId) ?? [];
    return {
      issueId,
      issueKey: (i as { key?: string }).key ?? issueId.slice(-6),
      issueTitle: (i as { title?: string }).title ?? '',
      linkedTestCases: linked.map((t) => ({ ...t, latestResult: undefined })),
    };
  });

  return rows;
}
