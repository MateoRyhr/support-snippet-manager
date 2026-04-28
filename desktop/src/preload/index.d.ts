import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openDirectory: () => Promise<
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
