import { Request, Response } from 'express';
import type { AuthPayload } from '../../../types/express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import {
  createRequestSchema,
  listRequestsQuerySchema,
  reviewRequestSchema,
} from './customerRequest.validation';
import * as customerRequestService from './customerRequest.service';

// Portal: Create a new request
async function createRequestHandler(req: Request, res: Response): Promise<void> {
  const orgId = req.customerUser!.orgId;
  const userId = req.customerUser!.id;
  const isOrgAdmin = req.customerUser!.isOrgAdmin;
  const result = await customerRequestService.createRequest(orgId, userId, req.body, isOrgAdmin);
  res.status(201).json({ success: true, data: { request: result } });
}

// Portal: List requests
async function listRequestsHandler(req: Request, res: Response): Promise<void> {
  const orgId = req.customerUser!.orgId;
  const userId = req.customerUser!.id;
  const permissions = req.customerUser!.permissions;
  const result = await customerRequestService.listRequests(orgId, userId, permissions, req.query as any);
  res.status(200).json({ success: true, data: result });
}

// Portal: Get single request
async function getRequestHandler(req: Request, res: Response): Promise<void> {
  const orgId = req.customerUser!.orgId;
  const userId = req.customerUser!.id;
  const permissions = req.customerUser!.permissions;
  const result = await customerRequestService.getRequest(orgId, req.params.requestId, userId, permissions);
  res.status(200).json({ success: true, data: { request: result } });
}

// Portal: Org admin approves a request
async function orgAdminApproveHandler(req: Request, res: Response): Promise<void> {
  const orgId = req.customerUser!.orgId;
  const reviewedBy = req.customerUser!.id;
  const { note } = req.body;
  const result = await customerRequestService.customerAdminApprove(
    orgId,
    req.params.requestId,
    reviewedBy,
    note
  );
  res.status(200).json({ success: true, data: { request: result } });
}

// Portal: Org admin rejects a request
async function orgAdminRejectHandler(req: Request, res: Response): Promise<void> {
  const orgId = req.customerUser!.orgId;
  const reviewedBy = req.customerUser!.id;
  const { note, reason } = req.body;
  const result = await customerRequestService.customerAdminReject(
    orgId,
    req.params.requestId,
    reviewedBy,
    note,
    reason
  );
  res.status(200).json({ success: true, data: { request: result } });
}

// TF Admin: List pending TF approval
async function listPendingTfApprovalHandler(req: Request & { user?: AuthPayload; activeOrganizationId?: string }, res: Response): Promise<void> {
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const limit = parseInt(String(req.query.limit ?? '20'), 10);
  const result = await customerRequestService.listPendingTfApproval({ page, limit }, req.activeOrganizationId);
  res.status(200).json({ success: true, data: result });
}

// TF Admin: List ALL requests (with optional status/org filter)
async function listAllRequestsTfHandler(req: Request & { user?: AuthPayload; activeOrganizationId?: string }, res: Response): Promise<void> {
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const limit = parseInt(String(req.query.limit ?? '50'), 10);
  const status = req.query.status ? String(req.query.status) : undefined;
  const orgId = req.query.orgId ? String(req.query.orgId) : undefined;
  const result = await customerRequestService.listAllRequestsTf(
    { status, orgId, page, limit },
    req.activeOrganizationId
  );
  res.status(200).json({ success: true, data: result });
}

// TF Admin: Approve a request and create issue
async function tfApproveHandler(req: Request & { user?: AuthPayload; activeOrganizationId?: string }, res: Response): Promise<void> {
  const { note } = req.body;
  const result = await customerRequestService.tfApprove(
    req.params.requestId,
    req.user!.id,
    note,
    req.activeOrganizationId
  );
  res.status(200).json({ success: true, data: { request: result } });
}

// TF Admin: Reject a request
async function tfRejectHandler(req: Request & { user?: AuthPayload; activeOrganizationId?: string }, res: Response): Promise<void> {
  const { note, reason } = req.body;
  const result = await customerRequestService.tfReject(
    req.params.requestId,
    req.user!.id,
    note,
    reason,
    req.activeOrganizationId
  );
  res.status(200).json({ success: true, data: { request: result } });
}

// Portal: Add a comment from the requester (use @issue in body to forward to the linked ticket)
async function addPortalCommentHandler(req: Request, res: Response): Promise<void> {
  const orgId = req.customerUser!.orgId;
  const userId = req.customerUser!.id;
  const customerUserName = req.customerUser!.name;
  const { body } = req.body;
  if (!body?.trim()) {
    res.status(400).json({ success: false, message: 'Comment body is required' });
    return;
  }
  const result = await customerRequestService.addPortalComment(
    orgId,
    req.params.requestId,
    userId,
    customerUserName,
    body
  );
  res.status(201).json({ success: true, data: { comment: result } });
}

export const createRequest = [validate(createRequestSchema, 'body'), asyncHandler(createRequestHandler)];
export const listRequests = [validate(listRequestsQuerySchema, 'query'), asyncHandler(listRequestsHandler)];
export const getRequest = [asyncHandler(getRequestHandler)];
export const orgAdminApprove = [validate(reviewRequestSchema, 'body'), asyncHandler(orgAdminApproveHandler)];
export const orgAdminReject = [validate(reviewRequestSchema, 'body'), asyncHandler(orgAdminRejectHandler)];
export const listPendingTfApproval = [asyncHandler(listPendingTfApprovalHandler)];
export const listAllRequestsTf = [asyncHandler(listAllRequestsTfHandler)];
export const tfApprove = [validate(reviewRequestSchema, 'body'), asyncHandler(tfApproveHandler)];
export const tfReject = [validate(reviewRequestSchema, 'body'), asyncHandler(tfRejectHandler)];
export const addPortalComment = [asyncHandler(addPortalCommentHandler)];
