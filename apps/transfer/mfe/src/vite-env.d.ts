interface ImportMetaEnv {
  readonly VITE_ACCOUNT_SVC_PORT: string;
  readonly VITE_TRANSFER_SVC_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
