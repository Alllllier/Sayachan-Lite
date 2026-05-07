import Router from '@koa/router';

import type {
  NoteCreateDto,
  NoteUpdateDto
} from './schemas/mutations.js';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';

type NotesState = AuthenticatedRouteState;
type NotesHandler = RouteHandler<NotesState>;

import notesService from '../services/notesService.js';
import {
  noteCreateSchema,
  noteUpdateSchema
} from './schemas/mutations.js';
import { requireCurrentUser } from '../middleware/route/currentUser.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import { parseParamObjectId } from '../middleware/route/objectIdParsing.js';
import { objectId, validatedBody } from './routeState.js';

const router = new Router<NotesState>();

const listNotesHandler: NotesHandler = async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await notesService.listNotes({ archived, userId: ctx.state.userId });
};

const createNoteHandler: NotesHandler = async (ctx) => {
  const body = validatedBody<NoteCreateDto>(ctx);
  ctx.status = 201;
  ctx.body = await notesService.createNote(body, { userId: ctx.state.userId });
};

const updateNoteHandler: NotesHandler = async (ctx) => {
  const id = objectId(ctx);
  const body = validatedBody<NoteUpdateDto>(ctx);
  const note = await notesService.updateNote(id, body, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
  } else {
    ctx.body = note;
  }
};

const deleteNoteHandler: NotesHandler = async (ctx) => {
  const id = objectId(ctx);
  const deleted = await notesService.deleteNote(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
};

const pinNoteHandler: NotesHandler = async (ctx) => {
  const id = objectId(ctx);
  const note = await notesService.pinNote(id, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  ctx.body = note;
};

const unpinNoteHandler: NotesHandler = async (ctx) => {
  const id = objectId(ctx);
  const note = await notesService.unpinNote(id, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  ctx.body = note;
};

const archiveNoteHandler: NotesHandler = async (ctx) => {
  const id = objectId(ctx);
  const note = await notesService.archiveNote(id, { userId: ctx.state.userId });

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = note;
};

const restoreNoteHandler: NotesHandler = async (ctx) => {
  const id = objectId(ctx);
  const note = await notesService.restoreNote(id, { userId: ctx.state.userId });

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = note;
};

router.get('/notes', requireCurrentUser, listNotesHandler);
router.post('/notes', requireCurrentUser, validateBody<NoteCreateDto, NotesState>(noteCreateSchema), createNoteHandler);
router.put('/notes/:id', requireCurrentUser, parseParamObjectId<NotesState>('id'), validateBody<NoteUpdateDto, NotesState>(noteUpdateSchema), updateNoteHandler);
router.delete('/notes/:id', requireCurrentUser, parseParamObjectId<NotesState>('id'), deleteNoteHandler);
router.put('/notes/:id/pin', requireCurrentUser, parseParamObjectId<NotesState>('id'), pinNoteHandler);
router.put('/notes/:id/unpin', requireCurrentUser, parseParamObjectId<NotesState>('id'), unpinNoteHandler);
router.put('/notes/:id/archive', requireCurrentUser, parseParamObjectId<NotesState>('id'), archiveNoteHandler);
router.put('/notes/:id/restore', requireCurrentUser, parseParamObjectId<NotesState>('id'), restoreNoteHandler);

export default router;
