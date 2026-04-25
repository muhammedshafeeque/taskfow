import mongoose from 'mongoose';
import { Report } from './report.model';
import { Issue } from '../issues/issue.model';
import { Project } from '../projects/project.model';
import { ApiError } from '../../utils/ApiError';
import * as dashboardService from '../dashboard/dashboard.service';
import { buildIssueMatch, parseReportFilters, type ReportFilters } from './reportFilters';

export type ReportType =
  | 'issues_by_status'
  | 'issues_by_type'
  | 'issues_by_priority'
  | 'issues_by_assignee'
  | 'workload'
  | 'defects';

export type { ReportFilters } from './reportFilters';

export interface ReportConfig {
  filters?: Record<string, unknown>;
  groupBy?: string;
  chartType?: 'bar' | 'pie' | 'table';
}

function requireWorkspaceId(taskflowOrganizationId: string | null | undefined): string {
  if (!taskflowOrganizationId || !mongoose.Types.ObjectId.isValid(taskflowOrganizationId)) {
    throw new ApiError(400, 'Active workspace required');
  }
  return taskflowOrganizationId;
}

async function groupIssuesByField(
  userId: string,
  projectId: string | undefined,
  filters: ReportFilters,
  field: 'status' | 'type' | 'priority',
  taskflowOrganizationId: string
): Promise<Record<string, number>> {
  const match = await buildIssueMatch(userId, projectId, filters, taskflowOrganizationId);
  if (!match) return {};
  const aggregationResult = await Issue.aggregate<{ _id: string | null; count: number }>([
    { $match: match },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);
  const out: Record<string, number> = {};
  for (const row of aggregationResult) {
    const key = row._id != null && row._id !== '' ? String(row._id) : 'Unknown';
    out[key] = row.count;
  }
  return out;
}

async function assertProjectInWorkspace(projectId: string, workspaceId: string): Promise<void> {
  const p = await Project.findById(projectId).select('taskflowOrganizationId').lean();
  if (!p) throw new ApiError(400, 'Invalid project');
  const pOrg = (p as { taskflowOrganizationId?: unknown }).taskflowOrganizationId;
  if (!pOrg || String(pOrg) !== workspaceId) {
    throw new ApiError(400, 'Project is not in the active workspace');
  }
}

export async function listReports(
  userId: string,
  taskflowOrganizationId: string | null | undefined
): Promise<unknown[]> {
  const orgId = requireWorkspaceId(taskflowOrganizationId);
  const orgOid = new mongoose.Types.ObjectId(orgId);
  const list = await Report.find({ user: userId, taskflowOrganizationId: orgOid })
    .populate('project', 'name key')
    .sort({ createdAt: -1 })
    .lean();
  return list;
}

export async function createReport(
  userId: string,
  input: { name: string; project?: string; type: ReportType; config?: ReportConfig },
  taskflowOrganizationId: string | null | undefined
): Promise<unknown> {
  const orgId = requireWorkspaceId(taskflowOrganizationId);
  const orgOid = new mongoose.Types.ObjectId(orgId);
  if (input.project) {
    await assertProjectInWorkspace(input.project, orgId);
  }
  const doc = await Report.create({
    user: userId,
    taskflowOrganizationId: orgOid,
    project: input.project ?? undefined,
    name: input.name,
    type: input.type,
    config: input.config ?? {},
  });
  return doc.toObject();
}

export async function updateReport(
  reportId: string,
  userId: string,
  input: Partial<{ name: string; project: string | null; type: ReportType; config: ReportConfig }>,
  taskflowOrganizationId: string | null | undefined
): Promise<unknown | null> {
  const orgId = requireWorkspaceId(taskflowOrganizationId);
  const orgOid = new mongoose.Types.ObjectId(orgId);
  const report = await Report.findOne({ _id: reportId, user: userId, taskflowOrganizationId: orgOid });
  if (!report) return null;
  if (input.project && input.project !== '') {
    await assertProjectInWorkspace(input.project, orgId);
  }
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.project !== undefined) updateData.project = input.project || null;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.config !== undefined) updateData.config = input.config;
  const doc = await Report.findByIdAndUpdate(reportId, { $set: updateData }, { new: true }).lean();
  return doc;
}

export async function deleteReport(
  reportId: string,
  userId: string,
  taskflowOrganizationId: string | null | undefined
): Promise<boolean> {
  const orgOid = new mongoose.Types.ObjectId(requireWorkspaceId(taskflowOrganizationId));
  const result = await Report.deleteOne({ _id: reportId, user: userId, taskflowOrganizationId: orgOid });
  return result.deletedCount > 0;
}

export async function executeReport(
  reportId: string,
  userId: string,
  taskflowOrganizationId: string | null | undefined
): Promise<unknown> {
  const orgId = requireWorkspaceId(taskflowOrganizationId);
  const report = await Report.findOne({
    _id: reportId,
    user: userId,
    taskflowOrganizationId: new mongoose.Types.ObjectId(orgId),
  }).lean();
  if (!report) throw new ApiError(404, 'Report not found');

  const projectId = report.project ? String(report.project) : undefined;
  const config = (report.config ?? {}) as ReportConfig;
  const filters = parseReportFilters(config.filters);

  switch (report.type) {
    case 'issues_by_status': {
      const issuesByStatus = await groupIssuesByField(userId, projectId, filters, 'status', orgId);
      return {
        type: 'issues_by_status',
        data: issuesByStatus,
        labels: Object.keys(issuesByStatus),
        values: Object.values(issuesByStatus),
      };
    }
    case 'issues_by_type': {
      const byType = await groupIssuesByField(userId, projectId, filters, 'type', orgId);
      return {
        type: 'issues_by_type',
        data: byType,
        labels: Object.keys(byType),
        values: Object.values(byType),
      };
    }
    case 'issues_by_priority': {
      const byPriority = await groupIssuesByField(userId, projectId, filters, 'priority', orgId);
      return {
        type: 'issues_by_priority',
        data: byPriority,
        labels: Object.keys(byPriority),
        values: Object.values(byPriority),
      };
    }
    case 'issues_by_assignee': {
      const workload = await dashboardService.getWorkloadStats(userId, projectId, filters, orgId);
      return {
        type: 'issues_by_assignee',
        data: workload.entries,
        labels: workload.entries.map((e) => e.userName),
        values: workload.entries.map((e) => e.totalCount),
      };
    }
    case 'workload': {
      const workload = await dashboardService.getWorkloadStats(userId, projectId, filters, orgId);
      return {
        type: 'workload',
        data: workload.entries,
        labels: workload.entries.map((e) => e.userName),
        values: workload.entries.map((e) => e.totalCount),
      };
    }
    case 'defects': {
      const defects = await dashboardService.getDefectMetrics(userId, projectId, filters, orgId);
      const byStatus = defects.byStatus;
      const byPriority = defects.byPriority;
      return {
        type: 'defects',
        data: {
          totalBugs: defects.totalBugs,
          openBugs: defects.openBugs,
          closedBugs: defects.closedBugs,
          defectDensity: defects.defectDensity,
        },
        byStatus: { labels: Object.keys(byStatus), values: Object.values(byStatus) },
        byPriority: { labels: Object.keys(byPriority), values: Object.values(byPriority) },
      };
    }
    default:
      throw new ApiError(400, 'Unknown report type');
  }
}
