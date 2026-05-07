declare module 'vue' {
  export function ref<T>(value: T): { value: T }
}

interface ImportMeta {
  readonly env: {
    readonly VITE_API_BASE_URL?: string
  }
}
