import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { createOrgSchema, updateOrgSchema } from './customerOrg.validation';
import * as customerOrgService from './customerOrg.service';
import { ApiError } from '../../../utils/ApiError';

function requireActiveTfOrg(req: Request): string {
  const id = req.activeOrganizationId;
  if (!id) throw new ApiError(400, 'Active workspace is required');
  return id;
}

async function createOrgHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  const result = await customerOrgService.createOrg(req.body, req.user!.id, tfOrg);
  res.status(201).json({ success: true, data: result });
}

async function listOrgsHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const limit = parseInt(String(req.query.limit ?? '20'), 10);
  const status = req.query.status as string | undefined;
  const result = await customerOrgService.listOrgs({ page, limit, status }, tfOrg);
  res.status(200).json({ success: true, data: result });
}

async function getOrgHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  const result = await customerOrgService.getOrg(req.params.id, tfOrg);
  res.status(200).json({ success: true, data: { org: result } });
}

async function updateOrgHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  const result = await customerOrgService.updateOrg(req.params.id, req.body, tfOrg);
  res.status(200).json({ success: true, data: { org: result } });
}

async function deleteOrgHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  await customerOrgService.deleteOrg(req.params.id, tfOrg);
  res.status(200).json({ success: true, data: { message: 'Organisation deleted' } });
}

async function listOrgRolesHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  const result = await customerOrgService.listOrgRoles(req.params.id, tfOrg);
  res.status(200).json({ success: true, data: { roles: result } });
}

async function listOrgMembersHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  const result = await customerOrgService.listOrgMembers(req.params.id, tfOrg);
  res.status(200).json({ success: true, data: { members: result } });
}

async function updateOrgMemberHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  const result = await customerOrgService.updateOrgMember(req.params.id, req.params.userId, req.body, tfOrg);
  res.status(200).json({ success: true, data: result });
}

async function updateOrgMemberPermissionsHandler(req: Request, res: Response): Promise<void> {
  const tfOrg = requireActiveTfOrg(req);
  const { granted, revoked } = req.body as { granted: string[]; revoked: string[] };
  const result = await customerOrgService.updateOrgMemberPermissions(req.params.id, req.params.userId, { granted, revoked }, tfOrg);
  res.status(200).json({ success: true, data: result });
}

export const createOrg = [validate(createOrgSchema, 'body'), asyncHandler(createOrgHandler)];
export const listOrgs = [asyncHandler(listOrgsHandler)];
export const getOrg = [asyncHandler(getOrgHandler)];
export const updateOrg = [validate(updateOrgSchema, 'body'), asyncHandler(updateOrgHandler)];
export const deleteOrg = [asyncHandler(deleteOrgHandler)];
export const listOrgRoles = [asyncHandler(listOrgRolesHandler)];
export const listOrgMembers = [asyncHandler(listOrgMembersHandler)];
export const updateOrgMember = [asyncHandler(updateOrgMemberHandler)];
export const updateOrgMemberPermissions = [asyncHandler(updateOrgMemberPermissionsHandler)];
