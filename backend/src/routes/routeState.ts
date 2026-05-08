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

export function objectId(ctx: ObjectIdsContext, key = 'id'): ObjectId {
  const parsed = ctx.state.objectIds?.[key];
  if (!parsed) {
    throw missingRouteStateValue(`objectIds.${key}`);
  }

  return parsed;
}
