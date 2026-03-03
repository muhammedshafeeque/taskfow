import { Milestone } from './milestone.model';
import { ProjectMember } from '../projects/projectMember.model';
import { ApiError } from '../../utils/ApiError';

export async function listByProject(projectId: string, userId: string): Promise<unknown[]> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const list = await Milestone.find({ project: projectId }).sort({ dueDate: 1, name: 1 }).lean();
  return list;
}

export async function create(projectId: string, input: { name: string; dueDate?: string; status?: string; description?: string }, userId: string): Promise<unknown> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const doc = await Milestone.create({
    project: projectId,
    name: input.name,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    status: input.status ?? 'open',
    description: input.description ?? '',
  });
  return doc.toObject();
}

export async function update(milestoneId: string, projectId: string, input: { name?: string; dueDate?: string; status?: string; description?: string }, userId: string): Promise<unknown | null> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const doc = await Milestone.findOneAndUpdate(
    { _id: milestoneId, project: projectId },
    {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.description !== undefined && { description: input.description }),
    },
    { new: true }
  ).lean();
  return doc;
}

export async function remove(milestoneId: string, projectId: string, userId: string): Promise<boolean> {
  const isMember = await ProjectMember.exists({ user: userId, project: projectId });
  if (!isMember) throw new ApiError(403, 'Access denied');
  const result = await Milestone.deleteOne({ _id: milestoneId, project: projectId });
  return result.deletedCount > 0;
}
