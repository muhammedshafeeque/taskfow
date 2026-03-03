import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  listSavedFiltersHandler,
  createSavedFilterHandler,
  updateSavedFilterHandler,
  deleteSavedFilterHandler,
} from './savedFilters.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', ...listSavedFiltersHandler);
router.post('/', ...createSavedFilterHandler);
router.patch('/:id', ...updateSavedFilterHandler);
router.delete('/:id', ...deleteSavedFilterHandler);

export const savedFiltersRoutes = router;
