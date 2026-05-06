// @ts-ignore dto-pilot keeps module resolution narrow and relies on runtime package loading.
const Router = require('@koa/router');
const notesService = require('../services/notesService');
const { requireCurrentUser } = require('../middleware/currentUser');
const { validateBody } = require('../middleware/requestBodyValidation');
const {
  noteCreateSchema,
  noteUpdateSchema
} = require('./schemas/mutations');

const router = new Router();

// GET /notes
router.get('/notes', requireCurrentUser, async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await notesService.listNotes({ archived, userId: ctx.state.userId });
});

// POST /notes
router.post('/notes', requireCurrentUser, validateBody(noteCreateSchema), async (ctx) => {
  /** @type {import('./schemas/mutations').NoteCreateDto} */
  const body = ctx.state.validatedBody;
  ctx.status = 201;
  ctx.body = await notesService.createNote(body, { userId: ctx.state.userId });
});

// PUT /notes/:id
router.put('/notes/:id', requireCurrentUser, validateBody(noteUpdateSchema), async (ctx) => {
  const id = ctx.params.id;
  /** @type {import('./schemas/mutations').NoteUpdateDto} */
  const body = ctx.state.validatedBody;
  const note = await notesService.updateNote(id, body, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
  } else {
    ctx.body = note;
  }
});

// DELETE /notes/:id
router.delete('/notes/:id', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const deleted = await notesService.deleteNote(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
});

// PUT /notes/:id/pin - Pin note (does not update content timestamp)
router.put('/notes/:id/pin', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const note = await notesService.pinNote(id, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  ctx.body = note;
});

// PUT /notes/:id/unpin - Unpin note (does not update content timestamp)
router.put('/notes/:id/unpin', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const note = await notesService.unpinNote(id, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  ctx.body = note;
});

// PUT /notes/:id/archive - Archive note and cascade to tasks
router.put('/notes/:id/archive', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const note = await notesService.archiveNote(id, { userId: ctx.state.userId });

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = note;
});

// PUT /notes/:id/restore - Restore note and cascade to tasks
router.put('/notes/:id/restore', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const note = await notesService.restoreNote(id, { userId: ctx.state.userId });

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = note;
});

module.exports = router;
