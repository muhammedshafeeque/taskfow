import mongoose from 'mongoose';
import { IssueLink } from './issueLink.model';
import { Issue } from './issue.model';
import { ProjectMember } from '../projects/projectMember.model';
import { ApiError } from '../../utils/ApiError';
import type { IssueLinkType, IssueLinkResponseType } from './issueLink.model';

async function ensureUserCanAccessIssue(userId: string, issueId: string): Promise<void> {
  const issue = await Issue.findById(issueId).select('project').lean();
  if (!issue) throw new ApiError(404, 'Issue not found');
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const member = await ProjectMember.findOne({
    project: issue.project,
    user: userObjectId,
  }).lean();
  if (!member) throw new ApiError(403, 'Access denied to this issue');
}

export interface NormalizedIssueLink {
  _id: string;
  linkType: IssueLinkResponseType;
  direction: 'outbound' | 'inbound';
  issue: { _id: string; key: string; title: string; project?: { _id: string; name: string; key: string } };
}

export async function findByIssue(issueId: string, userId: string): Promise<NormalizedIssueLink[]> {
  await ensureUserCanAccessIssue(userId, issueId);

  const [outbound, inbound] = await Promise.all([
    IssueLink.find({ sourceIssue: issueId })
      .populate('targetIssue', 'key title project')
      .populate({ path: 'targetIssue', populate: { path: 'project', select: 'name key' } })
      .lean(),
    IssueLink.find({ targetIssue: issueId })
      .populate('sourceIssue', 'key title project')
      .populate({ path: 'sourceIssue', populate: { path: 'project', select: 'name key' } })
      .lean(),
  ]);

  const result: NormalizedIssueLink[] = [];

  for (const link of outbound as Array<{
    _id: mongoose.Types.ObjectId;
    linkType: IssueLinkType;
    targetIssue: { _id: mongoose.Types.ObjectId; key?: string; title?: string; project?: { _id: mongoose.Types.ObjectId; name?: string; key?: string } };
  }>) {
    const target = link.targetIssue;
    if (!target) continue;
    result.push({
      _id: String(link._id),
      linkType: link.linkType,
      direction: 'outbound',
      issue: {
        _id: String(target._id),
        key: target.key ?? String(target._id).slice(-6),
        title: target.title ?? '',
        project: target.project && typeof target.project === 'object' ? { _id: String(target.project._id), name: target.project.name ?? '', key: target.project.key ?? '' } : undefined,
      },
    });
  }

  for (const link of inbound as Array<{
    _id: mongoose.Types.ObjectId;
    linkType: IssueLinkType;
    sourceIssue: { _id: mongoose.Types.ObjectId; key?: string; title?: string; project?: { _id: mongoose.Types.ObjectId; name?: string; key?: string } };
  }>) {
    const source = link.sourceIssue;
    if (!source) continue;
    result.push({
      _id: String(link._id),
      linkType: link.linkType,
      direction: 'inbound',
      issue: {
        _id: String(source._id),
        key: source.key ?? String(source._id).slice(-6),
        title: source.title ?? '',
        project: source.project && typeof source.project === 'object' ? { _id: String(source.project._id), name: source.project.name ?? '', key: source.project.key ?? '' } : undefined,
      },
    });
  }

  const self = await Issue.findById(issueId)
    .select('parent')
    .populate({
      path: 'parent',
      select: 'key title project',
      populate: { path: 'project', select: 'name key' },
    })
    .lean();

  const parentDoc = self?.parent as
    | {
        _id: mongoose.Types.ObjectId;
        key?: string;
        title?: string;
        project?: { _id: mongoose.Types.ObjectId; name?: string; key?: string };
      }
    | null
    | undefined;

  if (parentDoc && typeof parentDoc === 'object' && parentDoc._id) {
    const parentIdStr = String(parentDoc._id);
    const alreadyLinked = result.some((l) => l.issue._id === parentIdStr);
    if (!alreadyLinked) {
      const proj = parentDoc.project;
      result.unshift({
        _id: `__parent__${parentIdStr}`,
        linkType: 'is_subtask_of',
        direction: 'outbound',
        issue: {
          _id: parentIdStr,
          key: parentDoc.key ?? parentIdStr.slice(-6),
          title: parentDoc.title ?? '',
          project:
            proj && typeof proj === 'object' && proj._id
              ? {
                  _id: String(proj._id),
                  name: proj.name ?? '',
                  key: proj.key ?? '',
                }
              : undefined,
        },
      });
    }
  }

  return result;
}

export async function create(
  sourceIssueId: string,
  targetIssueId: string,
  linkType: IssueLinkType,
  userId: string
): Promise<unknown> {
  await ensureUserCanAccessIssue(userId, sourceIssueId);
  await ensureUserCanAccessIssue(userId, targetIssueId);

  if (sourceIssueId === targetIssueId) {
    throw new ApiError(400, 'Cannot link an issue to itself');
  }

  const existing = await IssueLink.findOne({
    sourceIssue: sourceIssueId,
    targetIssue: targetIssueId,
    linkType,
  }).lean();
  if (existing) throw new ApiError(409, 'Link already exists');

  const doc = await IssueLink.create({
    sourceIssue: sourceIssueId,
    targetIssue: targetIssueId,
    linkType,
    createdBy: userId,
  });

  const populated = await IssueLink.findById(doc._id)
    .populate('sourceIssue', 'key title')
    .populate('targetIssue', 'key title')
    .lean();
  return populated ?? doc.toObject();
}

export async function remove(linkId: string, issueId: string, userId: string): Promise<boolean> {
  await ensureUserCanAccessIssue(userId, issueId);
  const link = await IssueLink.findOne({
    _id: linkId,
    $or: [{ sourceIssue: issueId }, { targetIssue: issueId }],
  }).lean();
  if (!link) return false;
  const result = await IssueLink.deleteOne({ _id: linkId });
  return result.deletedCount > 0;
}
