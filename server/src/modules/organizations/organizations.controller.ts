import { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';
import * as organizationsService from './organizations.service';
import * as authService from '../auth/auth.service';

export async function listOrganizations(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const organizations = await organizationsService.listOrganizationsForUser(userId);
  res.status(200).json({ success: true, data: { organizations } });
}

export async function createOrganization(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const org = await organizationsService.createOrganization(userId, req.body);
  res.status(201).json({ success: true, data: { organization: org } });
}

export async function getOrganization(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const detail = await organizationsService.getOrganizationDetail(userId, req.params.id);
  res.status(200).json({ success: true, data: detail });
}

export async function switchOrganization(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const result = await authService.switchTaskflowOrganization(userId, req.params.id);
  res.status(200).json({ success: true, data: result });
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const members = await organizationsService.listTfOrgMembers(userId, req.params.id);
  res.status(200).json({ success: true, data: { members } });
}

export async function inviteMember(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const { email, role } = req.body as { email: string; role?: 'org_admin' | 'org_member' };
  const member = await organizationsService.addMemberByEmail(userId, req.params.id, email, role ?? 'org_member');
  res.status(201).json({ success: true, data: { member } });
}

export async function patchMember(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const { role } = req.body as { role: 'org_admin' | 'org_member' };
  const member = await organizationsService.updateMemberRole(userId, req.params.id, req.params.userId, role);
  res.status(200).json({ success: true, data: { member } });
}

export async function patchOrganization(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const organization = await organizationsService.updateOrganization(userId, req.params.id, req.body);
  res.status(200).json({ success: true, data: { organization } });
}

export async function deleteMember(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  await organizationsService.removeOrganizationMember(userId, req.params.id, req.params.userId);
  res.status(200).json({ success: true, data: { removed: true } });
}
