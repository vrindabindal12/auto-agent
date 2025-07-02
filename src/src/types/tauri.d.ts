declare global {
  interface Window {
    __TAURI__?: any;
    __TAURI_IPC__?: any;
  }
}

export {};