import Router from '@koa/router';

import aiRoutes from './aiRoutes.js';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
import memoryEntriesRoutes from './memoryEntriesRoutes.js';
import notesRoutes from './notesRoutes.js';
import projectsRoutes from './projectsRoutes.js';
import sayachanRoutes from './sayachanRoutes.js';
import tasksRoutes from './tasksRoutes.js';

const router = new Router();

router.use(aiRoutes.routes());
router.use(authRoutes.routes());
router.use(healthRoutes.routes());
router.use(memoryEntriesRoutes.routes());
router.use(notesRoutes.routes());
router.use(projectsRoutes.routes());
router.use(sayachanRoutes.routes());
router.use(tasksRoutes.routes());

export default router;
