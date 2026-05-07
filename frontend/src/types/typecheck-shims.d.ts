declare module 'vue' {
  export type Ref<T> = { value: T }
  export type ComputedRef<T> = { readonly value: T }

  export function createApp(component: unknown): {
    use(plugin: unknown): unknown
    mount(selector: string): unknown
  }
  export function defineProps<T>(): T
  export function defineEmits<T>(): T extends Record<string, infer TArgs>
    ? <TEvent extends keyof T>(event: TEvent, ...args: TArgs extends unknown[] ? TArgs : never) => void
    : never
  export function defineOptions(options: Record<string, unknown>): void
  export function withDefaults<T, TDefaults extends Partial<T>>(props: T, defaults: TDefaults): T & Required<TDefaults>
  export function ref<T>(value: T): { value: T }
  export function reactive<T extends object>(value: T): T
  export function computed<T>(getter: () => T): ComputedRef<T>
  export function unref<T>(value: T | Ref<T>): T
}

declare module 'pinia' {
  type UnwrapSetupStore<TStore> = {
    [K in keyof TStore]: TStore[K] extends { value: infer TValue } ? TValue : TStore[K]
  }

  export function createPinia(): unknown
  export function defineStore<TStore>(id: string, setup: () => TStore): () => UnwrapSetupStore<TStore>
  export function defineStore<TStore>(id: string, options: unknown): () => TStore
}

declare module 'vue-router' {
  export type RouteRecordRaw = {
    path: string
    redirect?: string
    component?: () => Promise<unknown>
    meta?: Record<string, unknown>
  }

  export function createRouter(options: { history: unknown, routes: RouteRecordRaw[] }): {
    beforeEach(callback: (to: { meta: Record<string, unknown>, fullPath: string }) => unknown): unknown
  }
  export function createWebHistory(): unknown
}

declare module '*.vue' {
  const component: unknown
  export default component
}

declare module 'highlight.js' {
  const hljs: {
    getLanguage(language: string): unknown
    highlight(code: string, options: { language: string }): { value: string }
  }
  export default hljs
}

declare module 'dompurify' {
  const DOMPurify: {
    sanitize(html: string): string
  }
  export default DOMPurify
}

interface ImportMeta {
  readonly env: {
    readonly VITE_API_BASE_URL?: string
  }
}
