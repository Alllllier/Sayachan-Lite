const Router = require('@koa/router');
const healthRoutes = require('./healthRoutes');
const notesRoutes = require('./notesRoutes');
const projectsRoutes = require('./projectsRoutes');
const tasksRoutes = require('./tasksRoutes');

const router = new Router();

router.use(healthRoutes.routes());
router.use(notesRoutes.routes());
router.use(projectsRoutes.routes());
router.use(tasksRoutes.routes());

module.exports = router;
module.exports.__test__ = tasksRoutes.__test__;
