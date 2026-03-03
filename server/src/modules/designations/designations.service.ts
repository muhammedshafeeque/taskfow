import { Designation } from './designation.model';
import type { CreateDesignationBody, UpdateDesignationBody } from './designations.validation';

export async function findAll() {
  return Designation.find().sort({ order: 1, name: 1 }).lean();
}

export async function findById(id: string) {
  const designation = await Designation.findById(id).lean();
  return designation ?? null;
}

export async function create(input: CreateDesignationBody) {
  const designation = await Designation.create({
    name: input.name,
    order: input.order ?? 0,
  });
  return designation.toObject();
}

export async function update(id: string, input: UpdateDesignationBody) {
  const designation = await Designation.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true }).lean();
  return designation ?? null;
}

export async function remove(id: string) {
  const result = await Designation.findByIdAndDelete(id);
  return result != null;
}
