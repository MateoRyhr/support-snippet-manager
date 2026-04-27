// src/components/VerifyScreen.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi' // <-- Importamos nuestro hook

export const VerifyScreen = () => {
  const { login } = useAuth()
  const { request } = useApi() // <-- Instanciamos request

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // 1. Extraemos el token de la URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (!token) {
      setStatus('error')
      setErrorMessage('No se encontró el token de verificación en el enlace.')
      return
    }

    // 2. Enviamos el token a nuestro backend
    const verifyToken = async () => {
      try {
        // Usamos nuestro hook, que ya sabe a dónde apuntar y cómo parsear errores
        const data = await request<any>('/api/auth/verify', {
          method: 'POST',
          body: { token }
        })

        // 3. ¡Éxito!
        setStatus('success')

        setTimeout(() => {
          login(data.token, data.user)
        }, 2000)
      } catch (err: any) {
        setStatus('error')
        setErrorMessage(err.message)
      }
    }

    verifyToken()
  }, [login, request]) // <-- Agregamos request a las dependencias del useEffect

  return (
    <div className="flex h-screen bg-[#1e1e1e] items-center justify-center font-sans">
      <div className="bg-[#252526] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#333] text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-100">Verificando tu correo...</h2>
            <p className="text-gray-400 mt-2 text-sm">Por favor espera un momento.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-900/50">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-100">¡Correo verificado!</h2>
            <p className="text-gray-400 mt-2 text-sm">Preparando tu entorno de trabajo...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900/50">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-100">Error de verificación</h2>
            <p className="text-red-400 mt-2 text-sm">{errorMessage}</p>
            <button
              onClick={() => (window.location.href = '/')}
              className="mt-6 w-full bg-[#333] hover:bg-[#444] text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  )
}
