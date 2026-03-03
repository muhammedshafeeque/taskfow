import mongoose from 'mongoose';
import { Roadmap } from './roadmap.model';
import { Milestone } from '../milestones/milestone.model';
import { ProjectMember } from '../projects/projectMember.model';
import { ApiError } from '../../utils/ApiError';

export async function listByProject(projectId: string, userId: string): Promise<unknown[]> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const list = await Roadmap.find({ project: projectId }).sort({ startDate: 1, name: 1 }).lean();
  return list;
}

export async function create(
  projectId: string,
  input: { name: string; description?: string; startDate?: string; endDate?: string; milestoneIds?: string[] },
  userId: string
): Promise<unknown> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const doc = await Roadmap.create({
    project: projectId,
    name: input.name,
    description: input.description ?? '',
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    endDate: input.endDate ? new Date(input.endDate) : undefined,
    milestoneIds: (input.milestoneIds ?? []).map((id) => new mongoose.Types.ObjectId(id)),
  });
  return doc.toObject();
}

export async function update(
  roadmapId: string,
  projectId: string,
  input: { name?: string; description?: string; startDate?: string; endDate?: string; milestoneIds?: string[] },
  userId: string
): Promise<unknown | null> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.startDate !== undefined) updateData.startDate = input.startDate ? new Date(input.startDate) : null;
  if (input.endDate !== undefined) updateData.endDate = input.endDate ? new Date(input.endDate) : null;
  if (input.milestoneIds !== undefined) {
    updateData.milestoneIds = input.milestoneIds.map((id) => new mongoose.Types.ObjectId(id));
  }
  const doc = await Roadmap.findOneAndUpdate(
    { _id: roadmapId, project: projectId },
    { $set: updateData },
    { new: true }
  ).lean();
  return doc;
}

export async function remove(roadmapId: string, projectId: string, userId: string): Promise<boolean> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const result = await Roadmap.deleteOne({ _id: roadmapId, project: projectId });
  return result.deletedCount > 0;
}

export async function getMilestonesForRoadmap(roadmapId: string, projectId: string, userId: string): Promise<unknown[]> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const roadmap = await Roadmap.findOne({ _id: roadmapId, project: projectId }).lean();
  if (!roadmap) return [];
  const ids = (roadmap.milestoneIds ?? []) as mongoose.Types.ObjectId[];
  if (ids.length === 0) return [];
  const milestones = await Milestone.find({ _id: { $in: ids }, project: projectId })
    .sort({ dueDate: 1, name: 1 })
    .lean();
  return milestones;
}
