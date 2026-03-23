const { app, BrowserWindow, shell, Menu, nativeImage } = require('electron')
const path = require('path')

const APP_URL = 'https://jocha-music.fly.dev'

function createWindow() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'))

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 380,
    minHeight: 600,
    icon,
    title: 'Jocha Official',
    backgroundColor: '#0F0D0A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
    },
    show: false,
    autoHideMenuBar: true,
  })

  // Afficher la fenêtre quand prête (évite le flash blanc)
  win.once('ready-to-show', () => win.show())

  // Ouvrir les liens externes dans le navigateur système
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  win.loadURL(APP_URL)

  // Gestion des erreurs de connexion
  win.webContents.on('did-fail-load', (_, errorCode) => {
    if (errorCode !== -3) { // -3 = aborted (navigation normale)
      win.loadFile(path.join(__dirname, 'offline.html')).catch(() => {})
    }
  })

  return win
}

// Menu minimal
function buildMenu() {
  const template = [
    {
      label: 'Jocha Official',
      submenu: [
        { label: 'Accueil', click: (_, win) => win?.loadURL(APP_URL) },
        { type: 'separator' },
        { label: 'Quitter', role: 'quit' },
      ],
    },
    {
      label: 'Navigation',
      submenu: [
        { label: 'Recharger', role: 'reload' },
        { label: 'Retour', click: (_, win) => { if (win?.webContents.canGoBack()) win.webContents.goBack() } },
        { label: 'Avant', click: (_, win) => { if (win?.webContents.canGoForward()) win.webContents.goForward() } },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  buildMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
