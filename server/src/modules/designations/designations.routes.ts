import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission';
import {
  getDesignationsHandler,
  getDesignationByIdHandler,
  createDesignationHandler,
  updateDesignationHandler,
  deleteDesignationHandler,
  getDesignationByIdParamHandler,
} from './designations.controller';

const router = Router();

router.use(authMiddleware);
router.use(requirePermission('designations:manage'));

router.get('/', getDesignationsHandler);
router.post('/', createDesignationHandler);
router.get('/:id', ...getDesignationByIdParamHandler, getDesignationByIdHandler);
router.patch('/:id', ...updateDesignationHandler);
router.delete('/:id', ...deleteDesignationHandler);

export const designationsRoutes = router;
