// src/types/index.ts

export interface Tag {
  id?: string
  name: string
}

export interface User {
  id: string
  username: string
  email: string
}

export interface Folder {
  id: string
  name: string
  _count?: {
    snippets: number
  }
}

export interface Snippet {
  id: string
  title: string
  content: string
  tags: Tag[]
  author?: { username: string } // Opcional, útil para la comunidad
  isPublic: boolean
  folderId?: string | null
  createdAt: string
}
