import { Request, Response, NextFunction } from 'express';
import * as projectTemplatesService from './projectTemplates.service';

export async function listTemplates(_req: Request, res: Response, _next: NextFunction): Promise<void> {
  const list = await projectTemplatesService.list();
  res.status(200).json({ success: true, data: list });
}

export async function getTemplate(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const template = await projectTemplatesService.getById(req.params.id);
  if (!template) {
    res.status(404).json({ success: false, message: 'Template not found' });
    return;
  }
  res.status(200).json({ success: true, data: template });
}
