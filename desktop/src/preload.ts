import { contextBridge, ipcRenderer } from 'electron';
/** Single native capability: select a language. No filesystem/process/token access. */
contextBridge.exposeInMainWorld('desktopLanguage', {
  setLanguage: (code: unknown) => {
    if (typeof code === 'string' && /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(code))
      ipcRenderer.send('app:set-language', code);
  },
});
