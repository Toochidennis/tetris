/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API. Unset => offline mock/local services. */
  readonly VITE_API_URL?: string;
  /** Base URL for remote translation files. Unset => bundled translations only. */
  readonly VITE_I18N_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
