const Note = require('../models/Note');
const Task = require('../models/Task');
const {
  archiveTasks,
  buildArchiveFilter,
  normalizeNote,
  restoreTasks
} = require('./taskRuntimeHelpers');

async function listNotes({ archived } = {}) {
  const notes = await Note.find(buildArchiveFilter(archived)).sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return notes.map(normalizeNote);
}

async function createNote(body) {
  const note = await Note.create({
    title: body.title,
    content: body.content || '',
    archived: false
  });

  return normalizeNote(note);
}

async function updateNote(id, body) {
  const note = await Note.findByIdAndUpdate(
    id,
    { title: body.title, content: body.content },
    { new: true, runValidators: true }
  );

  return normalizeNote(note);
}

async function deleteNote(id) {
  const note = await Note.findByIdAndDelete(id);
  return Boolean(note);
}

async function pinNote(id) {
  const note = await Note.findByIdAndUpdate(
    id,
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Pin] "${note.title}" pinned`);
  }

  return normalizeNote(note);
}

async function unpinNote(id) {
  const note = await Note.findByIdAndUpdate(
    id,
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  );

  if (note) {
    console.log(`[Note Unpin] "${note.title}" unpinned`);
  }

  return normalizeNote(note);
}

async function archiveNote(id) {
  const note = await Note.findByIdAndUpdate(
    id,
    { archived: true },
    { new: true, runValidators: true }
  );

  if (!note) {
    return null;
  }

  const modifiedCount = await archiveTasks(Task, {
    originId: id,
    originModule: 'note'
  });

  console.log(`[Note Archive] Note "${note.title}" archived, ${modifiedCount} tasks cascaded`);

  return normalizeNote(note);
}

async function restoreNote(id) {
  const note = await Note.findByIdAndUpdate(
    id,
    { archived: false },
    { new: true, runValidators: true }
  );

  if (!note) {
    return null;
  }

  const modifiedCount = await restoreTasks(Task, {
    originId: id,
    originModule: 'note'
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
