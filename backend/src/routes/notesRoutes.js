const Router = require('@koa/router');
const notesService = require('../services/notesService');
const { requireCurrentUser } = require('../middleware/currentUser');
const {
  validateNoteCreate,
  validateNoteUpdate
} = require('./requestValidation');
const route = require('./routeBoundary');

const router = new Router();

// GET /notes
router.get('/notes', requireCurrentUser, route(async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await notesService.listNotes({ archived, userId: ctx.state.userId });
}));

// POST /notes
router.post('/notes', requireCurrentUser, route(async (ctx) => {
  const body = ctx.request.body;
  validateNoteCreate(body);
  ctx.status = 201;
  ctx.body = await notesService.createNote(body, { userId: ctx.state.userId });
}));

// PUT /notes/:id
router.put('/notes/:id', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  validateNoteUpdate(body);
  const note = await notesService.updateNote(id, body, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
  } else {
    ctx.body = note;
  }
}));

// DELETE /notes/:id
router.delete('/notes/:id', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const deleted = await notesService.deleteNote(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
}));

// PUT /notes/:id/pin - Pin note (does not update content timestamp)
router.put('/notes/:id/pin', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const note = await notesService.pinNote(id, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  ctx.body = note;
}));

// PUT /notes/:id/unpin - Unpin note (does not update content timestamp)
router.put('/notes/:id/unpin', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const note = await notesService.unpinNote(id, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  ctx.body = note;
}));

// PUT /notes/:id/archive - Archive note and cascade to tasks
router.put('/notes/:id/archive', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const note = await notesService.archiveNote(id, { userId: ctx.state.userId });

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = note;
}));

// PUT /notes/:id/restore - Restore note and cascade to tasks
router.put('/notes/:id/restore', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const note = await notesService.restoreNote(id, { userId: ctx.state.userId });

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = note;
}));

module.exports = router;
