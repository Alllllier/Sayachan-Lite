const {
  noteCreateSchema,
  noteUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema
} = require('./__generated__/mutations');

/** @typedef {import('./__generated__/mutations').NoteCreateDto} NoteCreateDto */
/** @typedef {import('./__generated__/mutations').NoteUpdateDto} NoteUpdateDto */
/** @typedef {import('./__generated__/mutations').ProjectCreateDto} ProjectCreateDto */
/** @typedef {import('./__generated__/mutations').ProjectUpdateDto} ProjectUpdateDto */
/** @typedef {import('./__generated__/mutations').TaskCreateDto} TaskCreateDto */
/** @typedef {import('./__generated__/mutations').TaskUpdateDto} TaskUpdateDto */

module.exports = {
  noteCreateSchema,
  noteUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema
};
