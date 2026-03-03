import { Comment } from './comment.model';
import * as issueHistoryService from '../issues/issueHistory.service';
import type { PaginationOptions, PaginatedResult } from '../projects/projects.service';

export async function create(
  issueId: string,
  authorId: string,
  body: string
): Promise<unknown> {
  const doc = await Comment.create({
    body,
    issue: issueId,
    author: authorId,
  });
  await issueHistoryService.recordCommentAdded(issueId, authorId, String(doc._id));
  const populated = await Comment.findById(doc._id)
    .populate('author', 'name email')
    .lean();
  return populated ?? doc.toObject();
}

export async function findByIssue(
  issueId: string,
  pagination: PaginationOptions = { page: 1, limit: 20 }
): Promise<PaginatedResult<unknown>> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Comment.find({ issue: issueId })
      .populate('author', 'name email')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments({ issue: issueId }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function findById(commentId: string, issueId: string): Promise<unknown | null> {
  const comment = await Comment.findOne({ _id: commentId, issue: issueId })
    .populate('author', 'name email')
    .lean();
  return comment ?? null;
}

export async function update(
  commentId: string,
  issueId: string,
  body: string,
  authorId: string
): Promise<unknown | null> {
  const oldComment = await Comment.findOne({ _id: commentId, issue: issueId }).select('body').lean();
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, issue: issueId },
    { $set: { body } },
    { new: true, runValidators: true }
  )
    .populate('author', 'name email')
    .lean();

  if (comment && oldComment && oldComment.body !== body) {
    await issueHistoryService.recordCommentUpdated(issueId, authorId, commentId, oldComment.body, body);
  }
  return comment ?? null;
}

export async function remove(commentId: string, issueId: string): Promise<boolean> {
  const result = await Comment.findOneAndDelete({ _id: commentId, issue: issueId });
  return result != null;
}
