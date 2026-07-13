/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Linkskool API base URL. */
  readonly VITE_API_BASE_URL?: string;
  /** Public API key for browser requests (prefer a backend proxy for secrets). */
  readonly VITE_API_KEY?: string;
  /** Legacy backend API base URL. */
  readonly VITE_API_URL?: string;
  /** Base URL for remote translation files. Unset => bundled translations only. */
  readonly VITE_I18N_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
