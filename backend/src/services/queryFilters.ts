export type QueryFilter = Record<string, unknown>;

export function buildArchiveFilter(archived: unknown): QueryFilter {
  if (archived === 'true') {
    return { archived: true };
  }

  return { archived: { $ne: true } };
}

function isObjectFilter(filter: unknown): filter is QueryFilter {
  return Boolean(filter) && typeof filter === 'object' && !Array.isArray(filter);
}

export function combineFilters(...filters: unknown[]): QueryFilter {
  const clauses = filters.filter((filter): filter is QueryFilter => (
    isObjectFilter(filter) && Object.keys(filter).length > 0
  ));

  if (clauses.length === 0) {
    return {};
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  return {
    $and: clauses
  };
}

export function changedOnlyFilter(filter: QueryFilter, update: QueryFilter): QueryFilter {
  return {
    ...filter,
    $or: Object.entries(update).map(([field, value]) => ({ [field]: { $ne: value } }))
  };
}
