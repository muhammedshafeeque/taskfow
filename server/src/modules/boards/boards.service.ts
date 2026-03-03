import { Board } from './board.model';
import { ApiError } from '../../utils/ApiError';
import type { CreateBoardBody, UpdateBoardBody } from './boards.validation';
import type { PaginationOptions, PaginatedResult } from '../projects/projects.service';

export async function create(input: CreateBoardBody): Promise<unknown> {
  const doc = await Board.create({
    name: input.name,
    type: input.type,
    project: input.project,
    columns: input.columns ?? [],
  });
  return doc.toObject();
}

export async function findAll(
  projectId?: string,
  pagination: PaginationOptions = { page: 1, limit: 20 }
): Promise<PaginatedResult<unknown>> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const filter = projectId ? { project: projectId } : {};

  const [data, total] = await Promise.all([
    Board.find(filter).populate('project', 'name key').lean().skip(skip).limit(limit),
    Board.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function findById(id: string): Promise<unknown | null> {
  const board = await Board.findById(id).populate('project', 'name key').lean();
  return board ?? null;
}

export async function update(id: string, input: UpdateBoardBody): Promise<unknown | null> {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.columns !== undefined) updateData.columns = input.columns;

  const board = await Board.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('project', 'name key')
    .lean();

  return board ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const result = await Board.findByIdAndDelete(id);
  return result != null;
}
