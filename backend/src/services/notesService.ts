import type {
  NoteCreateDto,
  NoteUpdateDto
} from '@sayachan/contracts';
import type { ObjectId } from '../domain/objectIds.js';
import {
  buildArchiveFilter,
  changedOnlyFilter,
  combineFilters,
  type QueryFilter
} from './queryFilters.js';
import {
  archiveTasks,
  restoreTasks
} from './cascadeService.js';
import { toNoteDto } from './responses/productResponses.js';
import Note from '../models/Note.js';
import Task from '../models/Task.js';

type ServiceOptions = {
  userId: ObjectId;
};

type ListNotesOptions = ServiceOptions & {
  archived?: unknown;
};

type NoteUpdate = {
  title?: string;
  content?: string;
};

export async function listNotes({ archived, userId }: ListNotesOptions) {
  const notes = await Note.find(combineFilters(buildArchiveFilter(archived), { userId }))
    .sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return notes.map(toNoteDto);
}

export async function createNote(body: NoteCreateDto, { userId }: ServiceOptions) {
  const note = await Note.create({
    title: body.title,
    content: body.content || '',
    archived: false,
    userId
  });

  return toNoteDto(note);
}

export function buildNoteUpdate(body: NoteUpdateDto): NoteUpdate {
  const update: NoteUpdate = {};
  if (body.title !== undefined) {
    update.title = body.title;
  }
  if (body.content !== undefined) {
    update.content = body.content;
  }
  return update;
}

export async function updateNote(id: ObjectId, body: NoteUpdateDto, { userId }: ServiceOptions) {
  const filter = { _id: id, userId };
  const update = buildNoteUpdate(body);
  const note = await Note.findOneAndUpdate(
    changedOnlyFilter(filter, update),
    update,
    { new: true, runValidators: true }
  );

  return toNoteDto(note || await Note.findOne(filter));
}

export async function deleteNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndDelete({ _id: id, userId });
  return Boolean(note);
}

export async function pinNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Pin] "${note.title}" pinned`);
  }

  return toNoteDto(note);
}

export async function unpinNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Unpin] "${note.title}" unpinned`);
  }

  return toNoteDto(note);
}

export async function archiveNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    { archived: true },
    { new: true, runValidators: true }
  );

  if (!note) {
    return null;
  }

  const modifiedCount = await archiveTasks(Task, {
    originId: id,
    originModule: 'note',
    userId
  });

  console.log(`[Note Archive] Note "${note.title}" archived, ${modifiedCount} tasks cascaded`);

  return toNoteDto(note);
}

export async function restoreNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    { archived: false },
    { new: true, runValidators: true }
  );

  if (!note) {
    return null;
  }

  const modifiedCount = await restoreTasks(Task, {
    originId: id,
    originModule: 'note',
    userId
  });

  console.log(`[Note Restore] Note "${note.title}" restored, ${modifiedCount} tasks cascaded`);

  return toNoteDto(note);
}

export default {
  archiveNote,
  createNote,
  deleteNote,
  listNotes,
  pinNote,
  restoreNote,
  unpinNote,
  updateNote
};
