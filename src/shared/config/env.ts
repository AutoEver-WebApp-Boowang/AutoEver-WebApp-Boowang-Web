type ApiMode = 'mock' | 'api'

const apiMode: ApiMode =
    import.meta.env.VITE_API_MODE === 'api' ? 'api' : 'mock'

export const env = {
    apiMode,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
}