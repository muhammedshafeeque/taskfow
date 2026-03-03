import mongoose from 'mongoose';
import { SavedFilter } from './savedFilter.model';
import { ProjectMember } from '../projects/projectMember.model';
import { ApiError } from '../../utils/ApiError';
import type { ISavedFilterFilters } from './savedFilter.model';

async function ensureUserCanAccessProject(userId: string, projectId: string): Promise<void> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const member = await ProjectMember.findOne({
    project: projectObjectId,
    user: userObjectId,
  }).lean();
  if (!member) throw new ApiError(403, 'Access denied to this project');
}

export async function listByProject(
  userId: string,
  projectId: string
): Promise<{ _id: string; name: string; filters: ISavedFilterFilters; quickFilter: string; jql?: string; viewMode?: string; createdAt: Date }[]> {
  await ensureUserCanAccessProject(userId, projectId);
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const list = await SavedFilter.find({ user: userObjectId, project: projectObjectId })
    .sort({ createdAt: -1 })
    .lean();
  return list.map((doc) => ({
    _id: doc._id.toString(),
    name: doc.name,
    filters: doc.filters,
    quickFilter: doc.quickFilter,
    jql: doc.jql,
    viewMode: doc.viewMode,
    createdAt: doc.createdAt,
  }));
}

export async function create(
  userId: string,
  data: {
    project: string;
    name: string;
    filters: ISavedFilterFilters;
    quickFilter: 'all' | 'my' | 'open';
    jql?: string;
    viewMode?: 'list' | 'table' | 'kanban';
  }
): Promise<{ _id: string; name: string; filters: ISavedFilterFilters; quickFilter: string; jql?: string; viewMode?: string; createdAt: Date }> {
  await ensureUserCanAccessProject(userId, data.project);
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const projectObjectId = new mongoose.Types.ObjectId(data.project);
  const doc = await SavedFilter.create({
    user: userObjectId,
    project: projectObjectId,
    name: data.name,
    filters: data.filters,
    quickFilter: data.quickFilter,
    jql: data.jql,
    viewMode: data.viewMode,
  });
  const populated = await SavedFilter.findById(doc._id).lean();
  return {
    _id: populated!._id.toString(),
    name: populated!.name,
    filters: populated!.filters,
    quickFilter: populated!.quickFilter,
    jql: populated!.jql,
    viewMode: populated!.viewMode,
    createdAt: populated!.createdAt,
  };
}

export async function update(
  filterId: string,
  userId: string,
  data: Partial<{
    name: string;
    filters: ISavedFilterFilters;
    quickFilter: 'all' | 'my' | 'open';
    jql: string | null;
    viewMode: 'list' | 'table' | 'kanban' | null;
  }>
): Promise<{ _id: string; name: string; filters: ISavedFilterFilters; quickFilter: string; jql?: string; viewMode?: string; createdAt: Date } | null> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const filterObjectId = new mongoose.Types.ObjectId(filterId);
  const existing = await SavedFilter.findOne({ _id: filterObjectId, user: userObjectId }).lean();
  if (!existing) return null;
  const updatePayload: Record<string, unknown> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.filters !== undefined) updatePayload.filters = data.filters;
  if (data.quickFilter !== undefined) updatePayload.quickFilter = data.quickFilter;
  if (data.jql !== undefined) updatePayload.jql = data.jql ?? undefined;
  if (data.viewMode !== undefined) updatePayload.viewMode = data.viewMode ?? undefined;
  const updated = await SavedFilter.findByIdAndUpdate(
    filterObjectId,
    { $set: updatePayload },
    { new: true }
  ).lean();
  if (!updated) return null;
  return {
    _id: updated._id.toString(),
    name: updated.name,
    filters: updated.filters,
    quickFilter: updated.quickFilter,
    jql: updated.jql,
    viewMode: updated.viewMode,
    createdAt: updated.createdAt,
  };
}

export async function remove(filterId: string, userId: string): Promise<boolean> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const filterObjectId = new mongoose.Types.ObjectId(filterId);
  const result = await SavedFilter.deleteOne({ _id: filterObjectId, user: userObjectId });
  return result.deletedCount > 0;
}
