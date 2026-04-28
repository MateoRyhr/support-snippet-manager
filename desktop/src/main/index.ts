import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// Escuchar cuando React pida abrir un directorio

interface SnippetImport {
  title: string
  description: string
  content: string
  language: string
}

const extensionToLanguage: Record<string, string> = {
  // Web & UI
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'scss',
  '.less': 'less',
  '.vue': 'vue',
  '.svelte': 'svelte',
  // Backend & Sistemas
  '.py': 'python',
  '.pyw': 'python',
  '.java': 'java',
  '.cs': 'csharp',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.c': 'c',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  // Mobile
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.dart': 'dart',
  // Data & Config
  '.sql': 'sql',
  '.json': 'json',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.xml': 'xml',
  '.svg': 'xml',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.graphql': 'graphql',
  '.gql': 'graphql',
  // Shell & Scripts
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.ps1': 'powershell',
  '.bat': 'bat',
  '.cmd': 'bat',
  '.lua': 'lua',
  '.r': 'r'
}

ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Seleccionar carpeta para importar'
  })

  if (canceled || filePaths.length === 0) {
    return []
  }

  const dirPath = filePaths[0]
  const files = fs.readdirSync(dirPath)

  // SOLUCIÓN AL ERROR NEVER: Le asignamos el tipado explícito al arreglo
  const snippetsToImport: SnippetImport[] = []

  for (const file of files) {
    const filePath = path.join(dirPath, file)
    const stat = fs.statSync(filePath)

    if (stat.isFile()) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const ext = path.extname(file).toLowerCase()

        // Buscamos en el diccionario. Si no existe, por defecto es 'plaintext'
        let language = extensionToLanguage[ext] || 'plaintext'

        // Casos especiales (Archivos sin extensión o nombres específicos)
        const fileNameLower = file.toLowerCase()
        if (fileNameLower.includes('dockerfile')) {
          language = 'dockerfile'
        } else if (fileNameLower === 'makefile') {
          language = 'makefile'
        }

        snippetsToImport.push({
          title: file,
          description: file,
          content: content,
          language: language
        })
      } catch (error) {
        console.error(`Error leyendo el archivo ${file}:`, error)
      }
    }
  }

  return snippetsToImport
})
