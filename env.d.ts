/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RENDERER_VITE_GOOGLE_CLOUD_TRANSLATE_ENDPOINT: string
  readonly RENDERER_VITE_OPENAI_API_PROXY: string
  readonly RENDERER_VITE_GOOGLE_PROXY: string
  readonly RENDERER_VITE_OPENAI_API_KEY: string
  readonly RENDERER_VITE_ROOT_PROXY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
