"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const router_1 = __importDefault(require("@koa/router"));
const notesService = require('../../services/notesService');
const { noteCreateSchema, noteUpdateSchema } = require('../schemas/mutations');
const { requireCurrentUser } = require('../../middleware/currentUser');
const { validateBody } = require('../../middleware/requestBodyValidation');
const router = new router_1.default();
function validatedBody(ctx) {
    return ctx.state.validatedBody;
}
const listNotesHandler = async (ctx) => {
    const { archived } = ctx.query;
    ctx.body = await notesService.listNotes({ archived, userId: ctx.state.userId });
};
const createNoteHandler = async (ctx) => {
    const body = validatedBody(ctx);
    ctx.status = 201;
    ctx.body = await notesService.createNote(body, { userId: ctx.state.userId });
};
const updateNoteHandler = async (ctx) => {
    const id = ctx.params.id;
    const body = validatedBody(ctx);
    const note = await notesService.updateNote(id, body, { userId: ctx.state.userId });
    if (!note) {
        ctx.status = 404;
        ctx.body = { error: 'Note not found' };
    }
    else {
        ctx.body = note;
    }
};
const deleteNoteHandler = async (ctx) => {
    const id = ctx.params.id;
    const deleted = await notesService.deleteNote(id, { userId: ctx.state.userId });
    if (!deleted) {
        ctx.status = 404;
        ctx.body = { error: 'Note not found' };
    }
    else {
        ctx.status = 204;
        ctx.body = null;
    }
};
const pinNoteHandler = async (ctx) => {
    const id = ctx.params.id;
    const note = await notesService.pinNote(id, { userId: ctx.state.userId });
    if (!note) {
        ctx.status = 404;
        ctx.body = { error: 'Note not found' };
        return;
    }
    ctx.body = note;
};
const unpinNoteHandler = async (ctx) => {
    const id = ctx.params.id;
    const note = await notesService.unpinNote(id, { userId: ctx.state.userId });
    if (!note) {
        ctx.status = 404;
        ctx.body = { error: 'Note not found' };
        return;
    }
    ctx.body = note;
};
const archiveNoteHandler = async (ctx) => {
    const id = ctx.params.id;
    const note = await notesService.archiveNote(id, { userId: ctx.state.userId });
    if (!note) {
        ctx.status = 404;
        ctx.body = { error: 'Note not found' };
        return;
    }
    ctx.body = note;
};
const restoreNoteHandler = async (ctx) => {
    const id = ctx.params.id;
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
router.put('/notes/:id', requireCurrentUser, validateBody(noteUpdateSchema), updateNoteHandler);
router.delete('/notes/:id', requireCurrentUser, deleteNoteHandler);
router.put('/notes/:id/pin', requireCurrentUser, pinNoteHandler);
router.put('/notes/:id/unpin', requireCurrentUser, unpinNoteHandler);
router.put('/notes/:id/archive', requireCurrentUser, archiveNoteHandler);
router.put('/notes/:id/restore', requireCurrentUser, restoreNoteHandler);
module.exports = router;
