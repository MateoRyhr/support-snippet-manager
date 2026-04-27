// src/hooks/useApi.ts
import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = 'https://code-snippet-manager-api.onrender.com'

// 1. Solución al 'any': Usamos 'unknown' que es la forma segura de decir "puede ser cualquier cosa"
interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

// 2. Solución al retorno: Definimos exactamente qué devuelve nuestro hook
interface UseApiReturn {
  request: <T>(endpoint: string, options?: ApiOptions) => Promise<T>
}

// 3. Aplicamos la interfaz al retorno del hook
export const useApi = (): UseApiReturn => {
  const { token, logout } = useAuth()

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

      // 4. Solución al try/catch: Lo eliminamos. Si fetch falla o nosotros lanzamos un Error,
      // la promesa simplemente será rechazada y el componente que llamó a request() la atrapará.

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

      // 1. Si el servidor dice "204 No Content", retornamos null sin intentar parsear
      if (response.status === 204) {
        return null as T
      }

      // 2. Leemos la respuesta como texto plano primero
      const text = await response.text()
      let data

      try {
        // 3. Intentamos convertir el texto a JSON solo si no está vacío
        data = text ? JSON.parse(text) : {}
      } catch (err) {
        // Si no se pudo parsear (ej: el server devolvió un HTML de error 404)
        throw new Error('Respuesta inválida del servidor. Verifica la ruta o el backend.')
      }

      // 4. Si la petición falló (errores 400 o 500)
      if (!response.ok) {
        throw new Error(data.message || 'Error desconocido en la petición')
      }

      return data as T
    },
    [token, logout]
  )

  return { request }
}
