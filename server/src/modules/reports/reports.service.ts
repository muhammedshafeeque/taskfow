import mongoose from 'mongoose';
import { Report } from './report.model';
import { ProjectMember } from '../projects/projectMember.model';
import { ApiError } from '../../utils/ApiError';
import * as dashboardService from '../dashboard/dashboard.service';

export type ReportType = 'issues_by_status' | 'issues_by_assignee' | 'workload' | 'defects';

export interface ReportConfig {
  filters?: Record<string, unknown>;
  groupBy?: string;
  chartType?: 'bar' | 'pie' | 'table';
}


export async function listReports(userId: string): Promise<unknown[]> {
  const list = await Report.find({ user: userId })
    .populate('project', 'name key')
    .sort({ createdAt: -1 })
    .lean();
  return list;
}

export async function createReport(
  userId: string,
  input: { name: string; project?: string; type: ReportType; config?: ReportConfig }
): Promise<unknown> {
  const doc = await Report.create({
    user: userId,
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
  input: Partial<{ name: string; project: string | null; type: ReportType; config: ReportConfig }>
): Promise<unknown | null> {
  const report = await Report.findOne({ _id: reportId, user: userId });
  if (!report) return null;
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.project !== undefined) updateData.project = input.project || null;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.config !== undefined) updateData.config = input.config;
  const doc = await Report.findByIdAndUpdate(reportId, { $set: updateData }, { new: true }).lean();
  return doc;
}

export async function deleteReport(reportId: string, userId: string): Promise<boolean> {
  const result = await Report.deleteOne({ _id: reportId, user: userId });
  return result.deletedCount > 0;
}

export async function executeReport(reportId: string, userId: string): Promise<unknown> {
  const report = await Report.findById(reportId).lean();
  if (!report) throw new ApiError(404, 'Report not found');
  if (String(report.user) !== userId) throw new ApiError(403, 'Access denied');

  const projectId = report.project ? String(report.project) : undefined;
  const config = (report.config ?? {}) as ReportConfig;

  switch (report.type) {
    case 'issues_by_status': {
      const stats = await dashboardService.getStatsForUser(userId);
      return {
        type: 'issues_by_status',
        data: stats.issuesByStatus,
        labels: Object.keys(stats.issuesByStatus),
        values: Object.values(stats.issuesByStatus),
      };
    }
    case 'issues_by_assignee': {
      const workload = await dashboardService.getWorkloadStats(userId, projectId);
      return {
        type: 'issues_by_assignee',
        data: workload.entries,
        labels: workload.entries.map((e) => e.userName),
        values: workload.entries.map((e) => e.totalCount),
      };
    }
    case 'workload': {
      const workload = await dashboardService.getWorkloadStats(userId, projectId);
      return {
        type: 'workload',
        data: workload.entries,
        labels: workload.entries.map((e) => e.userName),
        values: workload.entries.map((e) => e.totalCount),
      };
    }
    case 'defects': {
      const defects = await dashboardService.getDefectMetrics(userId, projectId);
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
