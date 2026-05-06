import Router, { type RouterMiddleware } from '@koa/router';

import type {
  NoteCreateDto,
  NoteUpdateDto
} from './schemas/mutations';
import { type ObjectId } from '../middleware/objectIdParsing';

type CurrentUserState = {
  user?: {
    _id?: unknown;
    role?: string;
    email?: string;
  };
  userId: ObjectId;
};

type NotesState = CurrentUserState & {
  objectIds?: Record<string, ObjectId | null>;
  validatedBody?: unknown;
};

type NotesMiddleware = RouterMiddleware<NotesState>;
type NotesHandler = RouterMiddleware<NotesState>;

type RequestBodySchema<TBody> = {
  safeParse(body: unknown): { success: true; data: TBody } | { success: false; error: unknown };
};

type ValidateBody = <TBody>(schema: RequestBodySchema<TBody>) => NotesMiddleware;

type NotesServiceOptions = {
  userId: ObjectId;
};

type ListNotesOptions = NotesServiceOptions & {
  archived?: unknown;
};

type NotesService = {
  listNotes(options: ListNotesOptions): Promise<unknown>;
  createNote(body: NoteCreateDto, options: NotesServiceOptions): Promise<unknown>;
  updateNote(id: ObjectId, body: NoteUpdateDto, options: NotesServiceOptions): Promise<unknown>;
  deleteNote(id: ObjectId, options: NotesServiceOptions): Promise<boolean>;
  pinNote(id: ObjectId, options: NotesServiceOptions): Promise<unknown>;
  unpinNote(id: ObjectId, options: NotesServiceOptions): Promise<unknown>;
  archiveNote(id: ObjectId, options: NotesServiceOptions): Promise<unknown>;
  restoreNote(id: ObjectId, options: NotesServiceOptions): Promise<unknown>;
};

const notesService = require('../services/notesService') as NotesService;
const {
  noteCreateSchema,
  noteUpdateSchema
} = require('./schemas/mutations') as {
  noteCreateSchema: RequestBodySchema<NoteCreateDto>;
  noteUpdateSchema: RequestBodySchema<NoteUpdateDto>;
};
const { requireCurrentUser } = require('../middleware/currentUser') as {
  requireCurrentUser: NotesMiddleware;
};
const { validateBody } = require('../middleware/requestBodyValidation') as {
  validateBody: ValidateBody;
};
const { parseParamObjectId } = require('../middleware/objectIdParsing') as {
  parseParamObjectId: (field: string) => NotesMiddleware;
};

const router = new Router<NotesState>();

function validatedBody<TBody>(ctx: Parameters<NotesHandler>[0]): TBody {
  return ctx.state.validatedBody as TBody;
}

function noteId(ctx: Parameters<NotesHandler>[0]): ObjectId {
  return ctx.state.objectIds?.id as ObjectId;
}

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
  const id = noteId(ctx);
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
  const id = noteId(ctx);
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
  const id = noteId(ctx);
  const note = await notesService.pinNote(id, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  ctx.body = note;
};

const unpinNoteHandler: NotesHandler = async (ctx) => {
  const id = noteId(ctx);
  const note = await notesService.unpinNote(id, { userId: ctx.state.userId });
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  ctx.body = note;
};

const archiveNoteHandler: NotesHandler = async (ctx) => {
  const id = noteId(ctx);
  const note = await notesService.archiveNote(id, { userId: ctx.state.userId });

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = note;
};

const restoreNoteHandler: NotesHandler = async (ctx) => {
  const id = noteId(ctx);
  const note = await notesService.restoreNote(id, { userId: ctx.state.userId });

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = note;
};

router.get('/notes', requireCurrentUser, listNotesHandler);
router.post('/notes', requireCurrentUser, validateBody(noteCreateSchema), createNoteHandler);
router.put('/notes/:id', requireCurrentUser, parseParamObjectId('id'), validateBody(noteUpdateSchema), updateNoteHandler);
router.delete('/notes/:id', requireCurrentUser, parseParamObjectId('id'), deleteNoteHandler);
router.put('/notes/:id/pin', requireCurrentUser, parseParamObjectId('id'), pinNoteHandler);
router.put('/notes/:id/unpin', requireCurrentUser, parseParamObjectId('id'), unpinNoteHandler);
router.put('/notes/:id/archive', requireCurrentUser, parseParamObjectId('id'), archiveNoteHandler);
router.put('/notes/:id/restore', requireCurrentUser, parseParamObjectId('id'), restoreNoteHandler);

export = router;
