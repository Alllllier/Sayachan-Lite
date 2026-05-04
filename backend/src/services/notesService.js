const Note = require('../models/Note');
const Task = require('../models/Task');
const {
  archiveTasks,
  buildArchiveFilter,
  combineFilters,
  normalizeNote,
  restoreTasks
} = require('./taskRuntimeHelpers');

function buildOwnerFilter(userId) {
  return userId ? { userId } : {};
}

function buildOwnedFilter(id, userId) {
  return userId ? { _id: id, userId } : { _id: id };
}

async function listNotes({ archived, userId } = {}) {
  const notes = await Note.find(combineFilters(buildArchiveFilter(archived), buildOwnerFilter(userId)))
    .sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return notes.map(normalizeNote);
}

async function createNote(body, { userId } = {}) {
  const note = await Note.create({
    title: body.title,
    content: body.content || '',
    archived: false,
    userId: userId || null
  });

  return normalizeNote(note);
}

async function updateNote(id, body, { userId } = {}) {
  const note = userId ? await Note.findOneAndUpdate(
    buildOwnedFilter(id, userId),
    { title: body.title, content: body.content },
    { new: true, runValidators: true }
  ) : await Note.findByIdAndUpdate(
    id,
    { title: body.title, content: body.content },
    { new: true, runValidators: true }
  );

  return normalizeNote(note);
}

async function deleteNote(id, { userId } = {}) {
  const note = userId
    ? await Note.findOneAndDelete(buildOwnedFilter(id, userId))
    : await Note.findByIdAndDelete(id);
  return Boolean(note);
}

async function pinNote(id, { userId } = {}) {
  const note = userId ? await Note.findOneAndUpdate(
    buildOwnedFilter(id, userId),
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  ) : await Note.findByIdAndUpdate(
    id,
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Pin] "${note.title}" pinned`);
  }

  return normalizeNote(note);
}

async function unpinNote(id, { userId } = {}) {
  const note = userId ? await Note.findOneAndUpdate(
    buildOwnedFilter(id, userId),
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  ) : await Note.findByIdAndUpdate(
    id,
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Unpin] "${note.title}" unpinned`);
  }

  return normalizeNote(note);
}

async function archiveNote(id, { userId } = {}) {
  const note = userId ? await Note.findOneAndUpdate(
    buildOwnedFilter(id, userId),
    { archived: true },
    { new: true, runValidators: true }
  ) : await Note.findByIdAndUpdate(
    id,
    { archived: true },
    { new: true, runValidators: true }
  );

  if (!note) {
    return null;
  }

  const modifiedCount = await archiveTasks(Task, {
    originId: id,
    originModule: 'note',
    ...buildOwnerFilter(userId)
  });

  console.log(`[Note Archive] Note "${note.title}" archived, ${modifiedCount} tasks cascaded`);

  return normalizeNote(note);
}

async function restoreNote(id, { userId } = {}) {
  const note = userId ? await Note.findOneAndUpdate(
    buildOwnedFilter(id, userId),
    { archived: false },
    { new: true, runValidators: true }
  ) : await Note.findByIdAndUpdate(
    id,
    { archived: false },
    { new: true, runValidators: true }
  );

  if (!note) {
    return null;
  }

  const modifiedCount = await restoreTasks(Task, {
    originId: id,
    originModule: 'note',
    ...buildOwnerFilter(userId)
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
