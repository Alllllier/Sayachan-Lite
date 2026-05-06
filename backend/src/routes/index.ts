import Router from '@koa/router';

import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
import notesRoutes from './notesRoutes.js';
import projectsRoutes from './projectsRoutes.js';
import tasksRoutes from './tasksRoutes.js';

const router = new Router();

router.use(authRoutes.routes());
router.use(healthRoutes.routes());
router.use(notesRoutes.routes());
router.use(projectsRoutes.routes());
router.use(tasksRoutes.routes());

export default router;
