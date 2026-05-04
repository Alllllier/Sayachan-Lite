const Note = require('../models/Note');
const Task = require('../models/Task');
const {
  archiveTasks,
  buildArchiveFilter,
  combineFilters,
  normalizeNote,
  restoreTasks
} = require('./taskRuntimeHelpers');
const { ownedFilter, ownerFilter, requireUserId } = require('./ownership');

async function listNotes({ archived, userId } = {}) {
  const notes = await Note.find(combineFilters(buildArchiveFilter(archived), ownerFilter(userId)))
    .sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return notes.map(normalizeNote);
}

async function createNote(body, { userId } = {}) {
  const note = await Note.create({
    title: body.title,
    content: body.content || '',
    archived: false,
    userId: requireUserId(userId)
  });

  return normalizeNote(note);
}

async function updateNote(id, body, { userId } = {}) {
  const note = await Note.findOneAndUpdate(
    ownedFilter(id, userId),
    { title: body.title, content: body.content },
    { new: true, runValidators: true }
  );

  return normalizeNote(note);
}

async function deleteNote(id, { userId } = {}) {
  const note = await Note.findOneAndDelete(ownedFilter(id, userId));
  return Boolean(note);
}

async function pinNote(id, { userId } = {}) {
  const note = await Note.findOneAndUpdate(
    ownedFilter(id, userId),
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Pin] "${note.title}" pinned`);
  }

  return normalizeNote(note);
}

async function unpinNote(id, { userId } = {}) {
  const note = await Note.findOneAndUpdate(
    ownedFilter(id, userId),
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Unpin] "${note.title}" unpinned`);
  }

  return normalizeNote(note);
}

async function archiveNote(id, { userId } = {}) {
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

  return normalizeNote(note);
}

async function restoreNote(id, { userId } = {}) {
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

  return normalizeNote(note);
}

module.exports = {
  archiveNote,
  createNote,
  deleteNote,
  listNotes,
  pinNote,
  restoreNote,
  unpinNote,
  updateNote
};
