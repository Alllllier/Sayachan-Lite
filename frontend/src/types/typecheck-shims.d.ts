declare module 'vue' {
  export type Ref<T> = { value: T }
  export type ComputedRef<T> = { readonly value: T }

  export function ref<T>(value: T): { value: T }
  export function reactive<T extends object>(value: T): T
  export function computed<T>(getter: () => T): ComputedRef<T>
  export function unref<T>(value: T | Ref<T>): T
}

interface ImportMeta {
  readonly env: {
    readonly VITE_API_BASE_URL?: string
  }
}
