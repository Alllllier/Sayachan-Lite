import type { RouterContext, RouterMiddleware } from '@koa/router';

import type { ObjectId } from '../domain/objectIds.js';

export type CurrentUser = {
  _id?: unknown;
  role?: string;
  email?: string;
  coreSubjectId?: string | null;
};

export type OptionalCurrentUserState = {
  user?: CurrentUser;
};

export type CurrentUserState = OptionalCurrentUserState & {
  userId: ObjectId;
};

export type ValidatedBodyState<TBody = unknown> = {
  validatedBody?: TBody;
};

export type ObjectIdsState = {
  objectIds?: Record<string, ObjectId | null>;
};

export type RouteState<TBody = unknown> = OptionalCurrentUserState &
  ValidatedBodyState<TBody> &
  ObjectIdsState;

export type AuthenticatedRouteState<TBody = unknown> = CurrentUserState &
  ValidatedBodyState<TBody> &
  ObjectIdsState;

export type RouteContext<TState = RouteState, TBody = unknown> = RouterContext<TState, object, TBody>;
export type RouteMiddleware<TState = RouteState, TBody = unknown> = RouterMiddleware<TState, object, TBody>;
export type RouteHandler<TState = RouteState, TBody = unknown> = RouteMiddleware<TState, TBody>;

export type ValidationIssue = {
  code: string;
  path: PropertyKey[];
  message: string;
};

export type RequestBodySchema<TBody> = {
  safeParse(body: unknown): { success: true; data: TBody } | { success: false; error: { issues: ValidationIssue[] } };
};
