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

interface ImportOptions {
  mode: 'directory' | 'files'
  extensions: string[]
  recursive: boolean // NUEVA OPCIÓN
}

// FUNCIÓN RECURSIVA PARA LEER SUBCARPETAS
function getFilesRecursively(dir: string, extensions: string[], fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Si es una carpeta y no está en la lista de ignoradas, entramos a buscar más
      if (!IGNORE_DIRS.includes(file)) {
        getFilesRecursively(filePath, extensions, fileList)
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase()
      // Si no hay filtro, o si la extensión coincide, lo agregamos
      if (extensions.length === 0 || extensions.includes(ext)) {
        fileList.push(filePath)
      }
    }
  }

  return fileList
}

// Lista de carpetas que JAMÁS deberíamos intentar leer como código
const IGNORE_DIRS = ['.git', 'node_modules', '.godot', 'dist', 'build']

ipcMain.handle('dialog:importFiles', async (_, options: ImportOptions) => {
  const { mode, extensions, recursive } = options

  const dialogProperties: any[] =
    mode === 'directory' ? ['openDirectory'] : ['openFile', 'multiSelections']

  const dialogFilters =
    mode === 'files' && extensions.length > 0
      ? [{ name: 'Archivos Filtrados', extensions: extensions.map((e) => e.replace('.', '')) }]
      : []

  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: dialogProperties,
    filters: dialogFilters,
    title: mode === 'directory' ? 'Seleccionar carpeta' : 'Seleccionar archivos'
  })

  if (canceled || filePaths.length === 0) return []

  let filesToProcess: string[] = []

  // NUEVA LÓGICA DE DIRECTORIOS
  if (mode === 'directory') {
    const dirPath = filePaths[0]
    if (recursive) {
      filesToProcess = getFilesRecursively(dirPath, extensions)
    } else {
      // Búsqueda superficial (solo la carpeta actual)
      const dirFiles = fs.readdirSync(dirPath)
      for (const file of dirFiles) {
        const filePath = path.join(dirPath, file)
        if (fs.statSync(filePath).isFile()) {
          const ext = path.extname(file).toLowerCase()
          if (extensions.length === 0 || extensions.includes(ext)) {
            filesToProcess.push(filePath)
          }
        }
      }
    }
  } else {
    filesToProcess = filePaths
  }

  const snippetsToImport: any[] = []

  for (const filePath of filesToProcess) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const file = path.basename(filePath)
      const ext = path.extname(file).toLowerCase()

      let language = extensionToLanguage[ext] || 'plaintext'
      const fileNameLower = file.toLowerCase()
      if (fileNameLower.includes('dockerfile')) language = 'dockerfile'
      else if (fileNameLower === 'makefile') language = 'makefile'

      snippetsToImport.push({
        title: file,
        description: file,
        content: content,
        language: language
      })
    } catch (error) {
      console.error(`Error leyendo el archivo ${filePath}:`, error)
    }
  }

  return snippetsToImport
})
