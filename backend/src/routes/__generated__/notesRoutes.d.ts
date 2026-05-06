import Router from '@koa/router';
type CurrentUserState = {
    user?: {
        _id?: unknown;
        role?: string;
        email?: string;
    };
    userId: unknown;
};
type NotesState = CurrentUserState & {
    validatedBody?: unknown;
};
declare const router: Router<NotesState, import("koa").DefaultContext>;
export = router;
