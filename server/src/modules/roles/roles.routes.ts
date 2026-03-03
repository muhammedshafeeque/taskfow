import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission';
import {
  getRolesHandler,
  getRoleByIdHandler,
  createRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
  getRoleByIdParamHandler,
  getPermissionsHandler,
} from './roles.controller';

const router = Router();

router.get('/permissions', getPermissionsHandler);

router.use(authMiddleware);
router.use(requirePermission('roles:manage'));

router.get('/', getRolesHandler);
router.post('/', createRoleHandler);
router.get('/:id', ...getRoleByIdParamHandler, getRoleByIdHandler);
router.patch('/:id', ...updateRoleHandler);
router.delete('/:id', ...deleteRoleHandler);

export const rolesRoutes = router;
