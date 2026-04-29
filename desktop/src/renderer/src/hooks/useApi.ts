// src/hooks/useApi.ts
import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { Snippet, Folder } from '../types/models' // Asegúrate de importar tus modelos

const API_BASE_URL = 'https://code-snippet-manager-api.onrender.com'

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

// 1. NUEVO: Definimos la estructura exacta de lo que vamos a enviar a la API
export interface SnippetPayload {
  title: string
  content: string
  tags: string[]
  isPublic: boolean
  folderId: string | null
  language?: string // Lo dejamos opcional para cuando hagas el ImportButton
}

interface UseApiReturn {
  request: <T>(endpoint: string, options?: ApiOptions) => Promise<T>
  // 2. NUEVO: Firmas de las funciones específicas
  getSnippets: (folderId?: string | null) => Promise<Snippet[]>
  createSnippet: (payload: SnippetPayload) => Promise<Snippet>
  updateSnippet: (id: string, payload: Partial<SnippetPayload>) => Promise<Snippet>
  deleteSnippet: (id: string) => Promise<void>
  getFolders: () => Promise<Folder[]>
  createFolder: (id: string) => Promise<Folder>
  getCommunitySnippets: (search: string) => Promise<Snippet[]>
  updateFolder: (id: string, name: string) => Promise<Folder>
  deleteFolder: (id: string) => Promise<void>
}

export const useApi = (): UseApiReturn => {
  const { token } = useAuth()

  // --- MOTOR BASE DE PETICIONES ---
  const request = useCallback(
    async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
      const { headers, body, ...customConfig } = options

      const config: RequestInit = {
        ...customConfig,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers
        }
      }

      if (body) {
        config.body = JSON.stringify(body)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

      if (response.status === 204) {
        return null as T
      }

      const text = await response.text()
      let data

      try {
        data = text ? JSON.parse(text) : {}
      } catch (err) {
        throw new Error('Respuesta inválida del servidor. Verifica la ruta o el backend.')
      }

      if (!response.ok) {
        throw new Error(data.message || 'Error desconocido en la petición')
      }

      return data as T
    },
    [token] // Se quitó 'logout' si no se usa dentro de request, para evitar re-renders innecesarios
  )

  // --- FUNCIONES ESPECÍFICAS DE DOMINIO ---

  const getSnippets = useCallback(
    async (folderId?: string | null) => {
      const url = folderId ? `/api/snippets?folderId=${folderId}` : '/api/snippets'
      return request<Snippet[]>(url)
    },
    [request]
  )

  const createSnippet = useCallback(
    async (payload: SnippetPayload) => {
      return request<Snippet>('/api/snippets', {
        method: 'POST',
        body: payload
      })
    },
    [request]
  )

  const updateSnippet = useCallback(
    async (id: string, payload: Partial<SnippetPayload>) => {
      return request<Snippet>(`/api/snippets/${id}`, {
        method: 'PUT',
        body: payload
      })
    },
    [request]
  )

  const deleteSnippet = useCallback(
    async (id: string) => {
      return request<void>(`/api/snippets/${id}`, {
        method: 'DELETE'
      })
    },
    [request]
  )

  // --- FOLDERS ---
  const getFolders = useCallback(async () => {
    return request<Folder[]>('/api/folders')
  }, [request])

  const createFolder = useCallback(
    async (name: string) => {
      return request<Folder>('/api/folders', {
        method: 'POST',
        body: { name }
      })
    },
    [request]
  )

  // --- COMMUNITY ---
  const getCommunitySnippets = useCallback(
    async (search?: string) => {
      const endpoint = search
        ? `/api/snippets/community?search=${search}`
        : '/api/snippets/community'
      return request<Snippet[]>(endpoint)
    },
    [request]
  )

  const updateFolder = useCallback(
    async (id: string, name: string) => {
      return request<Folder>(`/api/folders/${id}`, {
        method: 'PUT',
        body: { name }
      })
    },
    [request]
  )

  const deleteFolder = useCallback(
    async (id: string) => {
      return request<void>(`/api/folders/${id}`, {
        method: 'DELETE'
      })
    },
    [request]
  )

  return {
    request,
    getSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    getCommunitySnippets,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder
  }
}
