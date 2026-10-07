/**
 * Electron learning host: opens the existing frontend and owns local servers.
 * Setup/lifecycle notes: README.md and docs/Assumptions.md.
 * Wiki: wiki/Authentication.md and wiki/Internationalization.md.
 */
import { app, BrowserWindow, dialog, Menu, session, ipcMain } from 'electron';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DesktopLanguage, acceptsLanguageSender } from './language';
import { getDesktopConfig } from './config';
import { assertPortAvailable, LocalServers } from './localServers';

const smokeTest = process.argv.includes('--smoke-test');
const production = process.argv.includes('--production');
const root = resolve(__dirname, '../..');
const language = new DesktopLanguage(root);
let failed = false;
const servers = new LocalServers(() =>
  fail(new Error(language.text('desktop.serverStopped'))),
);

function fail(error: unknown): void {
  if (failed) return;
  failed = true;
  const message =
    error instanceof Error ? error.message : 'Desktop startup failed.';
  console.error(message);
  if (!smokeTest)
    dialog.showErrorBox(
      language.text('desktop.startupTitle'),
      language.text('desktop.startupError'),
    );
  servers.stop();
  app.exit(1);
}

if (!app.requestSingleInstanceLock()) app.exit(0);
else {
  app.on('before-quit', () => servers.stop());
  app.on('window-all-closed', () => app.quit());
  process.on('SIGINT', () => app.quit());
  process.on('SIGTERM', () => app.quit());
  void app
    .whenReady()
    .then(async () => {
      const config = getDesktopConfig(root);
      await servers.start(config, production);
      session.defaultSession.setPermissionRequestHandler(
        (_webContents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      const window = new BrowserWindow({
        title: language.text('desktop.title'),
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false,
        backgroundColor: '#F7F6FB',
        webPreferences: {
          preload: resolve(__dirname, 'preload.js'),
          ...(smokeTest ? { partition: 'auth-smoke' } : {}),
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        },
      });
      window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      window.webContents.on('will-navigate', (event, url) => {
        if (new URL(url).origin !== config.frontendUrl) event.preventDefault();
      });
      function updateNativeLanguage() {
        window.setTitle(language.text('desktop.title'));
        Menu.setApplicationMenu(
          Menu.buildFromTemplate([
            {
              label: language.text('desktop.demo'),
              submenu: [
                { role: 'reload', label: language.text('desktop.reload') },
                {
                  role: 'toggleDevTools',
                  label: language.text('desktop.developerTools'),
                },
                { type: 'separator' },
                { role: 'quit', label: language.text('desktop.quit') },
              ],
            },
            {
              label: language.text('desktop.view'),
              submenu: [
                {
                  role: 'resetZoom',
                  label: language.text('desktop.resetZoom'),
                },
                { role: 'zoomIn', label: language.text('desktop.zoomIn') },
                { role: 'zoomOut', label: language.text('desktop.zoomOut') },
                {
                  role: 'togglefullscreen',
                  label: language.text('desktop.fullscreen'),
                },
              ],
            },
          ]),
        );
      }
      updateNativeLanguage();
      ipcMain.on('app:set-language', (event, code: unknown) => {
        if (
          event.senderFrame === window.webContents.mainFrame &&
          acceptsLanguageSender(
            event.sender.id,
            window.webContents.id,
            event.senderFrame.url,
            config.frontendUrl,
          ) &&
          language.change(code)
        )
          updateNativeLanguage();
      });
      await window.loadURL(config.frontendUrl);
      if (smokeTest) {
        const result = await window.webContents.executeJavaScript(
          `({ title: document.title, heading: document.querySelector('h1')?.textContent, nodeAvailable: typeof process !== 'undefined' || typeof require !== 'undefined' })`,
        );
        if (
          (result.heading !== 'Sign in' && result.heading !== 'Đăng nhập') ||
          result.nodeAvailable
        )
          throw new Error(
            'The renderer did not load correctly or exposes Node APIs.',
          );
        await window.webContents.executeJavaScript(
          "(async () => { const wait = async (check) => { const end = Date.now() + 10000; while (!check()) { if (Date.now() > end) throw new Error('Renderer language hydration timed out'); await new Promise(r => setTimeout(r, 25)); } }; await wait(() => Boolean(window.desktopLanguage)); const select = document.querySelector('select'); const input = document.querySelector('input[autocomplete=username]'); if (!select || !input) throw new Error('Missing accessible language/login controls'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'PreservedCase'); input.dispatchEvent(new Event('input', { bubbles: true })); select.value = 'vn'; select.dispatchEvent(new Event('change', { bubbles: true })); await wait(() => document.documentElement.lang === 'vi'); if (document.querySelector('input[autocomplete=username]').value !== 'PreservedCase') throw new Error('Language switching lost form input'); })()",
        );
        const nativeDeadline = Date.now() + 10000;
        const expectedNative = new DesktopLanguage(root);
        expectedNative.change('vn');
        while (window.getTitle() !== expectedNative.text('desktop.title')) {
          if (Date.now() > nativeDeadline)
            throw new Error(
              'Native window did not follow the renderer language',
            );
          await new Promise((done) => setTimeout(done, 25));
        }
        for (const [width, height] of [
          [1200, 800],
          [800, 600],
        ]) {
          window.setSize(width, height);
          const fits = await window.webContents.executeJavaScript(
            'new Promise(resolve => requestAnimationFrame(() => resolve(document.documentElement.scrollWidth <= window.innerWidth)))',
          );
          if (!fits)
            throw new Error(
              'Login layout overflows the supported desktop width',
            );
        }
        const outputDirectory = resolve(root, 'desktop/coverage');
        await mkdir(outputDirectory, { recursive: true });
        await writeFile(
          resolve(outputDirectory, 'electron-smoke.png'),
          (await window.webContents.capturePage()).toPNG(),
        );
        servers.stop();
        await assertPortAvailable(config.frontendPort);
        await assertPortAvailable(config.backendPort);
        console.log(
          'Electron smoke passed: real login renderer loaded, Vietnamese/native switching preserves input, both widths fit, Node APIs isolated, owned servers stopped.',
        );
        app.exit(0);
      } else window.show();
    })
    .catch(fail);
}
