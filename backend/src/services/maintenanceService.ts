import Note from '../models/Note.js';
import Project from '../models/Project.js';

type UpdateLike = {
  matchedCount?: number;
  modifiedCount?: number;
};

type CleanupCounts = {
  matchedCount: number;
  modifiedCount: number;
};

export type LegacyProductStatusCleanupResult = {
  packetType: 'legacy_product_status_cleanup';
  version: 1;
  notes: CleanupCounts;
  projects: CleanupCounts;
};

function cleanupCounts(result: UpdateLike): CleanupCounts {
  return {
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0
  };
}

export async function cleanLegacyProductStatus(): Promise<LegacyProductStatusCleanupResult> {
  const [notesResult, projectsResult] = await Promise.all([
    Note.collection.updateMany(
      { status: 'archived' },
      { $unset: { status: '' } }
    ),
    Project.collection.updateMany(
      { status: 'archived' },
      { $set: { status: 'pending' } }
    )
  ]);

  return {
    packetType: 'legacy_product_status_cleanup',
    version: 1,
    notes: cleanupCounts(notesResult),
    projects: cleanupCounts(projectsResult)
  };
}

export default {
  cleanLegacyProductStatus
};
