import mongoose from 'mongoose';
import { ProjectMember } from './projectMember.model';
import { Project } from './project.model';

/** Project IDs the user is a member of within the active TaskFlow workspace. */
export async function getProjectObjectIdsInWorkspace(
  userId: string,
  taskflowOrganizationId: string | null | undefined
): Promise<mongoose.Types.ObjectId[]> {
  if (!taskflowOrganizationId || !mongoose.Types.ObjectId.isValid(taskflowOrganizationId)) {
    return [];
  }
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const memberProjectIds = await ProjectMember.find({ user: userObjectId }).distinct('project');
  if (!memberProjectIds.length) return [];
  const allowed = await Project.find({
    _id: { $in: memberProjectIds },
    taskflowOrganizationId,
  })
    .select('_id')
    .lean();
  return allowed.map((p) => p._id as mongoose.Types.ObjectId);
}
