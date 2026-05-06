import Router from '@koa/router';

import authRoutes = require('./authRoutes');
import healthRoutes = require('./healthRoutes');
import notesRoutes = require('./notesRoutes');
import projectsRoutes = require('./projectsRoutes');
import tasksRoutes = require('./tasksRoutes');

const router = new Router();

router.use(authRoutes.routes());
router.use(healthRoutes.routes());
router.use(notesRoutes.routes());
router.use(projectsRoutes.routes());
router.use(tasksRoutes.routes());

export = router;
