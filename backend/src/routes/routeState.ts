import type { ObjectId } from '../domain/objectIds.js';
import type {
  ObjectIdsState,
  ValidatedBodyState
} from './routeTypes.js';

type ValidatedBodyContext = {
  state: ValidatedBodyState<unknown>;
};

type ObjectIdsContext = {
  state: ObjectIdsState;
};

function missingRouteStateValue(name: string): Error {
  return new Error(`Missing route state value: ${name}`);
}

export function validatedBody<TBody>(ctx: ValidatedBodyContext): TBody {
  const body = ctx.state.validatedBody;
  if (body === undefined) {
    throw missingRouteStateValue('validatedBody');
  }

  return body as TBody;
}

export function parsedObjectId(ctx: ObjectIdsContext, key: string): ObjectId | null | undefined {
  return ctx.state.objectIds?.[key];
}

export function objectId(ctx: ObjectIdsContext, key = 'id'): ObjectId {
  const parsed = parsedObjectId(ctx, key);
  if (!parsed) {
    throw missingRouteStateValue(`objectIds.${key}`);
  }

  return parsed;
}
