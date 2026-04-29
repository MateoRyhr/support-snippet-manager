import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      importFiles: (options: {
        mode: 'directory' | 'files'
        extensions: string[]
        recursive: boolean
      }) => Promise<
        Array<{
          title: string
          description: string
          content: string
          language: string
        }>
      >
    }
  }
}
