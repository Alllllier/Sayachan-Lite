import type {
  NoteCreateDto,
  NoteUpdateDto
} from '../routes/schemas/mutations';
import type { ObjectId } from '../middleware/objectIdParsing';
import {
  buildArchiveFilter,
  combineFilters
} from '../domain/tasks/queryFilters';
import {
  archiveTasks,
  restoreTasks
} from '../domain/tasks/cascade';
import { toNoteDto } from '../domain/dtos/productDtos';
import {
  ownedFilter,
  ownerFilter,
  requireUserId
} from '../domain/ownership';
import NoteModel = require('../models/Note');
import TaskModel = require('../models/Task');

const Note = NoteModel;
const Task = TaskModel;

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

type QueryFilter = Record<string, unknown>;

async function listNotes({ archived, userId }: ListNotesOptions) {
  const notes = await Note.find(combineFilters(buildArchiveFilter(archived), ownerFilter(userId)))
    .sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return notes.map(toNoteDto);
}

async function createNote(body: NoteCreateDto, { userId }: ServiceOptions) {
  const note = await Note.create({
    title: body.title,
    content: body.content || '',
    archived: false,
    userId: requireUserId(userId)
  });

  return toNoteDto(note);
}

function buildNoteUpdate(body: NoteUpdateDto): NoteUpdate {
  const update: NoteUpdate = {};
  if (body.title !== undefined) {
    update.title = body.title;
  }
  if (body.content !== undefined) {
    update.content = body.content;
  }
  return update;
}

function changedOnlyFilter(filter: QueryFilter, update: NoteUpdate): QueryFilter {
  return {
    ...filter,
    $or: Object.entries(update).map(([field, value]) => ({ [field]: { $ne: value } }))
  };
}

async function updateNote(id: ObjectId, body: NoteUpdateDto, { userId }: ServiceOptions) {
  const filter = ownedFilter(id, userId);
  const update = buildNoteUpdate(body);
  const note = await Note.findOneAndUpdate(
    changedOnlyFilter(filter, update),
    update,
    { new: true, runValidators: true }
  );

  return toNoteDto(note || await Note.findOne(filter));
}

async function deleteNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndDelete(ownedFilter(id, userId));
  return Boolean(note);
}

async function pinNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndUpdate(
    ownedFilter(id, userId),
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Pin] "${note.title}" pinned`);
  }

  return toNoteDto(note);
}

async function unpinNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndUpdate(
    ownedFilter(id, userId),
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Unpin] "${note.title}" unpinned`);
  }

  return toNoteDto(note);
}

async function archiveNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndUpdate(
    ownedFilter(id, userId),
    { archived: true },
    { new: true, runValidators: true }
  );

  if (!note) {
    return null;
  }

  const modifiedCount = await archiveTasks(Task, {
    originId: id,
    originModule: 'note',
    ...ownerFilter(userId)
  });

  console.log(`[Note Archive] Note "${note.title}" archived, ${modifiedCount} tasks cascaded`);

  return toNoteDto(note);
}

async function restoreNote(id: ObjectId, { userId }: ServiceOptions) {
  const note = await Note.findOneAndUpdate(
    ownedFilter(id, userId),
    { archived: false },
    { new: true, runValidators: true }
  );

  if (!note) {
    return null;
  }

  const modifiedCount = await restoreTasks(Task, {
    originId: id,
    originModule: 'note',
    ...ownerFilter(userId)
  });

  console.log(`[Note Restore] Note "${note.title}" restored, ${modifiedCount} tasks cascaded`);

  return toNoteDto(note);
}

export = {
  archiveNote,
  createNote,
  deleteNote,
  listNotes,
  pinNote,
  restoreNote,
  unpinNote,
  updateNote
};
