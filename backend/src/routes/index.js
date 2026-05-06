const Router = require('@koa/router');
const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');
const notesRoutes = require('./notesRoutes');
const projectsRoutes = require('./projectsRoutes');
const tasksRoutes = require('./tasksRoutes');

const router = new Router();

router.use(authRoutes.routes());
router.use(healthRoutes.routes());
router.use(notesRoutes.routes());
router.use(projectsRoutes.routes());
router.use(tasksRoutes.routes());

module.exports = router;
