import { optionalObjectId, toObjectId } from '../../domain/objectIds.js';
import type { ObjectId } from '../../domain/objectIds.js';
import type {
  ObjectIdsState,
  RouteContext,
  RouteMiddleware,
  ValidatedBodyState
} from '../../routes/routeTypes.js';

type ObjectIdLocation = 'params' | 'query' | 'body';

type ObjectIdParsingState = ObjectIdsState & ValidatedBodyState<unknown>;

function objectBody(body: unknown): Record<string, unknown> | null {
  return body && typeof body === 'object' && !Array.isArray(body)
    ? body as Record<string, unknown>
    : null;
}

function readObjectIdSource<TState extends ObjectIdParsingState>(
  ctx: RouteContext<TState>,
  location: ObjectIdLocation,
  field: string
): unknown {
  if (location === 'params') {
    return ctx.params?.[field];
  }

  if (location === 'query') {
    return ctx.query?.[field];
  }

  return objectBody(ctx.state.validatedBody)?.[field];
}

function parsedStateKey(location: ObjectIdLocation, field: string, stateKey?: string): string {
  return stateKey || (location === 'params' && field === 'id' ? 'id' : field);
}

export function parseObjectId<TState extends ObjectIdParsingState = ObjectIdParsingState>(
  location: ObjectIdLocation,
  field: string,
  { optional = false, stateKey }: { optional?: boolean; stateKey?: string } = {}
): RouteMiddleware<TState> {
  return async (ctx: RouteContext<TState>, next): Promise<void> => {
    const source = `${location}.${field}`;
    const value = readObjectIdSource(ctx, location, field);
    const parsed = optional ? optionalObjectId(value, source) : toObjectId(value, source);
    ctx.state.objectIds = {
      ...ctx.state.objectIds,
      [parsedStateKey(location, field, stateKey)]: parsed
    };
    await next();
  };
}

export function parseParamObjectId<TState extends ObjectIdParsingState = ObjectIdParsingState>(
  field: string,
  options?: { optional?: boolean; stateKey?: string }
): RouteMiddleware<TState> {
  return parseObjectId<TState>('params', field, options);
}

export function parseQueryObjectId<TState extends ObjectIdParsingState = ObjectIdParsingState>(
  field: string,
  options?: { optional?: boolean; stateKey?: string }
): RouteMiddleware<TState> {
  return parseObjectId<TState>('query', field, options);
}

export function parseBodyObjectId<TState extends ObjectIdParsingState = ObjectIdParsingState>(
  field: string,
  options?: { optional?: boolean; stateKey?: string }
): RouteMiddleware<TState> {
  return parseObjectId<TState>('body', field, options);
}
