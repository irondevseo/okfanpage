import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { registerAuthIpc } from './main-process/auth-ipc';
import { registerCompetitorIpc } from './main-process/competitor-ipc';
import { registerDownloaderIpc } from './main-process/downloader-ipc';
import { registerPostHistoryIpc } from './main-process/post-history-ipc';
import { registerReupIpc } from './main-process/reup-ipc';
import { registerSettingsIpc } from './main-process/settings-ipc';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 720,
    minHeight: 520,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  registerAuthIpc();
  registerSettingsIpc();
  registerCompetitorIpc();
  registerReupIpc();
  registerDownloaderIpc();
  registerPostHistoryIpc();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
